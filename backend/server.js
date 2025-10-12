import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import Stripe from "stripe";

dotenv.config();

// ✅ Use environment variable instead of hardcoding
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/receipts", receiptRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("✅ Patient Receipt Backend is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
