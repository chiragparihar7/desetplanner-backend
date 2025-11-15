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

// ================= SPECIFIC ROUTES FIRST =================

// 🔥 Invoice download
router.get("/invoice/:id", downloadInvoice);

// 🔥 Public booking lookup
router.get("/lookup", lookupBooking);

// 🔥 My bookings (auth required)
router.get("/my", protect, getMyBookings);

// ================= CREATE ROUTE =================

// Create booking
router.post("/", optionalAuth, createBooking);

// ================= ADMIN ROUTES =================

// Admin get all
router.get("/", adminAuth, getAllBookings);

// Admin update
router.put("/:id/status", adminAuth, updateBookingStatus);

// ================= MUST ALWAYS BE LAST =================

// Single booking fetch
router.get("/:id", getBookingById);

export default router;
