import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getSettings);
router.put("/", auth, adminOnly, updateSettings);

export default router;
