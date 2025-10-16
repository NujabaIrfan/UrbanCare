import Receipt from "../../models/Receipt.js";

export const receiptController = {
  // 🟢 CREATE Receipt
  createReceipt: async (req, res) => {
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
        status: "Pending"
      });

      const savedReceipt = await newReceipt.save();
      res.status(201).json(savedReceipt);
    } catch (error) {
      console.error("Error creating receipt:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // 🔵 READ - All receipts
  getAllReceipts: async (req, res) => {
    try {
      const receipts = await Receipt.find().sort({ createdAt: -1 });
      res.status(200).json(receipts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // 🔵 READ - Receipt by ID
  getReceiptById: async (req, res) => {
    try {
      const receipt = await Receipt.findById(req.params.id);
      if (!receipt) return res.status(404).json({ message: "Receipt not found" });
      res.status(200).json(receipt);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // 🔵 READ - Receipts by patient ID
  getReceiptsByPatientId: async (req, res) => {
    try {
      const receipts = await Receipt.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
      if (!receipts.length) return res.status(404).json({ message: "No receipts found" });
      res.status(200).json(receipts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // 🟡 UPDATE Receipt
  updateReceipt: async (req, res) => {
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
  },

  // 🔴 DELETE Receipt
  deleteReceipt: async (req, res) => {
    try {
      const deletedReceipt = await Receipt.findByIdAndDelete(req.params.id);
      if (!deletedReceipt) return res.status(404).json({ message: "Receipt not found" });
      res.status(200).json({ message: "Receipt deleted successfully", deletedReceipt });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};