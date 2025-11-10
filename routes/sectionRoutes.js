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
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// 🟦 Sections
router.post("/", createSection);
router.get("/", getAllSections);
router.get("/:id", getSectionById);
router.put("/:id", updateSection);
router.delete("/:id", deleteSection);
router.patch("/:id/toggle", toggleSectionVisibility);

// 🟩 Section Items
router.post("/:sectionId/items", upload.single("img"), createSectionItem);
router.get("/:sectionId/items", getItemsBySection);
router.put("/:sectionId/items/:itemId", upload.single("img"), updateSectionItem);
router.delete("/:sectionId/items/:itemId", deleteSectionItem);

export default router;
