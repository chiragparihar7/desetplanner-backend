import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
  date: { type: Date, required: true },

  // ⭐ NEW adult/child fields
  guestsAdult: { type: Number, default: 0 },
  guestsChild: { type: Number, default: 0 },

  adultPrice: { type: Number, default: 0 },
  childPrice: { type: Number, default: 0 },
});

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [CartItemSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Cart", CartSchema);
