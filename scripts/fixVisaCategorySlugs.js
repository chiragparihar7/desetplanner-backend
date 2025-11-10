// scripts/fixVisaCategorySlugs.js
import mongoose from "mongoose";
import slugify from "slugify";
import dotenv from "dotenv";
import VisaCategory from "../models/visaCategoryModel.js";

dotenv.config();

async function fixSlugs() {
  try {
    // ✅ Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB Atlas");

    // ✅ Fetch all categories
    const categories = await VisaCategory.find();
    console.log(`📦 Found ${categories.length} categories`);

    for (const cat of categories) {
      if (!cat.slug || cat.slug.trim() === "") {
        // 🔹 Generate new slug from name
        cat.slug = slugify(cat.name, { lower: true, strict: true });
        await cat.save();
        console.log(`✅ Updated slug for: ${cat.name} → ${cat.slug}`);
      } else {
        console.log(`✔️ Already has slug: ${cat.name} → ${cat.slug}`);
      }
    }

    console.log("🎉 All category slugs fixed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error fixing slugs:", err);
    process.exit(1);
  }
}

fixSlugs();
