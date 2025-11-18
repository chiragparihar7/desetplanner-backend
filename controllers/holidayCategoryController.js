import HolidayCategory from "../models/holidayCategoryModel.js";

import slugify from "slugify";

// 🟢 Add new Holiday Category
export const addHolidayCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name)
      return res.status(400).json({ message: "Category name is required" });

    const exists = await HolidayCategory.findOne({ name });
    if (exists)
      return res.status(400).json({ message: "Category already exists" });

    const category = new HolidayCategory({ name });
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 Get All Categories
export const getHolidayCategories = async (req, res) => {
  try {
    const categories = await HolidayCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 Delete Category
export const deleteHolidayCategory = async (req, res) => {
  try {
    const deleted = await HolidayCategory.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 Edit Category (name only)
export const editHolidayCategory = async (req, res) => {
  try {
    const updated = await HolidayCategory.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Category not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 Update Category + Update Slug
export const updateHolidayCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const updated = await HolidayCategory.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug: slugify(name, { lower: true, strict: true }),
      },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Category not found" });

    res.json({
      message: "Category updated successfully",
      category: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🟢 Get Holiday Packages by Category Slug
export const getHolidayPackagesByCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await HolidayCategory.findOne({ slug });

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const packages = await HolidayPackage.find({ category: category._id }).select(
      "title slug price mainImage"
    );

    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
