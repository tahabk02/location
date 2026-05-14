import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";

export const getInventory = async (req, res) => {
  try {
    const inventory = getCollection("inventory");
    const agencyId = req.user.agencyId || "default";
    const items = await inventory.find({ agencyId }).toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory", error: error.message });
  }
};

export const addItem = async (req, res) => {
  try {
    const inventory = getCollection("inventory");
    const agencyId = req.user.agencyId || "default";
    const newItem = { ...req.body, agencyId, createdAt: new Date() };
    const result = await inventory.insertOne(newItem);
    res.status(201).json({ _id: result.insertedId, ...newItem });
  } catch (error) {
    res.status(500).json({ message: "Error adding item", error: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const inventory = getCollection("inventory");
    const { id } = req.params;
    const agencyId = req.user.agencyId || "default";
    const result = await inventory.updateOne(
      { _id: new ObjectId(id), agencyId },
      { $set: req.body }
    );
    res.json({ message: "Item updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating item", error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const inventory = getCollection("inventory");
    const { id } = req.params;
    const agencyId = req.user.agencyId || "default";
    await inventory.deleteOne({ _id: new ObjectId(id), agencyId });
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item", error: error.message });
  }
};
