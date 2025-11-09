import express from "express";
import {
  addTour,
  getTours,
  getTourBySlug,
  deleteTour,
  getToursByCategory,
  updateTour,
  checkAvailability,
} from "../controllers/tourController.js";

import { upload } from "../config/cloudinary.js"; // ✅ Use single Cloudinary config

const router = express.Router();

// 🟢 Add Tour
router.post(
  "/",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  addTour
);

// 🟡 Update Tour
router.put(
  "/:id",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  updateTour
);

// 🟠 Get Routes
router.get("/", getTours);
router.get("/category/:categoryName", getToursByCategory);
router.get("/:slug", getTourBySlug);
router.delete("/:id", deleteTour);

// 🔵 Check Availability
router.post("/check-availability", checkAvailability);

export default router;
