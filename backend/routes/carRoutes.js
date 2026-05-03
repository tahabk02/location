import express from "express";
import { getAllCars, getCarById, createCar, updateCar, deleteCar } from "../controllers/carController.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllCars);
router.get("/:id", getCarById);

// Admin only routes
router.post("/", authorize(["admin"]), createCar);
router.put("/:id", authorize(["admin"]), updateCar);
router.delete("/:id", authorize(["admin"]), deleteCar);

export default router;
