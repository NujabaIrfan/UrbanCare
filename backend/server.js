import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import patientRoutes from "./routes/patientRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import receiptRoutes from "./routes/payment/receiptRoutes.js";
import paymentRoutes from "./routes/payment/paymentRoutes.js";
import governmentRoutes from "./routes/payment/governmentRoutes.js";
import insuranceRoutes from "./routes/payment/insuranceRoutes.js";
import adminRoutes from "./routes/payment/adminRoutes.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import reportRoutes from "./routes/reportRoute.js"

dotenv.config();


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
app.use("/api/payments", paymentRoutes);
app.use("/api/government", governmentRoutes);
app.use("/api/insurance", insuranceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", userRoutes);
app.use("/api/reports", reportRoutes)

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Backend Server is running successfully...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));