import express from "express";
import { insuranceController } from "../../controllers/payment/insuranceController.js";

const router = express.Router();

// 🏥 Insurance Claims
router.post("/insurance-claim", insuranceController.createClaim);
router.get("/insurance-claims/:id", insuranceController.getClaimById);
router.put("/insurance-claims/:id", insuranceController.updateClaim);
router.delete("/insurance-claims/:id", insuranceController.deleteClaim);

export default router;