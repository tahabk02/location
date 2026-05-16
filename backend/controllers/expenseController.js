import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";

export const getAllExpenses = async (req, res) => {
  try {
    const expenses = getCollection("expenses");
    const agencyId = req.user.agencyId || "default";
    
    const query = req.user.role === "superadmin" 
      ? {} 
      : { $or: [{ agencyId }, { agencyId: { $exists: false } }] };

    const list = await expenses.find(query).sort({ date: -1 }).toArray();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses", error: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const expenses = getCollection("expenses");
    const agencyId = req.user.agencyId || "default";
    
    const expenseData = {
      agencyId,
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
    const { id } = req.params;
    const agencyId = req.user.agencyId || "default";

    const query = { _id: new ObjectId(id) };
    if (req.user.role !== "superadmin") {
      query.$or = [{ agencyId }, { agencyId: { $exists: false } }];
    }

    const result = await expenses.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error: error.message });
  }
};
