// routes/visaRoutes.js
import express from "express";
import {
  getAllVisas,
  getVisaBySlug,
  createVisa,
  updateVisa,
  deleteVisa,
  getVisasByCategory,
} from "../controllers/visaController.js";

const router = express.Router();

// order important
router.get("/category/:slug", getVisasByCategory);

router.get("/", getAllVisas);
router.get("/:slug", getVisaBySlug);
router.post("/", createVisa);
router.put("/:id", updateVisa);
router.delete("/:id", deleteVisa);

export default router;
