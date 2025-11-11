// models/Booking.js
import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    // ✅ Logged-in User (optional for guest booking)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // ✅ Guest Info (only if user not logged in)
    guestName: { type: String, trim: true },
    guestEmail: { type: String, trim: true, lowercase: true },
    guestContact: { type: String, trim: true },

    // ✅ Booking Items (Tour details)
    items: [
      {
        tourId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tour",
          required: true,
        },
        date: { type: Date, required: true },
        guests: { type: Number, required: true },
        pickupPoint: { type: String, trim: true },
        dropPoint: { type: String, trim: true },
      },
    ],

    // ✅ Payment & Pricing Info
    totalPrice: { type: Number, required: true },

    // ✅ Additional Info
    specialRequest: { type: String, trim: true },

    // ✅ Payment fields (added)
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    transactionId: {
      type: String,
      default: null,
    },
    paymentInfo: {
      type: Object,
      default: {},
    },

    // ✅ Booking Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending", // 👈 initially pending until payment success
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);
