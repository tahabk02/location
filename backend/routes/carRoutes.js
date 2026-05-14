import express from "express";
import { getAllCars, getCarById, createCar, updateCar, deleteCar, updateCarStatus, getMaintenanceAlerts } from "../controllers/carController.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllCars);
router.get("/alerts", authorize(["admin"]), getMaintenanceAlerts);
router.get("/:id", getCarById);

// Admin only routes
router.post("/", authorize(["admin"]), createCar);
router.patch("/:id/status", authorize(["admin"]), updateCarStatus);
router.put("/:id", authorize(["admin"]), updateCar);
router.delete("/:id", authorize(["admin"]), deleteCar);

export default router;
