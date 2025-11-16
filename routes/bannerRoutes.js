import express from "express";
import {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";

import { sectionUpload } from "../middleware/sectionUpload.js"; // ✅ UPDATED

const router = express.Router();

// 📤 Upload desktop + mobile banner images
const uploadFields = sectionUpload.fields([
  { name: "desktopImage", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 },
]);

// ➕ Create banner
router.post("/", uploadFields, createBanner);

// 📦 Get all banners
router.get("/", getAllBanners);

// ✏️ Update banner
router.put("/:id", uploadFields, updateBanner);

// ❌ Delete banner
router.delete("/:id", deleteBanner);

export default router;
