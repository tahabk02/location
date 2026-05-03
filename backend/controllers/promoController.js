import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";

export const getAllPromos = async (req, res) => {
  try {
    const promos = getCollection("promos");
    const list = await promos.find({}).sort({ createdAt: -1 }).toArray();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Error fetching promos" });
  }
};

export const createPromo = async (req, res) => {
  try {
    const promos = getCollection("promos");
    const promoData = {
      title: req.body.title,
      description: req.body.description,
      discount: req.body.discount,
      code: req.body.code,
      endDate: req.body.endDate,
      active: true,
      createdAt: new Date()
    };
    const result = await promos.insertOne(promoData);
    res.status(201).json({ _id: result.insertedId, ...promoData });
  } catch (error) {
    res.status(500).json({ message: "Error creating promo" });
  }
};

export const deletePromo = async (req, res) => {
  try {
    const promos = getCollection("promos");
    await promos.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Promo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting promo" });
  }
};

export const togglePromo = async (req, res) => {
  try {
    const promos = getCollection("promos");
    const promo = await promos.findOne({ _id: new ObjectId(req.params.id) });
    await promos.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { active: !promo.active } }
    );
    res.json({ message: "Promo status toggled" });
  } catch (error) {
    res.status(500).json({ message: "Error toggling promo" });
  }
};
