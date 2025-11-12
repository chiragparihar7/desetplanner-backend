import Visa from "../models/Visa.js";
import VisaCategory from "../models/visaCategoryModel.js";
import slugify from "slugify";
import { upload } from "../config/cloudinary.js"; // 👈 same as sectionController

// ✅ Helper: normalize to array
const toArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {}
    if (val.includes(",")) return val.split(",").map((v) => v.trim());
    return [val];
  }
  return [];
};

/* ----------------------------------------------------------------
   🟢 CREATE VISA (with image upload)
------------------------------------------------------------------ */
export const createVisa = async (req, res) => {
  try {
    const {
      title,
      price,
      overview,
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

    // ✅ Validation
    if (!title || !price || !visaCategory) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Handle image upload (main image)
    let mainImage = "";
    if (req.file) {
      mainImage = req.file.path; // Cloudinary uploaded URL
    }

    // ✅ Create slug
    const slug = slugify(title, { lower: true, strict: true });

    // ✅ Validate category
    const foundCategory = await VisaCategory.findById(visaCategory);
    if (!foundCategory)
      return res.status(404).json({ message: "Visa category not found" });

    const newVisa = new Visa({
      title,
      slug,
      price,
      img: mainImage,
      overview: toArray(overview),
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

    res.status(201).json({
      message: "Visa created successfully",
      visa: newVisa,
    });
  } catch (err) {
    console.error("❌ Error creating visa:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ----------------------------------------------------------------
   🟡 UPDATE VISA (with optional image upload)
------------------------------------------------------------------ */
export const updateVisa = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      visaCategory,
      overview,
      inclusions,
      exclusions,
      documents,
      relatedVisas,
      howToApply,
      termsAndConditions,
    } = req.body;

    const visa = await Visa.findById(id);
    if (!visa) return res.status(404).json({ message: "Visa not found" });

    // ✅ Handle new image upload (optional)
    if (req.file) {
      visa.img = req.file.path;
    }

    // ✅ Update fields if provided
    if (title) visa.title = title;
    if (visaCategory) visa.visaCategory = visaCategory;
    if (overview) visa.overview = toArray(overview);
    if (inclusions) visa.inclusions = toArray(inclusions);
    if (exclusions) visa.exclusions = toArray(exclusions);
    if (documents) visa.documents = toArray(documents);
    if (relatedVisas) visa.relatedVisas = toArray(relatedVisas);
    if (howToApply) visa.howToApply = toArray(howToApply);
    if (termsAndConditions)
      visa.termsAndConditions = toArray(termsAndConditions);

    await visa.save();

    res.json({ message: "Visa updated successfully", visa });
  } catch (err) {
    console.error("❌ Error updating visa:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ----------------------------------------------------------------
   🔵 GET ALL VISAS
------------------------------------------------------------------ */
export const getAllVisas = async (req, res) => {
  try {
    const { category, categorySlug } = req.query;
    let filter = {};

    if (category) filter.visaCategory = category;
    if (categorySlug) {
      const foundCategory = await VisaCategory.findOne({ slug: categorySlug });
      if (foundCategory) filter.visaCategory = foundCategory._id;
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

/* ----------------------------------------------------------------
   🔵 GET VISA BY SLUG
------------------------------------------------------------------ */
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

/* ----------------------------------------------------------------
   🔵 DELETE VISA
------------------------------------------------------------------ */
export const deleteVisa = async (req, res) => {
  try {
    const visa = await Visa.findByIdAndDelete(req.params.id);
    if (!visa) return res.status(404).json({ message: "Visa not found" });
    res.json({ message: "Visa deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting visa:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ----------------------------------------------------------------
   🔵 GET VISAS BY CATEGORY SLUG
------------------------------------------------------------------ */
export const getVisasByCategory = async (req, res) => {
  try {
    const category = await VisaCategory.findOne({ slug: req.params.slug });
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
