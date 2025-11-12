import express from "express";
import {
  getAllVisas,
  getVisaBySlug,
  createVisa,
  updateVisa,
  deleteVisa,
  getVisasByCategory,
} from "../controllers/visaController.js";
import { upload } from "../config/cloudinary.js"; // 👈 same as sectionRoutes

const router = express.Router();

// 🟩 Visa Routes (with upload middleware)
router.post("/", upload.single("img"), createVisa); // ✅ handle file upload
router.put("/:id", upload.single("img"), updateVisa); // ✅ handle update + optional new image
router.get("/category/:slug", getVisasByCategory);
router.get("/", getAllVisas);
router.get("/:slug", getVisaBySlug);
router.delete("/:id", deleteVisa);

export default router;
