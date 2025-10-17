// Mock dependencies BEFORE importing controller
jest.mock('../models/GovermentFunding');
jest.mock('../models/Receipt');

import GovernmentFunding from '../models/GovermentFunding';
import Receipt from '../models/Receipt';
import { governmentController } from '../controllers/payment/governmentController';

describe('Government Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  // ✅ Create Government Funding Tests
  describe('createFunding', () => {
    it('should create government funding request successfully', async () => {
      req.body = {
        billId: 'bill123',
        receiptNo: 'RCP001',
        amount: 5000,
        programType: 'Medicare',
        beneficiaryId: 'BEN123',
        beneficiaryName: 'John Doe'
      };

      const mockFunding = {
        _id: 'funding123',
        ...req.body,
        status: 'submitted',
        save: jest.fn().mockResolvedValue(true)
      };

      GovernmentFunding.mockImplementation(() => mockFunding);
      Receipt.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      await governmentController.createFunding(req, res);

      expect(mockFunding.save).toHaveBeenCalled();
      expect(Receipt.findByIdAndUpdate).toHaveBeenCalledWith('bill123', { 
        status: 'Funding Pending' 
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Government funding request submitted',
        fundingId: 'funding123'
      });
    });

    it('should handle errors when creating funding', async () => {
      req.body = { billId: 'bill123' };

      GovernmentFunding.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      }));

      await governmentController.createFunding(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Government funding failed',
        error: 'Database error'
      });
    });
  });

  // ✅ Get Funding by ID Tests
  describe('getFundingById', () => {
    it('should return funding by id', async () => {
      req.params.id = 'funding123';
      const mockFunding = {
        _id: 'funding123',
        billId: 'bill123',
        status: 'submitted',
        amount: 5000
      };

      GovernmentFunding.findById = jest.fn().mockResolvedValue(mockFunding);

      await governmentController.getFundingById(req, res);

      expect(GovernmentFunding.findById).toHaveBeenCalledWith('funding123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockFunding);
    });

    it('should return 404 if funding not found', async () => {
      req.params.id = 'funding999';
      GovernmentFunding.findById = jest.fn().mockResolvedValue(null);

      await governmentController.getFundingById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Government funding request not found' 
      });
    });

    it('should handle errors', async () => {
      req.params.id = 'funding123';
      GovernmentFunding.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await governmentController.getFundingById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ✅ Update Funding Tests
  describe('updateFunding', () => {
    it('should update funding and set receipt to Paid when approved', async () => {
      req.params.id = 'funding123';
      req.body = { status: 'approved', notes: 'Funding approved' };

      const updatedFunding = {
        _id: 'funding123',
        billId: 'bill123',
        status: 'approved',
        notes: 'Funding approved'
      };

      GovernmentFunding.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedFunding);
      Receipt.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      await governmentController.updateFunding(req, res);

      expect(GovernmentFunding.findByIdAndUpdate).toHaveBeenCalledWith(
        'funding123',
        expect.objectContaining({ status: 'approved', notes: 'Funding approved' }),
        { new: true, runValidators: true }
      );
      expect(Receipt.findByIdAndUpdate).toHaveBeenCalledWith('bill123', { 
        status: 'Paid' 
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedFunding);
    });

    it('should update funding and set receipt to Pending when rejected', async () => {
      req.params.id = 'funding123';
      req.body = { status: 'rejected', notes: 'Funding rejected' };

      const updatedFunding = {
        _id: 'funding123',
        billId: 'bill123',
        status: 'rejected',
        notes: 'Funding rejected'
      };

      GovernmentFunding.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedFunding);
      Receipt.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      await governmentController.updateFunding(req, res);

      expect(Receipt.findByIdAndUpdate).toHaveBeenCalledWith('bill123', { 
        status: 'Pending' 
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if funding not found', async () => {
      req.params.id = 'funding999';
      req.body = { status: 'approved' };

      GovernmentFunding.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await governmentController.updateFunding(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      req.params.id = 'funding123';
      req.body = { status: 'approved' };

      GovernmentFunding.findByIdAndUpdate = jest.fn().mockRejectedValue(
        new Error('Database error')
      );

      await governmentController.updateFunding(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ✅ Delete Funding Tests
  describe('deleteFunding', () => {
    it('should delete funding and reset receipt status', async () => {
      req.params.id = 'funding123';

      const deletedFunding = {
        _id: 'funding123',
        billId: 'bill123',
        status: 'submitted'
      };

      GovernmentFunding.findByIdAndDelete = jest.fn().mockResolvedValue(deletedFunding);
      Receipt.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      await governmentController.deleteFunding(req, res);

      expect(GovernmentFunding.findByIdAndDelete).toHaveBeenCalledWith('funding123');
      expect(Receipt.findByIdAndUpdate).toHaveBeenCalledWith('bill123', { 
        status: 'Pending' 
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Government funding request deleted successfully',
        deletedFunding
      });
    });

    it('should return 404 if funding not found', async () => {
      req.params.id = 'funding999';
      GovernmentFunding.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      await governmentController.deleteFunding(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      req.params.id = 'funding123';
      GovernmentFunding.findByIdAndDelete = jest.fn().mockRejectedValue(
        new Error('Database error')
      );

      await governmentController.deleteFunding(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});