import express from "express";
import { getAllServices, createService, updateService, deleteService } from "../controllers/serviceController.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllServices);

// Admin only routes
router.post("/", authorize(["admin"]), createService);
router.put("/:id", authorize(["admin"]), updateService);
router.delete("/:id", authorize(["admin"]), deleteService);

export default router;
