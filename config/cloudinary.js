// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

// ✅ Ensure .env is loaded even if this file runs before server.js
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🧠 Debug print to confirm connection
console.log("☁️ Connected to Cloudinary:", process.env.CLOUDINARY_CLOUD_NAME);

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "desertplanners_uploads", // 📁 Folder name in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

export const upload = multer({ storage });
export default cloudinary;
