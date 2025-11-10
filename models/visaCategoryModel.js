// models/visaCategoryModel.js
import mongoose from "mongoose";
import slugify from "slugify";

const visaCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

// Automatically generate slug from name
visaCategorySchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("VisaCategory", visaCategorySchema);
