// scripts/fixHolidayTourSlugs.js
import mongoose from "mongoose";
import slugify from "slugify";
import dotenv from "dotenv";
import HolidayTour from "../models/HolidayTour.js";

dotenv.config();

async function fixSlugs() {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB Atlas");

    // Fetch all holiday tours
    const tours = await HolidayTour.find();
    console.log(`📦 Found ${tours.length} holiday tours`);

    for (const tour of tours) {
      if (!tour.slug || tour.slug.trim() === "") {
        tour.slug = slugify(tour.title, { lower: true, strict: true });
        await tour.save();
        console.log(`🔧 Fixed slug: ${tour.title} → ${tour.slug}`);
      } else {
        console.log(`✔️ Already has slug: ${tour.title} → ${tour.slug}`);
      }
    }

    console.log("🎉 All holiday tour slugs fixed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error fixing slugs:", err);
    process.exit(1);
  }
}

fixSlugs();
