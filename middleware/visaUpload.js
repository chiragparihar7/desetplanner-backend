// middleware/visaUpload.js
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

// VISA STORAGE
const visaStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const base = file.originalname.split(".")[0];
    const safe = sanitizeFileName(base);

    return {
      folder: "desertplanners_uploads/visa_bookings",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
      resource_type: "auto", // important for PDF + Images
      public_id: `${safe}-${Date.now()}`,
    };
  },
});

export const visaUpload = multer({ storage: visaStorage });
