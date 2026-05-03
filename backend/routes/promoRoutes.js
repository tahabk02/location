import express from "express";
import { getAllPromos, createPromo, deletePromo, togglePromo } from "../controllers/promoController.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllPromos);
router.post("/", auth, adminOnly, createPromo);
router.delete("/:id", auth, adminOnly, deletePromo);
router.patch("/:id/toggle", auth, adminOnly, togglePromo);

export default router;
