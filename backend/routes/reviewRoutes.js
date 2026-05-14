import express from "express";
import { getAllReviews, createReview, deleteReview } from "../controllers/reviewController.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllReviews);
router.post("/", createReview);
router.delete("/:id", authorize(["admin"]), deleteReview);

export default router;
