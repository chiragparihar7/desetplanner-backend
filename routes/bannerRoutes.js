import express from "express";
import {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// 📤 Upload both desktop & mobile images
const uploadFields = upload.fields([
  { name: "desktopImage", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 },
]);

router.post("/", uploadFields, createBanner);
router.get("/", getAllBanners);
router.put("/:id", uploadFields, updateBanner);
router.delete("/:id", deleteBanner);

export default router;
