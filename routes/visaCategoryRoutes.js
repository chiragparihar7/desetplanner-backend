// routes/visaCategoryRoutes.js
import express from "express";
import {
  addVisaCategory,
  getVisaCategories,
  deleteVisaCategory,
  editVisaCategory,
  getVisasByCategory
} from "../controllers/visaCategoryController.js";

const router = express.Router();

// Admin can add new visa category
router.post("/", addVisaCategory);

// Fetch all visa categories
router.get("/", getVisaCategories);

// Admin can delete a visa category
router.delete("/:id", deleteVisaCategory);
router.get("/category/:slug", getVisasByCategory);

// Edit visa category by ID ✅
router.put("/:id", editVisaCategory);

export default router;
