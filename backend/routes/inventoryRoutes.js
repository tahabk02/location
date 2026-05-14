import express from "express";
import { getInventory, addItem, updateItem, deleteItem } from "../controllers/inventoryController.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authorize(["admin"]), getInventory);
router.post("/", authorize(["admin"]), addItem);
router.put("/:id", authorize(["admin"]), updateItem);
router.delete("/:id", authorize(["admin"]), deleteItem);

export default router;
