import dotenv from "dotenv";
import mongoose from "mongoose";
import Visa from "../models/Visa.js";
import VisaCategory from "../models/visaCategoryModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function fixVisaCategories() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Map each visa title keyword to a category slug or name
    const categoryMap = {
      "tourist": "tourist-visa",
      "business": "business-visa",
      "transit": "transit-visa",
      "student": "student-visa",
    };

    const visas = await Visa.find();
    for (const visa of visas) {
      if (visa.category) continue; // already linked ✅

      let matchedSlug = null;
      for (const keyword in categoryMap) {
        if (visa.title.toLowerCase().includes(keyword)) {
          matchedSlug = categoryMap[keyword];
          break;
        }
      }

      if (!matchedSlug) {
        console.warn(`⚠️ No category match for: ${visa.title}`);
        continue;
      }

      const category = await VisaCategory.findOne({ slug: matchedSlug });
      if (!category) {
        console.warn(`❌ Category not found: ${matchedSlug}`);
        continue;
      }

      visa.category = category._id;
      await visa.save();
      console.log(`✅ Linked "${visa.title}" → ${category.name}`);
    }

    console.log("🎯 All visas processed successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error fixing visa categories:", err);
    process.exit(1);
  }
}

fixVisaCategories();
