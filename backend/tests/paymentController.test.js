// Mock dependencies BEFORE importing controller
jest.mock('stripe');
jest.mock('../models/Receipt');
jest.mock('../models/paymentTransaction');
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Set up environment variable
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';

import Stripe from 'stripe';
import Receipt from '../models/Receipt';
import PaymentTransaction from '../models/paymentTransaction';

// Create mock Stripe instance
const mockStripeInstance = {
  paymentIntents: {
    create: jest.fn(),
    retrieve: jest.fn()
  }
};

// Mock Stripe constructor
Stripe.mockImplementation(() => mockStripeInstance);

// NOW import the controller after mocks are set up
const { paymentController } = require('../controllers/payment/paymentController');

describe('Payment Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  // ✅ Create Payment Intent Tests
  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      req.body = { amount: 100, billId: 'bill123', receiptNo: 'RCP001' };
      
      const mockPaymentIntent = {
        id: 'pi_123',
        client_secret: 'secret_123'
      };

      mockStripeInstance.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      PaymentTransaction.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(true)
      }));

      await paymentController.createPaymentIntent(req, res);

      expect(res.json).toHaveBeenCalledWith({
        clientSecret: 'secret_123',
        paymentIntentId: 'pi_123'
      });
    });

    it('should handle errors', async () => {
      req.body = { amount: 100, billId: 'bill123', receiptNo: 'RCP001' };
      
      mockStripeInstance.paymentIntents.create.mockRejectedValue(new Error('Stripe error'));

      await paymentController.createPaymentIntent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ✅ Confirm Payment Tests
  describe('confirmPayment', () => {
    it('should confirm payment when succeeded', async () => {
      req.body = { paymentIntentId: 'pi_123', billId: 'bill123' };

      mockStripeInstance.paymentIntents.retrieve.mockResolvedValue({ 
        status: 'succeeded' 
      });

      Receipt.findByIdAndUpdate = jest.fn().mockResolvedValue({});
      PaymentTransaction.findOneAndUpdate = jest.fn().mockResolvedValue({});

      await paymentController.confirmPayment(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Payment confirmed'
      });
    });

    it('should reject incomplete payment', async () => {
      req.body = { paymentIntentId: 'pi_123', billId: 'bill123' };

      mockStripeInstance.paymentIntents.retrieve.mockResolvedValue({ 
        status: 'pending' 
      });

      await paymentController.confirmPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ✅ Get Transaction by ID Tests
  describe('getTransactionById', () => {
    it('should return transaction', async () => {
      req.params.id = 'trans123';
      const mockTransaction = { _id: 'trans123', amount: 100 };
      
      PaymentTransaction.findById = jest.fn().mockResolvedValue(mockTransaction);

      await paymentController.getTransactionById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTransaction);
    });

    it('should return 404 if not found', async () => {
      req.params.id = 'trans999';
      PaymentTransaction.findById = jest.fn().mockResolvedValue(null);

      await paymentController.getTransactionById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ✅ Get Transaction by Bill ID Tests
  describe('getTransactionByBillId', () => {
    it('should return transaction', async () => {
      req.params.billId = 'bill123';
      const mockTransaction = { billId: 'bill123', amount: 100 };
      
      PaymentTransaction.findOne = jest.fn().mockResolvedValue(mockTransaction);

      await paymentController.getTransactionByBillId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTransaction);
    });

    it('should return 404 if not found', async () => {
      req.params.billId = 'bill999';
      PaymentTransaction.findOne = jest.fn().mockResolvedValue(null);

      await paymentController.getTransactionByBillId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ✅ Update Transaction Tests
  describe('updateTransaction', () => {
    it('should update transaction', async () => {
      req.params.id = 'trans123';
      req.body = { status: 'succeeded', notes: 'Payment completed' };
      
      const updatedTransaction = { _id: 'trans123', status: 'succeeded' };
      PaymentTransaction.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedTransaction);

      await paymentController.updateTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedTransaction);
    });

    it('should return 404 if not found', async () => {
      req.params.id = 'trans999';
      PaymentTransaction.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await paymentController.updateTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ✅ Delete Transaction Tests
  describe('deleteTransaction', () => {
    it('should delete transaction', async () => {
      req.params.id = 'trans123';
      const deletedTransaction = { _id: 'trans123', amount: 100 };
      
      PaymentTransaction.findByIdAndDelete = jest.fn().mockResolvedValue(deletedTransaction);

      await paymentController.deleteTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Transaction deleted successfully',
        deletedTransaction
      });
    });

    it('should return 404 if not found', async () => {
      req.params.id = 'trans999';
      PaymentTransaction.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      await paymentController.deleteTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});