// Mock uuid with inline factory function (fixes ES6 module issue)
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'abcd1234-5678-90ef-ghij-klmnopqrstuv')
}));

// Mock other dependencies
jest.mock('qrcode');
jest.mock('../models/PatientModel.js');

import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import PatientModel from '../models/PatientModel.js';

// NOW import the controller after mocks are set up
import {
  addPatient,
  getAllPatients,
  getPatientByQRCode,
  getPatientById,
  deletePatient
} from '../controllers/patientController.js';

describe('Patient Controller Tests', () => {
  let req, res;

  // Sample test data
  const mockPatientData = {
    name: 'John Doe',
    age: 35,
    gender: 'Male',
    contact: '1234567890',
    medicalHistory: 'No known allergies',
    email: 'john@example.com'
  };

  const mockPatient = {
    _id: '507f1f77bcf86cd799439011',
    patientId: 'PAT-ABCD1234',
    name: 'John Doe',
    age: 35,
    gender: 'Male',
    contact: '1234567890',
    medicalHistory: 'No known allergies',
    qrCode: 'data:image/png;base64,mockQRCode',
    email: 'john@example.com',
    createdAt: new Date('2025-01-15')
  };

  // Reset mocks before each test
  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  // ========================================
  // ADD PATIENT TESTS
  // ========================================
  describe('addPatient', () => {
    it('should create a new patient successfully', async () => {
      // Arrange
      req.body = mockPatientData;
      
      QRCode.toDataURL.mockResolvedValue('data:image/png;base64,mockQRCode');
      
      const saveMock = jest.fn().mockResolvedValue(mockPatient);
      PatientModel.mockImplementation(() => ({
        save: saveMock,
        ...mockPatient
      }));

      // Act
      await addPatient(req, res);

      // Assert
      expect(uuidv4).toHaveBeenCalled();
      expect(QRCode.toDataURL).toHaveBeenCalledWith('PAT-ABCD1234');
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle QR code generation errors', async () => {
      // Arrange
      req.body = mockPatientData;
      
      QRCode.toDataURL.mockRejectedValue(new Error('QR generation failed'));

      // Act
      await addPatient(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'QR generation failed' });
    });

    it('should handle database save errors', async () => {
      // Arrange
      req.body = mockPatientData;
      
      QRCode.toDataURL.mockResolvedValue('data:image/png;base64,mockQRCode');
      
      const saveMock = jest.fn().mockRejectedValue(new Error('Database error'));
      PatientModel.mockImplementation(() => ({
        save: saveMock
      }));

      // Act
      await addPatient(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

    it('should handle validation errors for missing required fields', async () => {
      // Arrange
      req.body = { name: 'John Doe' }; // Missing other required fields
      
      QRCode.toDataURL.mockResolvedValue('data:image/png;base64,mockQRCode');
      
      const saveMock = jest.fn().mockRejectedValue(new Error('Validation failed'));
      PatientModel.mockImplementation(() => ({
        save: saveMock
      }));

      // Act
      await addPatient(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Validation failed' });
    });
  });

  // ========================================
  // GET ALL PATIENTS TESTS
  // ========================================
  describe('getAllPatients', () => {
    it('should return all patients successfully', async () => {
      // Arrange
      const mockChain = {
        sort: jest.fn().mockResolvedValue([mockPatient])
      };
      PatientModel.find = jest.fn().mockReturnValue(mockChain);

      // Act
      await getAllPatients(req, res);

      // Assert
      expect(PatientModel.find).toHaveBeenCalledWith();
      expect(mockChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith([mockPatient]);
    });

    it('should return empty array when no patients exist', async () => {
      // Arrange
      const mockChain = {
        sort: jest.fn().mockResolvedValue([])
      };
      PatientModel.find = jest.fn().mockReturnValue(mockChain);

      // Act
      await getAllPatients(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database errors', async () => {
      // Arrange
      const mockChain = {
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      PatientModel.find = jest.fn().mockReturnValue(mockChain);

      // Act
      await getAllPatients(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  // ========================================
  // GET PATIENT BY QR CODE TESTS
  // ========================================
  describe('getPatientByQRCode', () => {
    it('should return patient by QR code successfully', async () => {
      // Arrange
      req.params.qrCode = 'PAT-ABCD1234';
      PatientModel.findOne = jest.fn().mockResolvedValue(mockPatient);

      // Act
      await getPatientByQRCode(req, res);

      // Assert
      expect(PatientModel.findOne).toHaveBeenCalledWith({ patientId: 'PAT-ABCD1234' });
      expect(res.json).toHaveBeenCalledWith(mockPatient);
    });

    it('should return 404 when patient not found', async () => {
      // Arrange
      req.params.qrCode = 'PAT-INVALID';
      PatientModel.findOne = jest.fn().mockResolvedValue(null);

      // Act
      await getPatientByQRCode(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Patient not found' });
    });

    it('should handle database errors', async () => {
      // Arrange
      req.params.qrCode = 'PAT-ABCD1234';
      PatientModel.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      // Act
      await getPatientByQRCode(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  // ========================================
  // GET PATIENT BY ID TESTS
  // ========================================
  describe('getPatientById', () => {
    it('should return patient by ID successfully', async () => {
      // Arrange
      req.params.id = mockPatient._id;
      PatientModel.findById = jest.fn().mockResolvedValue(mockPatient);

      // Act
      await getPatientById(req, res);

      // Assert
      expect(PatientModel.findById).toHaveBeenCalledWith(mockPatient._id);
      expect(res.json).toHaveBeenCalledWith(mockPatient);
    });

    it('should return 404 when patient not found', async () => {
      // Arrange
      req.params.id = 'nonexistent-id';
      PatientModel.findById = jest.fn().mockResolvedValue(null);

      // Act
      await getPatientById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Patient not found' });
    });

    it('should handle database errors', async () => {
      // Arrange
      req.params.id = mockPatient._id;
      PatientModel.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      // Act
      await getPatientById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

    it('should handle invalid ObjectId format', async () => {
      // Arrange
      req.params.id = 'invalid-id-format';
      PatientModel.findById = jest.fn().mockRejectedValue(new Error('Cast to ObjectId failed'));

      // Act
      await getPatientById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cast to ObjectId failed' });
    });
  });

  // ========================================
  // DELETE PATIENT TESTS
  // ========================================
  describe('deletePatient', () => {
    it('should delete patient successfully', async () => {
      // Arrange
      req.params.id = mockPatient._id;
      PatientModel.findByIdAndDelete = jest.fn().mockResolvedValue(mockPatient);

      // Act
      await deletePatient(req, res);

      // Assert
      expect(PatientModel.findByIdAndDelete).toHaveBeenCalledWith(mockPatient._id);
      expect(res.json).toHaveBeenCalledWith({ message: 'Patient deleted successfully' });
    });

    it('should return 404 when patient not found', async () => {
      // Arrange
      req.params.id = 'nonexistent-id';
      PatientModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      // Act
      await deletePatient(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Patient not found' });
    });

    it('should handle database errors', async () => {
      // Arrange
      req.params.id = mockPatient._id;
      PatientModel.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Database error'));

      // Act
      await deletePatient(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

    it('should handle invalid ObjectId format during delete', async () => {
      // Arrange
      req.params.id = 'invalid-id';
      PatientModel.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Cast to ObjectId failed'));

      // Act
      await deletePatient(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cast to ObjectId failed' });
    });
  });
});