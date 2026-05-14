import express from "express";
import { getAllAgencies, getAgencyStats, createAgency } from "../controllers/agencyController.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

const superAdminOnly = authorize(["superadmin"]);

router.get("/all", superAdminOnly, getAllAgencies);
router.get("/stats", superAdminOnly, getAgencyStats);
router.post("/", superAdminOnly, createAgency);

export default router;
