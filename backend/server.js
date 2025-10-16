import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import Stripe from "stripe";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";

dotenv.config();

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
connectDB();

// Routes
app.use("/api/receipts", receiptRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", userRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("✅ Patient Receipt Backend is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));