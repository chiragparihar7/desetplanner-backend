// controllers/visaCategoryController.js
import VisaCategory from "../models/visaCategoryModel.js";

// 🟢 Add new Visa Category
export const addVisaCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Visa category name is required" });
    }

    const existing = await VisaCategory.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Visa category already exists" });
    }

    const category = new VisaCategory({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 Get all Visa Categories
export const getVisaCategories = async (req, res) => {
  try {
    const categories = await VisaCategory.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 Delete Visa Category
export const deleteVisaCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await VisaCategory.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Visa category not found" });
    }

    res.json({ message: "Visa category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔵 Update Visa Category
export const editVisaCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name)
      return res
        .status(400)
        .json({ message: "Visa category name is required" });

    const updated = await VisaCategory.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Visa category not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 Get visas by category slug
export const getVisasByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await VisaCategory.findOne({ slug });

    if (!category) {
      return res.status(404).json({ message: "Visa category not found" });
    }

    const visas = await Visa.find({ category: category._id }).select(
      "title slug price mainImage"
    );

    res.json(visas);
  } catch (err) {
    console.error("❌ Error fetching visas by category:", err);
    res.status(500).json({ message: "Server error" });
  }
};
