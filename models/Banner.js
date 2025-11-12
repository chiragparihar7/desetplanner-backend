import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    price: { type: String },
    cta: { type: String },
    link: { type: String },
    desktopImage: { type: String, required: true },
    mobileImage: { type: String, required: true },
    order: { type: Number, default: 0 }, // for slide order
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
