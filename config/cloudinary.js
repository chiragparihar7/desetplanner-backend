// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🧠 Debug print
console.log("☁️ Connected to Cloudinary:", process.env.CLOUDINARY_CLOUD_NAME);

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // ✅ Dynamically decide folder
    return {
      folder: "desertplanners_uploads/tours",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      resource_type: "image",
      public_id: file.originalname.split(".")[0],
    };
  },
});

// ✅ Multer instance
export const upload = multer({ storage });
export default cloudinary;
