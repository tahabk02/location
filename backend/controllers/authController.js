import { getCollection } from "../config/db.js";

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
    res.json({ id: _id.toString(), ...userInfo });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
};

export const register = async (req, res) => {
  const { name, email, password, role = "client" } = req.body;
  console.log("Registering user:", email);
  try {
    const users = getCollection("users");
    const existing = await users.findOne({ email });
    if (existing) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }
    const result = await users.insertOne({ name, email, password, role });
    console.log("User registered successfully:", email);
    res
      .status(201)
      .json({ id: result.insertedId.toString(), name, email, role });
  } catch (error) {
    console.error("Registration error for", email, ":", error);
    res
      .status(500)
      .json({ message: "Registration error", error: error.message });
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
