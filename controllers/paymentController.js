import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import axios from "axios";
import crypto from "crypto";

// ✅ Step 1: Create payment session

export const createPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId)
      return res.status(400).json({ success: false, message: "Booking ID is required" });

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    const payload = {
      amount: booking.totalPrice,
      currency: "AED",
      reference: booking._id.toString(),
      customer: {
        name: booking.guestName || "Guest",
        email: booking.guestEmail || "guest@example.com",
        phone: booking.guestContact || "0000000000",
      },
      return_url: `${process.env.FRONTEND_URL}/payment-result?status=success&reference=${booking._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-result?status=failed&reference=${booking._id}`,
    };

    console.log("📤 Sending payment request to Paymennt:", payload);

    const response = await axios.post(
      process.env.PAYMENNT_API_URL || "https://merchant.paymennt.com/api/v2/payment",
      payload,
      {
        headers: {
          "X-Paymennt-Api-Key": process.env.PAYMENT_API_KEY,
          "X-Paymennt-Api-Secret": process.env.PAYMENT_SECRET_KEY,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    console.log("✅ Paymennt response:", response.data);

    return res.status(200).json({
      success: true,
      paymentLink:
        response.data?.transaction?.url ||
        response.data?.checkout_url ||
        response.data?.payment_url ||
        null,
      raw: response.data,
    });
  } catch (err) {
    console.error("🔥 createPayment error:", err.message);
    if (err.response) {
      console.error("🔥 Paymennt response status:", err.response.status);
      console.error("🔥 Paymennt response data:", err.response.data);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
      error: err.response?.data || err.message,
    });
  }
};

// ✅ Step 2: Handle webhook from Paymennt
export const handleWebhook = async (req, res) => {
  try {
    const payload = req.body;
    const sigHeader = req.headers["x-paymennt-signature"];
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;

    // verify signature (if docs provide)
    // const expectedSig = crypto.createHmac("sha256", webhookSecret).update(JSON.stringify(payload)).digest("hex");
    // if (sigHeader !== expectedSig) return res.status(400).send("Invalid signature");

    const event = typeof payload === "string" ? JSON.parse(payload) : payload;

    if (event.type === "payment.success") {
      const ref = event.data.reference;
      const paymentData = event.data;

      const payment = await Payment.findOneAndUpdate(
        { bookingId: ref },
        { status: "paid", paymentInfo: paymentData },
        { new: true }
      );

      await Booking.findByIdAndUpdate(ref, {
        status: "confirmed",
      });

      console.log("✅ Payment success:", payment._id);
    }

    if (event.type === "payment.failed") {
      const ref = event.data.reference;
      await Payment.findOneAndUpdate({ bookingId: ref }, { status: "failed" });
      await Booking.findByIdAndUpdate(ref, { status: "cancelled" });
      console.log("❌ Payment failed for booking:", ref);
    }

    res.status(200).send("ok");
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).send("Webhook error");
  }
};

// 🟢 Manual confirm route (for local testing without webhook)
export const manualConfirmPayment = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID missing" });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: "confirmed",
        paymentStatus: "paid",
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    console.log("✅ Booking manually confirmed:", booking._id);

    res.status(200).json({
      success: true,
      message: "Booking confirmed successfully (manual)",
      booking,
    });
  } catch (err) {
    console.error("❌ Manual confirm error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error during manual confirm",
    });
  }
};
