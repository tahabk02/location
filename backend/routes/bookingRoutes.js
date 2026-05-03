import express from "express";
import { createBooking, getAllBookings, getMyBookings, updateBookingStatus } from "../controllers/bookingController.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authorize(["client", "admin"]), createBooking);
router.get("/my-bookings", authorize(["client"]), getMyBookings);

// Admin only routes
router.get("/all", authorize(["admin"]), getAllBookings);
router.put("/:id/status", authorize(["admin"]), updateBookingStatus);

export default router;
