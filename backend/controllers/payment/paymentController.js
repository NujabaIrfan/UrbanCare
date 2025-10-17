import Stripe from "stripe";
import Receipt from "../../models/Receipt.js";
import PaymentTransaction from "../../models/paymentTransaction.js";
import dotenv from 'dotenv';
import { StatusCodes } from "http-status-codes"

dotenv.config();


// Initialize Stripe with proper error handling
let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
  }
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized successfully');
} catch (error) {
  console.error('❌ Stripe initialization failed:', error.message);
  // Create a mock stripe object to prevent crashes, but it will fail when used
  stripe = null;
}

export const paymentController = {
  // 💳 Create PaymentIntent
  createPaymentIntent: async (req, res) => {
    if (!stripe) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        message: "Payment service unavailable - Stripe not configured", 
        error: "Stripe secret key missing" 
      });
    }

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

      res.json({ 
        clientSecret: paymentIntent.client_secret, 
        paymentIntentId: paymentIntent.id 
      });
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        message: "Payment intent creation failed", 
        error: error.message 
      });
    }
  },

  // 💳 Confirm Payment
  confirmPayment: async (req, res) => {
    if (!stripe) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        message: "Payment service unavailable - Stripe not configured", 
        error: "Stripe secret key missing" 
      });
    }

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
        res.status(StatusCodes.BAD_REQUEST).json({ 
          success: false, 
          message: "Payment not completed" 
        });
      }
    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        message: "Payment confirmation failed", 
        error: error.message 
      });
    }
  },

  // 🔵 READ - Payment Transaction by ID
  getTransactionById: async (req, res) => {
    try {
      const transaction = await PaymentTransaction.findById(req.params.id);
      if (!transaction) return res.status(StatusCodes.NOT_FOUND).json({ message: "Transaction not found" });
      res.status(StatusCodes.OK).json(transaction);
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: error.message });
    }
  },

  // 🔵 READ - Payment Transaction by Bill ID
  getTransactionByBillId: async (req, res) => {
    try {
      const transaction = await PaymentTransaction.findOne({ billId: req.params.billId });
      if (!transaction) return res.status(StatusCodes.NOT_FOUND).json({ message: "Transaction not found" });
      res.status(StatusCodes.OK).json(transaction);
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: error.message });
    }
  },

  // 🟡 UPDATE Payment Transaction
  updateTransaction: async (req, res) => {
    try {
      const { status, notes } = req.body;
      const updatedTransaction = await PaymentTransaction.findByIdAndUpdate(
        req.params.id,
        { status, notes, updatedAt: new Date() },
        { new: true }
      );
      if (!updatedTransaction) return res.status(StatusCodes.NOT_FOUND).json({ message: "Transaction not found" });
      res.status(StatusCodes.OK).json(updatedTransaction);
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: error.message });
    }
  },

  // 🔴 DELETE Payment Transaction
  deleteTransaction: async (req, res) => {
    try {
      const deletedTransaction = await PaymentTransaction.findByIdAndDelete(req.params.id);
      if (!deletedTransaction) return res.status(StatusCodes.NOT_FOUND).json({ message: "Transaction not found" });
      res.status(StatusCodes.OK).json({ 
        message: "Transaction deleted successfully", 
        deletedTransaction 
      });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: error.message });
    }
  }
};