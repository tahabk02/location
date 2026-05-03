import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";

export const getAllCars = async (req, res) => {
  try {
    const cars = getCollection("cars");
    const list = await cars.find({}).toArray();
    res.json(list);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cars", error: error.message });
  }
};

export const getCarById = async (req, res) => {
  try {
    const cars = getCollection("cars");
    const car = await cars.findOne({ _id: new ObjectId(req.params.id) });
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching car", error: error.message });
  }
};

export const createCar = async (req, res) => {
  try {
    console.log("📥 Creating car:", req.body.brand, req.body.model);
    const cars = getCollection("cars");
    const images = Array.isArray(req.body.images)
      ? req.body.images
      : req.body.images
        ? [req.body.images]
        : [];

    const carData = {
      brand: req.body.brand,
      model: req.body.model,
      category: req.body.category || "Luxe",
      pricePerDay: Number(req.body.pricePerDay),
      seats: Number(req.body.seats) || 5,
      fuel: req.body.fuel || "Essence",
      speed: req.body.speed || "250 km/h",
      image: req.body.image || images[0] || "",
      images,
      videoUrl: req.body.videoUrl || "",
      available: req.body.available !== undefined ? req.body.available : true,
      createdAt: new Date(),
    };

    const result = await cars.insertOne(carData);
    console.log("✅ Car created with ID:", result.insertedId);
    res.status(201).json({ _id: result.insertedId, ...carData });
  } catch (error) {
    console.error("❌ Error creating car:", error);
    res
      .status(500)
      .json({ message: "Error creating car", error: error.message });
  }
};

export const updateCar = async (req, res) => {
  try {
    const cars = getCollection("cars");
    const { id } = req.params;

    const updateData = { ...req.body };
    if (updateData.pricePerDay)
      updateData.pricePerDay = Number(updateData.pricePerDay);
    if (updateData.seats) updateData.seats = Number(updateData.seats);
    if (updateData.images && !Array.isArray(updateData.images)) {
      updateData.images = [updateData.images];
    }
    if (updateData.images && updateData.images.length > 0) {
      updateData.image = updateData.images[0];
    }
    delete updateData._id;

    await cars.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    res.json({ message: "Car updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating car", error: error.message });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const cars = getCollection("cars");
    await cars.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting car", error: error.message });
  }
};
