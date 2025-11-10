// controllers/visaController.js
import Visa from "../models/Visa.js";
import VisaCategory from "../models/visaCategoryModel.js";
import slugify from "slugify";

// ✅ Get all visas (with optional categorySlug/category filter)
export const getAllVisas = async (req, res) => {
  try {
    const { category, categorySlug } = req.query; // e.g. ?categorySlug=uae
    let filter = {};

    // 🧩 Agar category ID diya gaya ho (for admin dashboard)
    if (category) {
      filter.visaCategory = category;
    }

    // 🧩 Agar categorySlug diya gaya ho (for frontend)
    if (categorySlug) {
      const foundCategory = await VisaCategory.findOne({ slug: categorySlug });
      if (!foundCategory) {
        return res.status(404).json({ message: "Visa category not found" });
      }
      filter.visaCategory = foundCategory._id;
    }

    // 🧩 Filter ke hisaab se visas lao
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

// ✅ Add new visa (with category validation + slugify)
export const createVisa = async (req, res) => {
  try {
    const {
      title,
      price,
      overview,
      details,
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
    } = req.body;

    // 🔸 Required field validation
    if (!title || !price || !overview || !visaCategory) {
      return res.status(400).json({
        message: "Title, Price, Overview, and Visa Category are required.",
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
      overview,
      details,
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

// ✅ Update visa (with category + slug update support)
export const updateVisa = async (req, res) => {
  try {
    const { title, visaCategory } = req.body;
    const updateData = { ...req.body };

    // 🔸 Update slug if title changes
    if (title) {
      updateData.slug = slugify(title, { lower: true, strict: true });
    }

    // 🔸 Validate and assign category
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

// ✅ Get all visas by category slug (used for dropdowns or navbar)
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
