// controllers/visaController.js
import Visa from "../models/Visa.js";
import VisaCategory from "../models/visaCategoryModel.js";
import slugify from "slugify";

// ✅ helper: har field ko array bana do
const toArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string") {
    // agar comma separated aa jaye
    if (val.trim().startsWith("[")) {
      // json string
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [val];
      } catch {
        return [val].filter(Boolean);
      }
    }
    // "item1, item2" wala case
    if (val.includes(",")) {
      return val
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return [val].filter(Boolean);
  }
  return [];
};

// ✅ Get all visas (with optional categorySlug/category filter)
export const getAllVisas = async (req, res) => {
  try {
    const { category, categorySlug } = req.query; // e.g. ?categorySlug=uae
    let filter = {};

    if (category) {
      filter.visaCategory = category;
    }

    if (categorySlug) {
      const foundCategory = await VisaCategory.findOne({ slug: categorySlug });
      if (!foundCategory) {
        return res.status(404).json({ message: "Visa category not found" });
      }
      filter.visaCategory = foundCategory._id;
    }

    const visas = await Visa.find(filter)
      .populate("visaCategory", "name slug")
      .sort({ createdAt: -1 });

    res.json(visas);
  } catch (err) {
    console.error("❌ Error fetching visas:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get single visa by slug (with visaCategory populated)
export const getVisaBySlug = async (req, res) => {
  try {
    const visa = await Visa.findOne({ slug: req.params.slug }).populate(
      "visaCategory",
      "name slug"
    );
    if (!visa) return res.status(404).json({ message: "Visa not found" });
    res.json(visa);
  } catch (err) {
    console.error("❌ Error fetching visa by slug:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Add new visa
export const createVisa = async (req, res) => {
  try {
    const {
      title,
      price,
      overview,
      // details, // ❌ ab nahi
      gallery,
      img,
      processingTime,
      visaType,
      entryType,
      validity,
      stayDuration,
      inclusions,
      exclusions,
      documents,
      relatedVisas,
      visaCategory,
      howToApply,
      termsAndConditions,
    } = req.body;

    const overviewArr = toArray(overview);

    // 🔸 Required field validation
    if (!title || !price || !visaCategory || !overviewArr.length) {
      return res.status(400).json({
        message:
          "Title, Price, Visa Category, and at least 1 Overview point are required.",
      });
    }

    // 🔍 Check if category exists
    const foundCategory = await VisaCategory.findById(visaCategory);
    if (!foundCategory)
      return res.status(404).json({ message: "Visa category not found" });

    // 🧠 Create slug
    const slug = slugify(title, { lower: true, strict: true });

    const newVisa = new Visa({
      title,
      slug,
      price,
      overview: overviewArr,
      // details, // ❌
      gallery: toArray(gallery),
      img,
      processingTime,
      visaType,
      entryType,
      validity,
      stayDuration,
      inclusions: toArray(inclusions),
      exclusions: toArray(exclusions),
      documents: toArray(documents),
      relatedVisas: toArray(relatedVisas),
      howToApply: toArray(howToApply),
      termsAndConditions: toArray(termsAndConditions),
      visaCategory: foundCategory._id,
    });

    await newVisa.save();

    const populatedVisa = await Visa.findById(newVisa._id).populate(
      "visaCategory",
      "name slug"
    );

    res.status(201).json({
      message: "Visa created successfully",
      visa: populatedVisa,
    });
  } catch (err) {
    console.error("❌ Error creating visa:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update visa
export const updateVisa = async (req, res) => {
  try {
    const {
      title,
      visaCategory,
      overview,
      gallery,
      inclusions,
      exclusions,
      documents,
      relatedVisas,
      howToApply,
      termsAndConditions,
      // details, // ❌
    } = req.body;

    const updateData = { ...req.body };

    // overview ko normalize
    if (typeof overview !== "undefined") {
      updateData.overview = toArray(overview);
    }
    if (typeof gallery !== "undefined") {
      updateData.gallery = toArray(gallery);
    }
    if (typeof inclusions !== "undefined") {
      updateData.inclusions = toArray(inclusions);
    }
    if (typeof exclusions !== "undefined") {
      updateData.exclusions = toArray(exclusions);
    }
    if (typeof documents !== "undefined") {
      updateData.documents = toArray(documents);
    }
    if (typeof relatedVisas !== "undefined") {
      updateData.relatedVisas = toArray(relatedVisas);
    }
    if (typeof howToApply !== "undefined") {
      updateData.howToApply = toArray(howToApply);
    }
    if (typeof termsAndConditions !== "undefined") {
      updateData.termsAndConditions = toArray(termsAndConditions);
    }

    // slug update
    if (title) {
      updateData.slug = slugify(title, { lower: true, strict: true });
    }

    // category validate
    if (visaCategory) {
      const foundCategory = await VisaCategory.findById(visaCategory);
      if (!foundCategory)
        return res.status(404).json({ message: "Visa category not found" });
      updateData.visaCategory = foundCategory._id;
    }

    const updatedVisa = await Visa.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("visaCategory", "name slug");

    if (!updatedVisa)
      return res.status(404).json({ message: "Visa not found" });

    res.json({
      message: "Visa updated successfully",
      visa: updatedVisa,
    });
  } catch (err) {
    console.error("❌ Error updating visa:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete visa
export const deleteVisa = async (req, res) => {
  try {
    const deletedVisa = await Visa.findByIdAndDelete(req.params.id);
    if (!deletedVisa)
      return res.status(404).json({ message: "Visa not found" });
    res.json({ message: "Visa deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting visa:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all visas by category slug
export const getVisasByCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await VisaCategory.findOne({ slug });
    if (!category)
      return res.status(404).json({ message: "Visa category not found" });

    const visas = await Visa.find({ visaCategory: category._id })
      .populate("visaCategory", "name slug")
      .select("title slug price img");

    res.json(visas);
  } catch (err) {
    console.error("❌ Error fetching visas by category:", err);
    res.status(500).json({ error: err.message });
  }
};
