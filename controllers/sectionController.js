import Section from "../models/Section.js";
import SectionItem from "../models/SectionItem.js";
import { upload } from "../config/cloudinary.js"; // 👈 ADD THIS LINE

/* ---------------------------------------------
   🟦 SECTION CONTROLLERS
--------------------------------------------- */

// ➕ Create Section
export const createSection = async (req, res) => {
  try {
    const section = new Section(req.body);
    await section.save();
    res.status(201).json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 📦 Get All Sections
export const getAllSections = async (req, res) => {
  try {
    const sections = await Section.find().sort({ createdAt: -1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔍 Get Single Section by ID
export const getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ message: "Section not found" });
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update Section
export const updateSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!section) return res.status(404).json({ message: "Section not found" });
    res.json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ❌ Delete Section (with all items)
export const deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ message: "Section not found" });

    await SectionItem.deleteMany({ sectionId: section._id });
    await Section.findByIdAndDelete(req.params.id);

    res.json({ message: "Section and its items deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 👁 Toggle Visibility (show/hide)
export const toggleSectionVisibility = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ message: "Section not found" });

    section.visible = !section.visible;
    await section.save();
    res.json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ---------------------------------------------
   🟩 SECTION ITEM CONTROLLERS
--------------------------------------------- */

// ➕ Create new item (with image upload)
export const createSectionItem = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { name, link, title, price, duration, description } = req.body;

    if (!sectionId || !name) {
      return res.status(400).json({ message: "Section ID and Name are required" });
    }

    // ✅ Check section exists
    const section = await Section.findById(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    // ✅ Handle image upload
    let imageUrl = "";
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    } else {
      return res.status(400).json({ message: "Image file is required" });
    }

    const item = new SectionItem({
      sectionId,
      name,
      img: imageUrl,
      link,
      title,
      price,
      duration,
      description,
    });

    await item.save();
    res.status(201).json({
      message: "Section item created successfully",
      item,
    });
  } catch (error) {
    console.error("❌ Error adding section item:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// 📦 Get items by sectionId
export const getItemsBySection = async (req, res) => {
  try {
    const items = await SectionItem.find({ sectionId: req.params.sectionId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update item (with optional image update)
export const updateSectionItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, link, title, price, duration, description } = req.body;

    const item = await SectionItem.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // ✅ If new image uploaded
    if (req.file) {
      item.img = req.file.path;
    }

    if (name) item.name = name;
    if (link) item.link = link;
    if (title) item.title = title;
    if (price) item.price = price;
    if (duration) item.duration = duration;
    if (description) item.description = description;

    await item.save();
    res.json({
      message: "Section item updated successfully",
      item,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ❌ Delete item
export const deleteSectionItem = async (req, res) => {
  try {
    const item = await SectionItem.findByIdAndDelete(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
