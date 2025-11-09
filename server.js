// ==========================
// 🌍 Desert Planners Backend Server (FINAL FIXED VERSION)
// ==========================

// 🧩 Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config(); // ✅ Ye sabse upar hona chahiye

// ==========================
// 🧱 Core Imports
// ==========================
import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

// ✅ Database Connection
import connectDB from "./config/db.js";

// ✅ Routes Imports
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import tourRoutes from "./routes/tourRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import visaRoutes from "./routes/visaRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";
import visaCategoryRoutes from "./routes/visaCategoryRoutes.js";

// ✅ Now import Cloudinary (after dotenv is loaded)
import "./config/cloudinary.js"; // just to ensure config loads before usage

// ==========================
// 🟢 Connect Database
// ==========================
connectDB();

// ==========================
// ⚙️ Express App Setup
// ==========================
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// 🌍 Allowed Origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://desertplanners.vercel.app",
  "https://desetplanner-backend.onrender.com",
];

// 🛡️ CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// 🧭 Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/visas", visaRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/visa-categories", visaCategoryRoutes);

// 🏠 Base route
app.get("/", (req, res) => {
  res.send("✅ Desert Planners API is running...");
});

// Debug ENV Test
console.log("✅ ENV TEST CLOUDINARY:", process.env.CLOUDINARY_CLOUD_NAME);

// ==========================
// 📁 Serve uploaded files (local fallback)
// ==========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log("📂 Serving uploads from:", path.join(__dirname, "uploads"));

// ==========================
// 🚀 HTTP + Socket.io setup
// ==========================
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);
  socket.on("disconnect", () => console.log("🔴 Client disconnected:", socket.id));
});

app.set("io", io);

// ==========================
// 🟢 Start server
// ==========================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
