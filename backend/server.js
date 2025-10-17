import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import patientRoutes from "./routes/patientRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import Stripe from "stripe";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import channelingRoutes from "./routes/channelingRoutes.js";

dotenv.config();

// Initialize Stripe using secret key from environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

// ✅ Enhanced CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser()); // Make sure this is included

// Connect to MongoDB
connectDB()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/patients", patientRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/channel", channelingRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Backend Server is running successfully...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));