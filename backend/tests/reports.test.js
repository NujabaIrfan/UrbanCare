// credits: ChatGPT made the test cases

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    isValidObjectId: jest.fn()
  };
});

jest.mock('../models/ReportModel.js');
jest.mock('../models/PatientModel.js');
jest.mock('../models/userModel.js');

import mongoose from 'mongoose';
import Report from '../models/ReportModel.js';
import PatientModel from '../models/PatientModel.js';
import User from '../models/userModel.js';


// Import controller AFTER mocks
import { getReport, getReports, createReport } from '../controllers/reportController.js';

describe('Report Controller Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, query: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  // -------------------------------
  // 🔹 getReport()
  // -------------------------------
  describe('getReport', () => {
    it('should return 400 for invalid object id', async () => {
      mongoose.isValidObjectId.mockReturnValue(false);
      req.params.id = 'invalid';

      await getReport(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Bad Request' });
    });

    it('should return 404 if report not found', async () => {
      mongoose.isValidObjectId.mockReturnValue(true);
      req.params.id = 'validId';
      Report.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await getReport(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
    });

    it('should return 404 if doctor not found', async () => {
      mongoose.isValidObjectId.mockReturnValue(true);
      const mockReport = { _id: 'r1', patient: 'p@x.com', doctor: 'd@x.com', toObject: jest.fn().mockReturnValue({}) };
      Report.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockReport) });
      PatientModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ name: 'John' }) });
      User.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await getReport(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
    });

    it('should return 200 with doctor and patient', async () => {
      mongoose.isValidObjectId.mockReturnValue(true);
      const mockReport = { toObject: jest.fn().mockReturnValue({ id: 'r1', patient: 'p@x.com', doctor: 'd@x.com' }) };
      const mockPatient = { name: 'John' };
      const mockDoctor = { name: 'Dr. Smith' };

      Report.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockReport) });
      PatientModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockPatient) });
      User.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockDoctor) });

      await getReport(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        doctor: mockDoctor,
        patient: mockPatient
      }));
    });

    it('should call next on exception', async () => {
      mongoose.isValidObjectId.mockReturnValue(true);
      Report.findById.mockImplementation(() => { throw new Error('boom'); });

      await getReport(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  // -------------------------------
  // 🔹 getReports()
  // -------------------------------
  describe('getReports', () => {
    it('should return 401 if email not provided', async () => {
      req.query = {};

      await getReports(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 404 if no reports found', async () => {
      req.query.email = 'p@x.com';
      Report.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

      await getReports(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No reports' });
    });

    it('should return 200 with reports', async () => {
      req.query.email = 'p@x.com';
      const mockReports = [{ id: 1 }, { id: 2 }];
      Report.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockReports) });

      await getReports(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReports);
    });

    it('should call next on exception', async () => {
      req.query.email = 'p@x.com';
      Report.find.mockImplementation(() => { throw new Error('err'); });

      await getReports(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  // -------------------------------
  // 🔹 createReport()
  // -------------------------------
  describe('createReport', () => {
    it('should create report successfully', async () => {
      const mockReport = { _id: 'r1' };
      req.body = { doctor: 'd@x.com' };
      Report.create.mockResolvedValue(mockReport);

      await createReport(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Created', id: 'r1' });
    });

    it('should handle validation error', async () => {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      Report.create.mockRejectedValue(validationError);

      await createReport(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Validation failed' });
    });

    it('should call next on unexpected error', async () => {
      Report.create.mockRejectedValue(new Error('Database down'));
      await createReport(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
