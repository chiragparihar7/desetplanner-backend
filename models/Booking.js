// ⭐ UPDATED COMPLETE BOOKING MODEL

import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    // User (optional)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // Guest Info
    guestName: { type: String, trim: true },
    guestEmail: { type: String, trim: true, lowercase: true },
    guestContact: { type: String, trim: true },

    // ⭐ UPDATED — per booking item adult + child count + price
    items: [
      {
        tourId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tour",
          required: true,
        },
        date: { type: Date, required: true },

        // ⭐ NEW FIELDS
        adultCount: { type: Number, required: true },
        childCount: { type: Number, default: 0 },

        // ⭐ Prices saved at booking time
        adultPrice: { type: Number, required: true },
        childPrice: { type: Number, default: 0 },

        // Other info
        pickupPoint: { type: String, trim: true },
        dropPoint: { type: String, trim: true },
      },
    ],

    // ⭐ UPDATED — totalPrice after adult + child calculation
    totalPrice: { type: Number, required: true },

    specialRequest: { type: String },

    // Payment Info
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    transactionId: { type: String, default: null },
    paymentInfo: { type: Object, default: {} },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);
