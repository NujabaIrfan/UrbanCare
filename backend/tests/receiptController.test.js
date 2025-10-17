// Mock the Receipt model BEFORE importing
jest.mock('../models/Receipt.js', () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn()
  }));
});

import { receiptController } from '../controllers/payment/receiptController.js';
import Receipt from '../models/Receipt.js';

const { mockRequest, mockResponse, mockReceipt } = require('./testUtils');

describe('Receipt Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createReceipt', () => {
    it('should create a new receipt successfully', async () => {
      const receiptData = mockReceipt();
      const req = mockRequest(receiptData);
      const res = mockResponse();
      
      const mockSavedReceipt = { 
        ...receiptData,
        _id: '123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const saveMock = jest.fn().mockResolvedValue(mockSavedReceipt);
      Receipt.mockImplementation(() => ({
        save: saveMock
      }));

      await receiptController.createReceipt(req, res);

      expect(Receipt).toHaveBeenCalledWith({
        receiptNo: receiptData.receiptNo,
        patientId: receiptData.patientId,
        patientName: receiptData.patientName,
        services: receiptData.services,
        total: receiptData.total,
        status: 'Pending'
      });
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSavedReceipt);
    });

    it('should return 400 if required fields are missing', async () => {
      const req = mockRequest({ receiptNo: 'REC-001' }); // Missing other required fields
      const res = mockResponse();

      await receiptController.createReceipt(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "All fields are required" });
    });

    it('should handle server errors', async () => {
      const receiptData = mockReceipt();
      const req = mockRequest(receiptData);
      const res = mockResponse();

      const saveMock = jest.fn().mockRejectedValue(new Error('Database error'));
      Receipt.mockImplementation(() => ({
        save: saveMock
      }));

      await receiptController.createReceipt(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error"
      });
    });
  });

  describe('getAllReceipts', () => {
    it('should return all receipts', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      const mockReceipts = [
        mockReceipt({ _id: '1', receiptNo: 'REC-001' }),
        mockReceipt({ _id: '2', receiptNo: 'REC-002' })
      ];

      const sortMock = jest.fn().mockResolvedValue(mockReceipts);
      Receipt.find = jest.fn().mockReturnValue({ sort: sortMock });

      await receiptController.getAllReceipts(req, res);

      expect(Receipt.find).toHaveBeenCalled();
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReceipts);
    });

    it('should handle errors when fetching receipts', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const sortMock = jest.fn().mockRejectedValue(new Error('Database error'));
      Receipt.find = jest.fn().mockReturnValue({ sort: sortMock });

      await receiptController.getAllReceipts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error"
      });
    });
  });

  describe('getReceiptById', () => {
    it('should return a receipt by id', async () => {
      const mockReceiptData = mockReceipt({ _id: '123' });
      const req = mockRequest({}, { id: '123' });
      const res = mockResponse();

      Receipt.findById = jest.fn().mockResolvedValue(mockReceiptData);

      await receiptController.getReceiptById(req, res);

      expect(Receipt.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReceiptData);
    });

    it('should return 404 if receipt not found', async () => {
      const req = mockRequest({}, { id: '123' });
      const res = mockResponse();

      Receipt.findById = jest.fn().mockResolvedValue(null);

      await receiptController.getReceiptById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Receipt not found" });
    });

    it('should handle server errors', async () => {
      const req = mockRequest({}, { id: '123' });
      const res = mockResponse();

      Receipt.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await receiptController.getReceiptById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error"
      });
    });
  });

  describe('getReceiptsByPatientId', () => {
    it('should return receipts for a specific patient', async () => {
      const mockReceipts = [mockReceipt({ _id: '1', patientId: 'PAT-001' })];
      const req = mockRequest({}, { patientId: 'PAT-001' });
      const res = mockResponse();

      const sortMock = jest.fn().mockResolvedValue(mockReceipts);
      Receipt.find = jest.fn().mockReturnValue({ sort: sortMock });

      await receiptController.getReceiptsByPatientId(req, res);

      expect(Receipt.find).toHaveBeenCalledWith({ patientId: 'PAT-001' });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReceipts);
    });

    it('should return 404 if no receipts found', async () => {
      const req = mockRequest({}, { patientId: 'PAT-001' });
      const res = mockResponse();

      const sortMock = jest.fn().mockResolvedValue([]);
      Receipt.find = jest.fn().mockReturnValue({ sort: sortMock });

      await receiptController.getReceiptsByPatientId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "No receipts found" });
    });

    it('should handle server errors', async () => {
      const req = mockRequest({}, { patientId: 'PAT-001' });
      const res = mockResponse();

      const sortMock = jest.fn().mockRejectedValue(new Error('Database error'));
      Receipt.find = jest.fn().mockReturnValue({ sort: sortMock });

      await receiptController.getReceiptsByPatientId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateReceipt', () => {
    it('should update a receipt successfully', async () => {
      const updateData = {
        receiptNo: 'REC-001-UPDATED',
        patientId: 'PAT-001',
        patientName: 'John Doe',
        services: [{ name: 'Updated Service', price: 150 }],
        total: 150,
        status: 'Paid'
      };
      
      const req = mockRequest(updateData, { id: '123' });
      const res = mockResponse();

      const mockUpdatedReceipt = { _id: '123', ...updateData };
      Receipt.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedReceipt);

      await receiptController.updateReceipt(req, res);

      expect(Receipt.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        updateData,
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedReceipt);
    });

    it('should return 404 if receipt to update not found', async () => {
      const req = mockRequest({ total: 200 }, { id: '123' });
      const res = mockResponse();

      Receipt.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await receiptController.updateReceipt(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Receipt not found" });
    });

    it('should handle server errors', async () => {
      const req = mockRequest({ total: 200 }, { id: '123' });
      const res = mockResponse();

      Receipt.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'));

      await receiptController.updateReceipt(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error"
      });
    });
  });

  describe('deleteReceipt', () => {
    it('should delete a receipt successfully', async () => {
      const mockDeletedReceipt = mockReceipt({ _id: '123' });
      const req = mockRequest({}, { id: '123' });
      const res = mockResponse();

      Receipt.findByIdAndDelete = jest.fn().mockResolvedValue(mockDeletedReceipt);

      await receiptController.deleteReceipt(req, res);

      expect(Receipt.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Receipt deleted successfully",
        deletedReceipt: mockDeletedReceipt
      });
    });

    it('should return 404 if receipt to delete not found', async () => {
      const req = mockRequest({}, { id: '123' });
      const res = mockResponse();

      Receipt.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      await receiptController.deleteReceipt(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Receipt not found" });
    });

    it('should handle server errors', async () => {
      const req = mockRequest({}, { id: '123' });
      const res = mockResponse();

      Receipt.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Database error'));

      await receiptController.deleteReceipt(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error"
      });
    });
  });
});