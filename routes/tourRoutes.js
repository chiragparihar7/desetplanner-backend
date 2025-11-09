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

import { upload } from "../config/cloudinary.js"; // ✅ Cloudinary setup import

const router = express.Router();

// ✅ Use Cloudinary upload middleware instead of local multer
router.post(
  "/",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  addTour
);

router.get("/", getTours);
router.get("/category/:categoryName", getToursByCategory);
router.get("/:slug", getTourBySlug);
router.delete("/:id", deleteTour);

router.put(
  "/:id",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  updateTour
);

// ✅ Check availability route (same as before)
router.post("/check-availability", checkAvailability);

export default router;
