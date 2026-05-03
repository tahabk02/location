import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";

export const getAllExpenses = async (req, res) => {
  try {
    const expenses = getCollection("expenses");
    const list = await expenses.find({}).sort({ date: -1 }).toArray();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses", error: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const expenses = getCollection("expenses");
    const expenseData = {
      title: req.body.title,
      amount: Number(req.body.amount),
      category: req.body.category,
      date: req.body.date,
      carId: req.body.carId || null,
      createdAt: new Date()
    };
    const result = await expenses.insertOne(expenseData);
    res.status(201).json({ _id: result.insertedId, ...expenseData });
  } catch (error) {
    res.status(500).json({ message: "Error creating expense", error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expenses = getCollection("expenses");
    await expenses.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error: error.message });
  }
};
