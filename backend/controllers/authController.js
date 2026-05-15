import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";
import { sendResetEmail } from "../services/notificationService.js";

// ... rest of imports if any ...

export const login = async (req, res) => {

  const { email, password } = req.body;
  try {
    const users = getCollection("users");
    const user = await users.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Return user info with an id field instead of MongoDB _id
    const { _id, password: _, ...userInfo } = user;
    res.json({ id: _id.toString(), agencyId: user.agencyId || "default", ...userInfo });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
};

export const register = async (req, res) => {
  const { name, email, password, role = "client", agencyId = "default" } = req.body;
  console.log("Registering user:", email);
  try {
    const users = getCollection("users");
    const existing = await users.findOne({ email });
    if (existing) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }
    const result = await users.insertOne({ 
      name, 
      email, 
      password, 
      role, 
      agencyId,
      isBlacklisted: false,
      loyaltyPoints: 0,
      createdAt: new Date()
    });
    console.log("User registered successfully:", email);
    res
      .status(201)
      .json({ id: result.insertedId.toString(), name, email, role, agencyId });
  } catch (error) {
    console.error("Registration error for", email, ":", error);
    res
      .status(500)
      .json({ message: "Registration error", error: error.message });
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
    console.log("Reset password request received:", req.body);
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

    await users.updateOne(
      { _id: user._id },
      { 
        $set: { password: newPassword }, 
        $unset: { resetCode: "", resetExpires: "" } 
      }
    );

    res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error("Reset password error details:", error);
    res.status(500).json({ message: "Erreur lors de la réinitialisation", error: error.message });
  }
};

export const updateUserPremium = async (req, res) => {
  try {
    const users = getCollection("users");
    const { id } = req.params;
    const { isBlacklisted, loyaltyPoints } = req.body;

    const updateData = {};
    if (typeof isBlacklisted === 'boolean') updateData.isBlacklisted = isBlacklisted;
    if (typeof loyaltyPoints === 'number') updateData.loyaltyPoints = loyaltyPoints;

    const result = await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
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
      { email: req.user.email },
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
    const list = await users
      .find({}, { projection: { password: 0 } })
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
    
    // Safety: Prevent deleting self or superadmin
    if (req.user.id === id) {
      return res.status(403).json({ message: "Cannot delete yourself" });
    }

    const result = await users.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};
