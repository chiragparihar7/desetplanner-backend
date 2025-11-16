// middleware/sectionUpload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Clean file names
const sanitize = (name) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .toLowerCase();

// Section Image Storage
const sectionStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const base = file.originalname.split(".")[0];
    const safe = sanitize(base);

    return {
      folder: "desertplanners_uploads/sections", // 📁 Section images folder
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      resource_type: "image",
      public_id: `${safe}-${Date.now()}`,
    };
  },
});

export const sectionUpload = multer({ storage: sectionStorage });
