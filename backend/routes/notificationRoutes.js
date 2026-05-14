import express from "express";
import { getAdminNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authorize(["admin", "superadmin"]), getAdminNotifications);
router.put("/:id/read", authorize(["admin", "superadmin"]), markAsRead);
router.put("/read-all", authorize(["admin", "superadmin"]), markAllAsRead);

export default router;
