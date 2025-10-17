// Mock dependencies BEFORE importing controller
jest.mock('../models/Insurance');
jest.mock('../models/Receipt');

import InsuranceClaim from '../models/Insurance';
import Receipt from '../models/Receipt';
import { insuranceController } from '../controllers/payment/insuranceController';

describe('Insurance Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  // ✅ Create Insurance Claim Tests
  describe('createClaim', () => {
    it('should create insurance claim successfully', async () => {
      req.body = {
        billId: 'bill123',
        patientId: 'patient123',
        insuranceProvider: 'Blue Cross',
        policyNumber: 'POL123',
        claimAmount: 500
      };

      const mockClaim = {
        _id: 'claim123',
        ...req.body,
        status: 'submitted',
        save: jest.fn().mockResolvedValue(true)
      };

      InsuranceClaim.mockImplementation(() => mockClaim);
      Receipt.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      await insuranceController.createClaim(req, res);

      expect(mockClaim.save).toHaveBeenCalled();
      expect(Receipt.findByIdAndUpdate).toHaveBeenCalledWith('bill123', { 
        status: 'Claim Pending' 
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Insurance claim submitted',
        claimId: 'claim123'
      });
    });

    it('should handle errors when creating claim', async () => {
      req.body = { billId: 'bill123' };

      InsuranceClaim.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      }));

      await insuranceController.createClaim(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Insurance claim failed',
        error: 'Database error'
      });
    });
  });

  // ✅ Get Claim by ID Tests
  describe('getClaimById', () => {
    it('should return claim by id', async () => {
      req.params.id = 'claim123';
      const mockClaim = {
        _id: 'claim123',
        billId: 'bill123',
        status: 'submitted'
      };

      InsuranceClaim.findById = jest.fn().mockResolvedValue(mockClaim);

      await insuranceController.getClaimById(req, res);

      expect(InsuranceClaim.findById).toHaveBeenCalledWith('claim123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockClaim);
    });

    it('should return 404 if claim not found', async () => {
      req.params.id = 'claim999';
      InsuranceClaim.findById = jest.fn().mockResolvedValue(null);

      await insuranceController.getClaimById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Insurance claim not found' 
      });
    });

    it('should handle errors', async () => {
      req.params.id = 'claim123';
      InsuranceClaim.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await insuranceController.getClaimById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ✅ Update Claim Tests
  describe('updateClaim', () => {
    it('should update claim and set receipt to Paid when approved', async () => {
      req.params.id = 'claim123';
      req.body = { status: 'approved', notes: 'Claim approved' };

      const updatedClaim = {
        _id: 'claim123',
        billId: 'bill123',
        status: 'approved',
        notes: 'Claim approved'
      };

      InsuranceClaim.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedClaim);
      Receipt.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      await insuranceController.updateClaim(req, res);

      expect(InsuranceClaim.findByIdAndUpdate).toHaveBeenCalledWith(
        'claim123',
        expect.objectContaining({ status: 'approved', notes: 'Claim approved' }),
        { new: true, runValidators: true }
      );
      expect(Receipt.findByIdAndUpdate).toHaveBeenCalledWith('bill123', { 
        status: 'Paid' 
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedClaim);
    });

    it('should update claim and set receipt to Pending when rejected', async () => {
      req.params.id = 'claim123';
      req.body = { status: 'rejected', notes: 'Claim rejected' };

      const updatedClaim = {
        _id: 'claim123',
        billId: 'bill123',
        status: 'rejected',
        notes: 'Claim rejected'
      };

      InsuranceClaim.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedClaim);
      Receipt.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      await insuranceController.updateClaim(req, res);

      expect(Receipt.findByIdAndUpdate).toHaveBeenCalledWith('bill123', { 
        status: 'Pending' 
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if claim not found', async () => {
      req.params.id = 'claim999';
      req.body = { status: 'approved' };

      InsuranceClaim.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await insuranceController.updateClaim(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      req.params.id = 'claim123';
      req.body = { status: 'approved' };

      InsuranceClaim.findByIdAndUpdate = jest.fn().mockRejectedValue(
        new Error('Database error')
      );

      await insuranceController.updateClaim(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ✅ Delete Claim Tests
  describe('deleteClaim', () => {
    it('should delete claim and reset receipt status', async () => {
      req.params.id = 'claim123';

      const deletedClaim = {
        _id: 'claim123',
        billId: 'bill123',
        status: 'submitted'
      };

      InsuranceClaim.findByIdAndDelete = jest.fn().mockResolvedValue(deletedClaim);
      Receipt.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      await insuranceController.deleteClaim(req, res);

      expect(InsuranceClaim.findByIdAndDelete).toHaveBeenCalledWith('claim123');
      expect(Receipt.findByIdAndUpdate).toHaveBeenCalledWith('bill123', { 
        status: 'Pending' 
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Insurance claim deleted successfully',
        deletedClaim
      });
    });

    it('should return 404 if claim not found', async () => {
      req.params.id = 'claim999';
      InsuranceClaim.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      await insuranceController.deleteClaim(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      req.params.id = 'claim123';
      InsuranceClaim.findByIdAndDelete = jest.fn().mockRejectedValue(
        new Error('Database error')
      );

      await insuranceController.deleteClaim(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});