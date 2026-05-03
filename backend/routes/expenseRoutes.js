import express from "express";
import { getAllExpenses, createExpense, deleteExpense } from "../controllers/expenseController.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, adminOnly, getAllExpenses);
router.post("/", auth, adminOnly, createExpense);
router.delete("/:id", auth, adminOnly, deleteExpense);

export default router;
