import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";

export const getAllReviews = async (req, res) => {
  try {
    const reviews = getCollection("reviews");
    const list = await reviews.find({}).sort({ createdAt: -1 }).toArray();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const reviews = getCollection("reviews");
    const { name, comment, rating, image, date } = req.body;
    
    const newReview = {
      name,
      comment,
      rating: Number(rating) || 5,
      image: image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      date: date || new Date().toISOString(),
      createdAt: new Date()
    };
    
    const result = await reviews.insertOne(newReview);
    res.status(201).json({ _id: result.insertedId, ...newReview });
  } catch (error) {
    res.status(500).json({ message: "Error creating review", error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const reviews = getCollection("reviews");
    const result = await reviews.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error: error.message });
  }
};
