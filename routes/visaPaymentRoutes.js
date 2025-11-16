import express from "express";
import {
  createVisaPayment,
  visaPaymentWebhook,
  manualConfirmVisaPayment,
} from "../controllers/visaPaymentController.js";

const router = express.Router();

router.post("/create", createVisaPayment);
router.post("/webhook", visaPaymentWebhook);
router.post("/confirm/:bookingId", manualConfirmVisaPayment);

export default router;
