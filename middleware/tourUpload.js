// middleware/tourUpload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// File name cleaner
const sanitizeFileName = (name) => {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .toLowerCase();
};

// TOUR STORAGE
const tourStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const base = file.originalname.split(".")[0];
    const safe = sanitizeFileName(base);

    return {
      folder: "desertplanners_uploads/tours",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      resource_type: "image",
      public_id: `${safe}-${Date.now()}`,
    };
  },
});

export const tourUpload = multer({ storage: tourStorage });
