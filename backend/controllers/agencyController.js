import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";

export const getAllAgencies = async (req, res) => {
  try {
    const settings = getCollection("settings");
    // In our model, each agency has a document in settings
    const list = await settings.find({}).toArray();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Error fetching agencies", error: error.message });
  }
};

export const createAgency = async (req, res) => {
  try {
    const users = getCollection("users");
    const settings = getCollection("settings");
    const { name, email, password, address, phone } = req.body;

    // 1. Check if email exists
    const existing = await users.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // 2. Create Admin User
    const agencyId = new ObjectId().toString();
    const newUser = {
      name,
      email,
      password, // In a real app, hash this!
      role: "admin",
      agencyId,
      createdAt: new Date()
    };
    await users.insertOne(newUser);

    // 3. Create initial settings for the agency
    const newSettings = {
      agencyId,
      name,
      email,
      phone: phone || "",
      address: address || "",
      currency: "DH",
      taxRate: "20",
      logoUrl: "",
      galleryImages: [],
      galleryVideoUrl: ""
    };
    await settings.insertOne(newSettings);

    res.status(201).json({ message: "Agency created successfully", agencyId });
  } catch (error) {
    res.status(500).json({ message: "Error creating agency", error: error.message });
  }
};

export const getAgencyStats = async (req, res) => {
  try {
    const settings = getCollection("settings");
    const cars = getCollection("cars");
    const bookings = getCollection("bookings");
    const users = getCollection("users");

    const totalAgencies = await settings.countDocuments({});
    const totalCars = await cars.countDocuments({});
    const totalBookings = await bookings.countDocuments({});
    const totalUsers = await users.countDocuments({});

    res.json({
      totalAgencies,
      totalCars,
      totalBookings,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching agency stats", error: error.message });
  }
};
