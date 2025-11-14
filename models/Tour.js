// ⭐ UPDATED FULL FILE BELOW

import mongoose from "mongoose";
import slugify from "slugify";

const tourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },

    // ⭐ UPDATED — adult & child pricing
    priceAdult: { type: Number, required: true },
    priceChild: { type: Number, default: null },

    duration: { type: String, required: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    mainImage: { type: String, required: true },
    galleryImages: [{ type: String }],

    highlights: [{ type: String }],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],

    timings: { type: String },

    cancellationPolicy: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],

    location: { type: String },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    maxGuests: { type: Number, default: 12 },

    termsAndConditions: { type: String, default: "" },

    relatedTours: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour",
      },
    ],
  },
  { timestamps: true }
);

tourSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

const Tour = mongoose.model("Tour", tourSchema);
export default Tour;
