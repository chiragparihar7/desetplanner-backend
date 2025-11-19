import express from "express";
import {
  createHolidayTour,
  getAllHolidayTours,
  getHolidayTourById,
  updateHolidayTour,
  deleteHolidayTour,
  getToursByCategory,
  getHolidayPackageBySlug,
} from "../controllers/holidayTourController.js";

import { holidayTourUpload } from "../middleware/holidayTourUpload.js";

const router = express.Router();

// ⭐ Allow 50 dynamic itinerary image fields: itineraryImages_0 ... itineraryImages_49
const itineraryFields = Array.from({ length: 50 }).map((_, i) => ({
  name: `itineraryImages_${i}`,
  maxCount: 1,
}));

// ⭐ CREATE
router.post(
  "/create",
  holidayTourUpload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "sliderImages", maxCount: 20 },
    ...itineraryFields, // ⭐ VERY IMPORTANT
  ]),
  createHolidayTour
);

// ⭐ GET ALL
router.get("/all", getAllHolidayTours);

// ⭐ GET BY ID
router.get("/:id", getHolidayTourById);

// ⭐ UPDATE
router.put(
  "/update/:id",
  holidayTourUpload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "sliderImages", maxCount: 20 },
    ...itineraryFields, // ⭐ VERY IMPORTANT
  ]),
  updateHolidayTour
);

// ⭐ GET BY CATEGORY
router.get("/category/:slug", getToursByCategory);

// ⭐ GET BY SLUG (DETAIL PAGE)
router.get("/category/:categorySlug/:packageSlug", getHolidayPackageBySlug);

// ⭐ DELETE
router.delete("/delete/:id", deleteHolidayTour);

export default router;
