import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

import connectDB from "./config/db.js";
import patientRoutes from "./routes/patientRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";

dotenv.config();

// Initialize Stripe using secret key from environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/patients", patientRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/receipts", receiptRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Backend Server is running successfully...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
