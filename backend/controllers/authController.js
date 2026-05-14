import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";

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
