import express from "express";
import {
  addHolidayCategory,
  getHolidayCategories,
  deleteHolidayCategory,
  editHolidayCategory,
  updateHolidayCategory,
  getHolidayPackagesByCategory,
} from "../controllers/holidayCategoryController.js";

const router = express.Router();

// Add new
router.post("/", addHolidayCategory);

// Get all
router.get("/", getHolidayCategories);

// Delete
router.delete("/:id", deleteHolidayCategory);

// Edit name
router.put("/:id", editHolidayCategory);

// Update + slug
router.put("/update/:id", updateHolidayCategory);

// Get packages by category slug
router.get("/category/:slug", getHolidayPackagesByCategory);

export default router;
