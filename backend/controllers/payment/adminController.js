import InsuranceClaim from "../../models/Insurance.js";
import GovernmentFunding from "../../models/GovermentFunding.js";
import PaymentTransaction from "../../models/paymentTransaction.js";
import Receipt from "../../models/Receipt.js";

export const adminController = {
  // 📊 Dashboard Statistics
  getDashboardStats: async (req, res) => {
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
  },

  // 🔵 READ - All Insurance Claims
  getAllInsuranceClaims: async (req, res) => {
    try {
      const claims = await InsuranceClaim.find().sort({ createdAt: -1 });
      res.status(200).json(claims);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // 🔵 READ - All Government Funding
  getAllGovernmentFunding: async (req, res) => {
    try {
      const funding = await GovernmentFunding.find().sort({ createdAt: -1 });
      res.status(200).json(funding);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // 🔵 READ - All Payment Transactions
  getAllTransactions: async (req, res) => {
    try {
      const transactions = await PaymentTransaction.find().sort({ createdAt: -1 });
      res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};