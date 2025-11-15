import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  getMyBookings,
  lookupBooking,
  downloadInvoice,
} from "../controllers/bookingController.js";

import { protect, adminAuth, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create
router.post("/", optionalAuth, createBooking);

// My bookings
router.get("/my", protect, getMyBookings);

// 🔥 Public booking lookup (BookingID + Email)
router.get("/lookup", lookupBooking);

// ⭐ ADD THIS
router.get("/invoice/:id", downloadInvoice);

// Admin all bookings
router.get("/", adminAuth, getAllBookings);

// 🔥 Single booking (should be at last)
router.get("/:id", getBookingById);


// Admin update
router.put("/:id/status", adminAuth, updateBookingStatus);

export default router;
