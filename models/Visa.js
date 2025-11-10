import mongoose from "mongoose";

const visaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    overview: { type: String, required: true },
    details: { type: String },
    gallery: [{ type: String }],
    img: { type: String },

    // Quick Facts
    processingTime: { type: String, default: "2–5 Days" },
    visaType: { type: String, default: "Tourist Visa" },
    entryType: { type: String, default: "Single / Multiple" },
    validity: { type: String, default: "60 Days" },
    stayDuration: { type: String, default: "30 Days" },

    // Lists
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    documents: [{ type: String }],

    // Related visas
    relatedVisas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Visa" }],

    // ✅ ADD THIS FIELD (Visa Category Reference)
    visaCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VisaCategory", // must match model name
      required: true,
    },

    // Reviews
    reviews: [
      {
        name: String,
        date: String,
        rating: Number,
        review: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Visa", visaSchema);
