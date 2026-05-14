import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";

export const getAllServices = async (req, res) => {
  try {
    const services = getCollection("services");
    const list = await services.find({}).toArray();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Error fetching services", error: error.message });
  }
};

export const createService = async (req, res) => {
  try {
    const services = getCollection("services");
    const result = await services.insertOne({
      ...req.body,
      createdAt: new Date(),
    });
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: "Error creating service", error: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const services = getCollection("services");
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id;

    const result = await services.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.json({ message: "Service updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating service", error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const services = getCollection("services");
    await services.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting service", error: error.message });
  }
};
