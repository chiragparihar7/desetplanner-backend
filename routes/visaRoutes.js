import express from "express";
import {
  getAllVisas,
  getVisaBySlug,
  createVisa,
  updateVisa,
  deleteVisa,
  getVisasByCategory, // ✅ IMPORT THIS
} from "../controllers/visaController.js";

const router = express.Router();

// ✅ Add this before /:slug route (important for order)
router.get("/category/:slug", getVisasByCategory);

router.get("/", getAllVisas);
router.get("/:slug", getVisaBySlug);
router.post("/", createVisa);
router.put("/:id", updateVisa);
router.delete("/:id", deleteVisa);

export default router;
