import GovernmentFunding from "../../models/GovermentFunding.js";
import Receipt from "../../models/Receipt.js";
import { StatusCodes } from "http-status-codes"

export const governmentController = {
  // 🏛️ Create Government Funding Request
  createFunding: async (req, res) => {
    try {
      const funding = new GovernmentFunding({
        ...req.body,
        status: "submitted"
      });
      await funding.save();
      
      await Receipt.findByIdAndUpdate(req.body.billId, { status: "Funding Pending" });
      
      res.json({ 
        success: true, 
        message: "Government funding request submitted", 
        fundingId: funding._id 
      });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        message: "Government funding failed", 
        error: error.message 
      });
    }
  },

  // 🔵 READ - Government Funding by ID
  getFundingById: async (req, res) => {
    try {
      const funding = await GovernmentFunding.findById(req.params.id);
      if (!funding) return res.status(404).json({ message: "Government funding request not found" });
      res.status(StatusCodes.OK).json(funding);
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: error.message });
    }
  },

  // 🟡 UPDATE Government Funding Status
  updateFunding: async (req, res) => {
    try {
      const { status, notes } = req.body;
      const updatedFunding = await GovernmentFunding.findByIdAndUpdate(
        req.params.id,
        { status, notes, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!updatedFunding) return res.status(StatusCodes.NOT_FOUND).json({ message: "Government funding request not found" });
      
      // Update receipt status based on funding status
      if (status === "approved") {
        await Receipt.findByIdAndUpdate(updatedFunding.billId, { status: "Paid" });
      } else if (status === "rejected") {
        await Receipt.findByIdAndUpdate(updatedFunding.billId, { status: "Pending" });
      }
      
      res.status(StatusCodes.OK).json(updatedFunding);
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: error.message });
    }
  },

  // 🔴 DELETE Government Funding
  deleteFunding: async (req, res) => {
    try {
      const deletedFunding = await GovernmentFunding.findByIdAndDelete(req.params.id);
      if (!deletedFunding) return res.status(StatusCodes.NOT_FOUND).json({ message: "Government funding request not found" });
      
      // Reset receipt status
      await Receipt.findByIdAndUpdate(deletedFunding.billId, { status: "Pending" });
      
      res.status(StatusCodes.OK).json({ 
        message: "Government funding request deleted successfully", 
        deletedFunding 
      });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: error.message });
    }
  }
};