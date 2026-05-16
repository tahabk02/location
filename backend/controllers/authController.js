import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";
import { sendResetEmail } from "../services/notificationService.js";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// ... rest of imports if any ...

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const users = getCollection("users");
    // Support both exact match and lowercase match for backward compatibility
    const user = await users.findOne({ 
      $or: [
        { email: email },
        { email: email.toLowerCase() },
        { email: email.trim() }
      ]
    });

    if (!user) {
      console.log(`Login failed: User not found for ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptErr) {
      console.warn("Bcrypt compare failed, checking plain text:", bcryptErr.message);
    }

    if (!isMatch) {
      // For migration: if it matches plain text, re-hash it
      if (password === user.password) {
        console.log(`Migrating user ${email} to hashed password`);
        const hashedPassword = await bcrypt.hash(password, 10);
        await users.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
        isMatch = true;
      } else {
        console.log(`Login failed: Password mismatch for ${email}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, agencyId: user.agencyId || "default" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { _id, password: _, ...userInfo } = user;
    res.json({ token, id: _id.toString(), ...userInfo });
  } catch (error) {
    console.error("Critical Login Error:", error);
    res.status(500).json({ message: "Login error", details: error.message });
  }
};

export const register = async (req, res) => {
  const { name, email, password, role = "client", agencyId = "default" } = req.body;
  try {
    const users = getCollection("users");
    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ 
      name, 
      email: email.toLowerCase(), 
      password: hashedPassword, 
      role, 
      agencyId,
      isBlacklisted: false,
      loyaltyPoints: 0,
      createdAt: new Date()
    });

    const token = jwt.sign(
      { id: result.insertedId, email: email.toLowerCase(), role, agencyId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token, id: result.insertedId.toString(), name, email, role, agencyId });
  } catch (error) {
    res.status(500).json({ message: "Registration error", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email: rawEmail } = req.body || {};
    if (!rawEmail) {
      return res.status(400).json({ message: "L'email est requis" });
    }
    const email = rawEmail.trim().toLowerCase();

    const users = getCollection("users");
    const user = await users.findOne({ email });
    
    // Pour la sécurité (prévention de l'énumération d'emails),
    // on renvoie toujours un message de succès même si l'utilisateur n'existe pas.
    if (!user) {
      return res.json({ 
        message: "Si un compte est associé à cet email, un code de réinitialisation sera envoyé."
      });
    }

    // Générer un code de réinitialisation à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 3600000); // 1 heure

    const result = await users.updateOne(
      { _id: user._id },
      { $set: { resetCode, resetExpires } }
    );

    if (result.matchedCount === 0) {
      throw new Error("Impossible de mettre à jour l'utilisateur");
    }

    // Envoi de l'email
    const emailSent = await sendResetEmail(email, resetCode);

    if (!emailSent) {
      // On ne renvoie pas d'erreur 500 ici pour rester discret,
      // mais on log l'erreur côté serveur.
      console.error(`Failed to send reset email to ${email}`);
    }

    res.json({ 
      message: "Si un compte est associé à cet email, un code de réinitialisation sera envoyé."
    });
  } catch (error) {
    console.error("Forgot password error details:", error);
    res.status(500).json({ message: "Une erreur est survenue. Veuillez réessayer plus tard." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email: rawEmail, code, newPassword } = req.body;
    if (!rawEmail || !code || !newPassword) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }
    const email = rawEmail.trim().toLowerCase();

    const users = getCollection("users");
    const user = await users.findOne({ 
      email, 
      resetCode: code,
      resetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Code invalide ou expiré" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await users.updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword }, 
        $unset: { resetCode: "", resetExpires: "" } 
      }
    );

    res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la réinitialisation", error: error.message });
  }
};

export const updateUserPremium = async (req, res) => {
  try {
    const users = getCollection("users");
    const { id } = req.params;
    const { isBlacklisted, loyaltyPoints } = req.body;
    const agencyId = req.user.agencyId || "default";

    const updateData = {};
    if (typeof isBlacklisted === 'boolean') updateData.isBlacklisted = isBlacklisted;
    if (typeof loyaltyPoints === 'number') updateData.loyaltyPoints = loyaltyPoints;

    const query = { _id: new ObjectId(id) };
    if (req.user.role !== "superadmin") {
      query.agencyId = agencyId;
    }

    const result = await users.updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found or unauthorized" });
    }

    res.json({ message: "User premium status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating user premium status", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const users = getCollection("users");
    const user = await users.findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } },
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Profile error", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = getCollection("users");
    const agencyId = req.user.agencyId || "default";
    
    const query = req.user.role === "superadmin" 
      ? {} 
      : { $or: [{ agencyId }, { agencyId: { $exists: false } }] };

    const list = await users
      .find(query, { projection: { password: 0 } })
      .toArray();
    res.json(list);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const users = getCollection("users");
    const { id } = req.params;
    const agencyId = req.user.agencyId || "default";
    
    // Safety: Prevent deleting self
    if (req.user.id === id) {
      return res.status(403).json({ message: "Cannot delete yourself" });
    }

    const query = { _id: new ObjectId(id) };
    if (req.user.role !== "superadmin") {
      query.$or = [{ agencyId }, { agencyId: { $exists: false } }];
    }

    const result = await users.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found or unauthorized" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};
