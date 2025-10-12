// receiptRoutes.js
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import Receipt from "../models/Receipt.js";
import InsuranceClaim from "../models/Insurance.js";
import GovernmentFunding from "../models/GovermentFunding.js";
import PaymentTransaction from "../models/paymentTransaction.js";

dotenv.config();

// Debug: Check if Stripe key is loaded
console.log('Stripe Key Loaded:', process.env.STRIPE_SECRET_KEY ? 'Yes' : 'No');


const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// 🟢 CREATE Receipt
router.post("/", async (req, res) => {
  try {
    const { receiptNo, patientId, patientName, services, total } = req.body;
    if (!receiptNo || !patientId || !patientName || !services || !total) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newReceipt = new Receipt({ 
      receiptNo, 
      patientId, 
      patientName, 
      services, 
      total,
      status: "Pending" // Default status
    });
    const savedReceipt = await newReceipt.save();
    res.status(201).json(savedReceipt);
  } catch (error) {
    console.error("Error creating receipt:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🔵 READ - All receipts
router.get("/", async (req, res) => {
  try {
    const receipts = await Receipt.find().sort({ createdAt: -1 });
    res.status(200).json(receipts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🔵 READ - Receipt by ID
router.get("/:id", async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });
    res.status(200).json(receipt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🔵 READ - Receipts by patient ID
router.get("/patient/:patientId", async (req, res) => {
  try {
    const receipts = await Receipt.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    if (!receipts.length) return res.status(404).json({ message: "No receipts found" });
    res.status(200).json(receipts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🟡 UPDATE Receipt
router.put("/:id", async (req, res) => {
  try {
    const { receiptNo, patientId, patientName, services, total, status } = req.body;
    const updatedReceipt = await Receipt.findByIdAndUpdate(
      req.params.id,
      { receiptNo, patientId, patientName, services, total, status },
      { new: true, runValidators: true }
    );
    if (!updatedReceipt) return res.status(404).json({ message: "Receipt not found" });
    res.status(200).json(updatedReceipt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🔴 DELETE Receipt
router.delete("/:id", async (req, res) => {
  try {
    const deletedReceipt = await Receipt.findByIdAndDelete(req.params.id);
    if (!deletedReceipt) return res.status(404).json({ message: "Receipt not found" });
    res.status(200).json({ message: "Receipt deleted successfully", deletedReceipt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 💳 Stripe PaymentIntent
router.post("/create-payment-intent", async (req, res) => {
  const { amount, billId, receiptNo } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata: { billId, receiptNo },
      automatic_payment_methods: { enabled: true },
    });

    const transaction = new PaymentTransaction({
      billId,
      receiptNo,
      amount,
      paymentMethod: "card",
      stripePaymentIntentId: paymentIntent.id,
      status: "pending",
    });
    await transaction.save();

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment intent creation failed", error: error.message });
  }
});

// 💳 Confirm Payment
router.post("/confirm-payment", async (req, res) => {
  const { paymentIntentId, billId } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status === "succeeded") {
      await Receipt.findByIdAndUpdate(billId, { status: "Paid" });
      await PaymentTransaction.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        { status: "succeeded" }
      );
      res.json({ success: true, message: "Payment confirmed" });
    } else {
      res.status(400).json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment confirmation failed", error: error.message });
  }
});

// 🏥 Insurance claim
router.post("/insurance-claim", async (req, res) => {
  try {
    const claim = new InsuranceClaim({
      ...req.body,
      status: "submitted" // Default status
    });
    await claim.save();
    await Receipt.findByIdAndUpdate(req.body.billId, { status: "Claim Pending" });
    res.json({ success: true, message: "Insurance claim submitted", claimId: claim._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Insurance claim failed", error: error.message });
  }
});

// 🏛️ Government funding
router.post("/government-funding", async (req, res) => {
  try {
    const funding = new GovernmentFunding({
      ...req.body,
      status: "submitted" // Default status
    });
    await funding.save();
    await Receipt.findByIdAndUpdate(req.body.billId, { status: "Funding Pending" });
    res.json({ success: true, message: "Government funding request submitted", fundingId: funding._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Government funding failed", error: error.message });
  }
});

// 🔵 READ - Insurance Claim by ID
router.get("/insurance-claims/:id", async (req, res) => {
  try {
    const claim = await InsuranceClaim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: "Insurance claim not found" });
    res.status(200).json(claim);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🔵 READ - Government Funding by ID
router.get("/government-funding/:id", async (req, res) => {
  try {
    const funding = await GovernmentFunding.findById(req.params.id);
    if (!funding) return res.status(404).json({ message: "Government funding request not found" });
    res.status(200).json(funding);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🟡 UPDATE Insurance Claim Status
router.put("/insurance-claims/:id", async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updatedClaim = await InsuranceClaim.findByIdAndUpdate(
      req.params.id,
      { status, notes, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedClaim) return res.status(404).json({ message: "Insurance claim not found" });
    
    // Update receipt status based on claim status
    if (status === "approved") {
      await Receipt.findByIdAndUpdate(updatedClaim.billId, { status: "Paid" });
    } else if (status === "rejected") {
      await Receipt.findByIdAndUpdate(updatedClaim.billId, { status: "Pending" });
    }
    
    res.status(200).json(updatedClaim);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🟡 UPDATE Government Funding Status
router.put("/government-funding/:id", async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updatedFunding = await GovernmentFunding.findByIdAndUpdate(
      req.params.id,
      { status, notes, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedFunding) return res.status(404).json({ message: "Government funding request not found" });
    
    // Update receipt status based on funding status
    if (status === "approved") {
      await Receipt.findByIdAndUpdate(updatedFunding.billId, { status: "Paid" });
    } else if (status === "rejected") {
      await Receipt.findByIdAndUpdate(updatedFunding.billId, { status: "Pending" });
    }
    
    res.status(200).json(updatedFunding);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🔴 DELETE Insurance Claim
router.delete("/insurance-claims/:id", async (req, res) => {
  try {
    const deletedClaim = await InsuranceClaim.findByIdAndDelete(req.params.id);
    if (!deletedClaim) return res.status(404).json({ message: "Insurance claim not found" });
    
    // Reset receipt status
    await Receipt.findByIdAndUpdate(deletedClaim.billId, { status: "Pending" });
    
    res.status(200).json({ message: "Insurance claim deleted successfully", deletedClaim });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🔴 DELETE Government Funding
router.delete("/government-funding/:id", async (req, res) => {
  try {
    const deletedFunding = await GovernmentFunding.findByIdAndDelete(req.params.id);
    if (!deletedFunding) return res.status(404).json({ message: "Government funding request not found" });
    
    // Reset receipt status
    await Receipt.findByIdAndUpdate(deletedFunding.billId, { status: "Pending" });
    
    res.status(200).json({ message: "Government funding request deleted successfully", deletedFunding });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin routes for fetching claims/funding/transactions
router.get("/admin/insurance-claims", async (req, res) => {
  try {
    const claims = await InsuranceClaim.find().sort({ createdAt: -1 });
    res.status(200).json(claims);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/admin/government-funding", async (req, res) => {
  try {
    const funding = await GovernmentFunding.find().sort({ createdAt: -1 });
    res.status(200).json(funding);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/admin/transactions", async (req, res) => {
  try {
    const transactions = await PaymentTransaction.find().sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/transaction/:billId", async (req, res) => {
  try {
    const transaction = await PaymentTransaction.findOne({ billId: req.params.billId });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.status(200).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🔵 READ - Payment Transaction by ID
router.get("/transactions/:id", async (req, res) => {
  try {
    const transaction = await PaymentTransaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.status(200).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🟡 UPDATE Payment Transaction
router.put("/transactions/:id", async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updatedTransaction = await PaymentTransaction.findByIdAndUpdate(
      req.params.id,
      { status, notes, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedTransaction) return res.status(404).json({ message: "Transaction not found" });
    res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🔴 DELETE Payment Transaction
router.delete("/transactions/:id", async (req, res) => {
  try {
    const deletedTransaction = await PaymentTransaction.findByIdAndDelete(req.params.id);
    if (!deletedTransaction) return res.status(404).json({ message: "Transaction not found" });
    res.status(200).json({ message: "Transaction deleted successfully", deletedTransaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 📊 Dashboard Statistics
router.get("/dashboard/stats", async (req, res) => {
  try {
    const [
      totalReceipts,
      paidReceipts,
      pendingReceipts,
      claimPendingReceipts,
      fundingPendingReceipts,
      totalTransactions,
      totalClaims,
      totalFunding
    ] = await Promise.all([
      Receipt.countDocuments(),
      Receipt.countDocuments({ status: "Paid" }),
      Receipt.countDocuments({ status: "Pending" }),
      Receipt.countDocuments({ status: "Claim Pending" }),
      Receipt.countDocuments({ status: "Funding Pending" }),
      PaymentTransaction.countDocuments(),
      InsuranceClaim.countDocuments(),
      GovernmentFunding.countDocuments()
    ]);

    const revenueStats = await Receipt.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          paidRevenue: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "Paid"] }, "$total", 0] 
            } 
          },
          pendingRevenue: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "Pending"] }, "$total", 0] 
            } 
          }
        }
      }
    ]);

    const stats = {
      receipts: {
        total: totalReceipts,
        paid: paidReceipts,
        pending: pendingReceipts,
        claimPending: claimPendingReceipts,
        fundingPending: fundingPendingReceipts
      },
      transactions: totalTransactions,
      claims: totalClaims,
      funding: totalFunding,
      revenue: revenueStats[0] || { totalRevenue: 0, paidRevenue: 0, pendingRevenue: 0 }
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Export router as default (ES Module)
export default router;