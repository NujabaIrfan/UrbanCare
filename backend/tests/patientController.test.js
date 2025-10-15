import { jest } from '@jest/globals';

// Mock dependencies BEFORE importing
jest.unstable_mockModule('../services/patientService.js', () => ({
  generatePatientId: jest.fn(),
  generateQRCode: jest.fn()
}));

// Create a mock constructor function
const mockPatientModelConstructor = jest.fn();
const mockPatientModelStatics = {
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn()
};

jest.unstable_mockModule('../models/PatientModel.js', () => ({
  default: Object.assign(mockPatientModelConstructor, mockPatientModelStatics)
}));

// Import AFTER mocking
const { createPatient, getAllPatients } = await import('../controllers/patientController.js');
const patientService = await import('../services/patientService.js');
const PatientModelModule = await import('../models/PatientModel.js');
const PatientModel = PatientModelModule.default;

describe('PatientController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe('createPatient', () => {
    beforeEach(() => {
      req.body = {
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        contact: '+1234567890',
        medicalHistory: 'None'
      };
    });

    it('should create patient successfully', async () => {
      // Arrange
      patientService.generatePatientId.mockReturnValue('PAT-12345678');
      patientService.generateQRCode.mockResolvedValue('data:image/png;base64,QR');
      
      const mockPatient = {
        ...req.body,
        patientId: 'PAT-12345678',
        qrCode: 'data:image/png;base64,QR',
        save: jest.fn().mockResolvedValue()
      };
      
      mockPatientModelConstructor.mockImplementation(() => mockPatient);

      // Act
      await createPatient(req, res);

      // Assert
      expect(patientService.generatePatientId).toHaveBeenCalled();
      expect(patientService.generateQRCode).toHaveBeenCalledWith('PAT-12345678');
      expect(mockPatient.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPatient);
    });

    it('should return 400 on error', async () => {
      // Arrange
      patientService.generatePatientId.mockReturnValue('PAT-12345678');
      patientService.generateQRCode.mockRejectedValue(new Error('Failed'));

      // Act
      await createPatient(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed' });
    });
  });

  describe('getAllPatients', () => {
    it('should return all patients sorted by creation date', async () => {
      // Arrange
      const mockPatients = [
        { 
          patientId: 'PAT-123', 
          name: 'Jane Doe', 
          age: 30,
          createdAt: new Date('2024-01-02') 
        },
        { 
          patientId: 'PAT-456', 
          name: 'John Smith', 
          age: 25,
          createdAt: new Date('2024-01-01') 
        }
      ];

      const mockSort = jest.fn().mockResolvedValue(mockPatients);
      PatientModel.find.mockReturnValue({ sort: mockSort });

      // Act
      await getAllPatients(req, res);

      // Assert
      expect(PatientModel.find).toHaveBeenCalledWith();
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith(mockPatients);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return empty array when no patients exist', async () => {
      // Arrange
      const mockSort = jest.fn().mockResolvedValue([]);
      PatientModel.find.mockReturnValue({ sort: mockSort });

      // Act
      await getAllPatients(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 on database error', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      const mockSort = jest.fn().mockRejectedValue(dbError);
      PatientModel.find.mockReturnValue({ sort: mockSort });

      // Act
      await getAllPatients(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database connection failed' });
    });

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      PatientModel.find.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      // Act
      await getAllPatients(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unexpected error' });
    });
  });
});