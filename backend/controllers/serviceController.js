import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";

export const getAllServices = async (req, res) => {
  try {
    const services = getCollection("services");
    const agencyId = req.user?.agencyId || "default";

    const query = req.user?.role === "superadmin" 
      ? {} 
      : { $or: [{ agencyId }, { agencyId: { $exists: false } }] };

    const list = await services.find(query).toArray();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Error fetching services", error: error.message });
  }
};

export const createService = async (req, res) => {
  try {
    const services = getCollection("services");
    const agencyId = req.user?.agencyId || "default";

    const result = await services.insertOne({
      ...req.body,
      agencyId,
      createdAt: new Date(),
    });
    res.status(201).json({ _id: result.insertedId, ...req.body, agencyId });
  } catch (error) {
    res.status(500).json({ message: "Error creating service", error: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const services = getCollection("services");
    const { id } = req.params;
    const agencyId = req.user?.agencyId || "default";

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.agencyId;

    const query = { _id: new ObjectId(id) };
    if (req.user?.role !== "superadmin") {
      query.$or = [{ agencyId }, { agencyId: { $exists: false } }];
    }

    const result = await services.updateOne(query, { $set: updateData });
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Service not found or unauthorized" });
    }

    res.json({ message: "Service updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating service", error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const services = getCollection("services");
    const { id } = req.params;
    const agencyId = req.user?.agencyId || "default";

    const query = { _id: new ObjectId(id) };
    if (req.user?.role !== "superadmin") {
      query.$or = [{ agencyId }, { agencyId: { $exists: false } }];
    }

    const result = await services.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Service not found or unauthorized" });
    }
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting service", error: error.message });
  }
};
