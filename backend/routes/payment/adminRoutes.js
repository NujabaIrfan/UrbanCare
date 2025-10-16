import express from "express";
import { adminController } from "../../controllers/payment/adminController.js";

const router = express.Router();

// 📊 Dashboard
router.get("/dashboard/stats", adminController.getDashboardStats);

// 🔵 READ - Admin Data
router.get("/insurance-claims", adminController.getAllInsuranceClaims);
router.get("/government-funding", adminController.getAllGovernmentFunding);
router.get("/transactions", adminController.getAllTransactions);

export default router;