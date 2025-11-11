import express from "express";
import {
  createPayment,
  handleWebhook,
  manualConfirmPayment, // 👈 added for local testing
} from "../controllers/paymentController.js";

const router = express.Router();

// ✅ Create payment (after booking created)
router.post("/create", createPayment);

// ✅ Webhook from Paymennt (for live mode)
router.post("/webhook", express.raw({ type: "*/*" }), handleWebhook);

// ✅ Temporary manual confirm (for local testing)
router.put("/confirm/:bookingId", manualConfirmPayment);

export default router;
