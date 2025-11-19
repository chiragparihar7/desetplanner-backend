import express from "express";
import {
  createHolidayTour,
  getAllHolidayTours,
  getHolidayTourById,
  updateHolidayTour,
  deleteHolidayTour,
  getToursByCategory,
  getHolidayPackageBySlug,   // ⭐ ADD
} from "../controllers/holidayTourController.js";

import { holidayTourUpload } from "../middleware/holidayTourUpload.js";

const router = express.Router();

// CREATE
router.post(
  "/create",
  holidayTourUpload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "sliderImages", maxCount: 10 },
    { name: "itineraryImages", maxCount: 30 },
  ]),
  createHolidayTour
);

// ALL TOURS
router.get("/all", getAllHolidayTours);

// SINGLE BY ID
router.get("/:id", getHolidayTourById);

// UPDATE
router.put(
  "/update/:id",
  holidayTourUpload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "sliderImages", maxCount: 10 },
    { name: "itineraryImages", maxCount: 30 },
  ]),
  updateHolidayTour
);

// GET TOURS BY CATEGORY
router.get("/category/:slug", getToursByCategory);

// ⭐ GET TOUR BY SLUG (DETAIL PAGE)
router.get("/category/:categorySlug/:packageSlug", getHolidayPackageBySlug);

// DELETE
router.delete("/delete/:id", deleteHolidayTour);

export default router;
