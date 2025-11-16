import express from "express";
import {
  createSection,
  getAllSections,
  getSectionById,
  updateSection,
  deleteSection,
  toggleSectionVisibility,
  createSectionItem,
  getItemsBySection,
  updateSectionItem,
  deleteSectionItem,
} from "../controllers/sectionController.js";

import { sectionUpload } from "../middleware/sectionUpload.js"; // ✅ NEW CORRECT IMPORT

const router = express.Router();

/* ---------------------------------------------
   🟦 SECTION ROUTES
--------------------------------------------- */

// ➕ Create Section
router.post("/", createSection);

// 📦 Get All Sections
router.get("/", getAllSections);

// 🔍 Get Section by ID
router.get("/:id", getSectionById);

// ✏️ Update Section
router.put("/:id", updateSection);

// ❌ Delete Section
router.delete("/:id", deleteSection);

// 👁 Toggle Section Visibility
router.patch("/:id/toggle", toggleSectionVisibility);


/* ---------------------------------------------
   🟩 SECTION ITEMS ROUTES (WITH IMAGE UPLOAD)
--------------------------------------------- */

// ➕ Create new item
router.post(
  "/:sectionId/items",
  sectionUpload.single("img"),   // 🟢 Image upload middleware
  createSectionItem
);

// 📦 Get Items of a Section
router.get("/:sectionId/items", getItemsBySection);

// ✏️ Update Item (optional image)
router.put(
  "/:sectionId/items/:itemId",
  sectionUpload.single("img"),   // 🟢 Handles new uploaded image
  updateSectionItem
);

// ❌ Delete Item
router.delete("/:sectionId/items/:itemId", deleteSectionItem);

export default router;
