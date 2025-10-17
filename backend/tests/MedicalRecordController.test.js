// Mock dependencies BEFORE importing controller
jest.mock('../models/MedicalRecordModel.js');
jest.mock('../models/PatientModel.js');

import MedicalRecordModel from '../models/MedicalRecordModel.js';
import PatientModel from '../models/PatientModel.js';

// NOW import the controller after mocks are set up
import {
  getAllMedicalRecords,
  getPatientMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
} from '../controllers/medicalRecordController.js';

describe('Medical Record Controller Tests', () => {
  let req, res;

  // Sample test data
  const mockPatient = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    patientId: 'P001',
    age: 35,
    gender: 'Male',
    contact: '1234567890'
  };

  const mockRecord = {
    _id: '507f1f77bcf86cd799439012',
    patientId: '507f1f77bcf86cd799439011',
    appointmentDate: new Date('2025-01-15'),
    department: 'Cardiology',
    doctor: 'Dr. Smith',
    diagnoses: ['Hypertension'],
    comments: 'Regular checkup'
  };

  const mockRecordWithPopulate = {
    ...mockRecord,
    patientId: mockPatient
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
  // GET ALL MEDICAL RECORDS TESTS
  // ========================================
  describe('getAllMedicalRecords', () => {
    it('should return all medical records successfully', async () => {
      // Arrange
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockRecordWithPopulate])
      };
      MedicalRecordModel.find = jest.fn().mockReturnValue(mockChain);

      // Act
      await getAllMedicalRecords(req, res);

      // Assert
      expect(MedicalRecordModel.find).toHaveBeenCalledWith();
      expect(mockChain.populate).toHaveBeenCalledWith('patientId', 'name patientId age gender');
      expect(mockChain.sort).toHaveBeenCalledWith({ appointmentDate: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockRecordWithPopulate]);
    });

    it('should return empty array when no records exist', async () => {
      // Arrange
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      };
      MedicalRecordModel.find = jest.fn().mockReturnValue(mockChain);

      // Act
      await getAllMedicalRecords(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database errors', async () => {
      // Arrange
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      MedicalRecordModel.find = jest.fn().mockReturnValue(mockChain);

      // Act
      await getAllMedicalRecords(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  // ========================================
  // GET PATIENT MEDICAL RECORDS TESTS
  // ========================================
  describe('getPatientMedicalRecords', () => {
    it('should return all records for a specific patient', async () => {
      // Arrange
      req.params.patientId = mockPatient._id;
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockRecordWithPopulate])
      };
      MedicalRecordModel.find = jest.fn().mockReturnValue(mockChain);

      // Act
      await getPatientMedicalRecords(req, res);

      // Assert
      expect(MedicalRecordModel.find).toHaveBeenCalledWith({ patientId: mockPatient._id });
      expect(mockChain.populate).toHaveBeenCalledWith('patientId', 'name patientId age gender');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockRecordWithPopulate]);
    });

    it('should return empty array when patient has no records', async () => {
      // Arrange
      req.params.patientId = mockPatient._id;
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      };
      MedicalRecordModel.find = jest.fn().mockReturnValue(mockChain);

      // Act
      await getPatientMedicalRecords(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle errors when fetching patient records', async () => {
      // Arrange
      req.params.patientId = mockPatient._id;
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Query failed'))
      };
      MedicalRecordModel.find = jest.fn().mockReturnValue(mockChain);

      // Act
      await getPatientMedicalRecords(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Query failed' });
    });
  });

  // ========================================
  // GET MEDICAL RECORD BY ID TESTS
  // ========================================
  describe('getMedicalRecordById', () => {
    it('should return a specific medical record', async () => {
      // Arrange
      req.params.id = mockRecord._id;
      const mockChain = {
        populate: jest.fn().mockResolvedValue(mockRecordWithPopulate)
      };
      MedicalRecordModel.findById = jest.fn().mockReturnValue(mockChain);

      // Act
      await getMedicalRecordById(req, res);

      // Assert
      expect(MedicalRecordModel.findById).toHaveBeenCalledWith(mockRecord._id);
      expect(mockChain.populate).toHaveBeenCalledWith('patientId', 'name age gender contact');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecordWithPopulate);
    });

    it('should return 404 when record not found', async () => {
      // Arrange
      req.params.id = 'nonexistent-id';
      const mockChain = {
        populate: jest.fn().mockResolvedValue(null)
      };
      MedicalRecordModel.findById = jest.fn().mockReturnValue(mockChain);

      // Act
      await getMedicalRecordById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Medical record not found' });
    });

    it('should handle database errors', async () => {
      // Arrange
      req.params.id = mockRecord._id;
      const mockChain = {
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      MedicalRecordModel.findById = jest.fn().mockReturnValue(mockChain);

      // Act
      await getMedicalRecordById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  // ========================================
  // CREATE MEDICAL RECORD TESTS
  // ========================================
  describe('createMedicalRecord', () => {
    it('should create a new medical record successfully', async () => {
      // Arrange
      req.body = {
        patientId: mockPatient._id,
        appointmentDate: '2025-01-15',
        department: 'Cardiology',
        doctor: 'Dr. Smith',
        diagnoses: ['Hypertension'],
        comments: 'Regular checkup'
      };

      PatientModel.findById = jest.fn().mockResolvedValue(mockPatient);
      
      const saveMock = jest.fn().mockResolvedValue(mockRecord);
      MedicalRecordModel.mockImplementation(() => ({
        save: saveMock,
        ...req.body
      }));

      // Act
      await createMedicalRecord(req, res);

      // Assert
      expect(PatientModel.findById).toHaveBeenCalledWith(mockPatient._id);
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 404 when patient does not exist', async () => {
      // Arrange
      req.body = {
        patientId: 'nonexistent-patient-id',
        appointmentDate: '2025-01-15',
        department: 'Cardiology',
        doctor: 'Dr. Smith',
        diagnoses: ['Hypertension'],
        comments: 'Regular checkup'
      };

      PatientModel.findById = jest.fn().mockResolvedValue(null);

      // Act
      await createMedicalRecord(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Patient not found' });
    });

    it('should handle validation errors', async () => {
      // Arrange
      req.body = {
        patientId: mockPatient._id,
        appointmentDate: '2025-01-15',
        department: 'Cardiology',
        doctor: 'Dr. Smith',
        diagnoses: ['Hypertension'],
        comments: 'Regular checkup'
      };

      PatientModel.findById = jest.fn().mockResolvedValue(mockPatient);
      
      const saveMock = jest.fn().mockRejectedValue(new Error('Validation failed'));
      MedicalRecordModel.mockImplementation(() => ({
        save: saveMock
      }));

      // Act
      await createMedicalRecord(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Validation failed' });
    });

    it('should handle database errors during patient lookup', async () => {
      // Arrange
      req.body = {
        patientId: mockPatient._id,
        appointmentDate: '2025-01-15',
        department: 'Cardiology',
        doctor: 'Dr. Smith',
        diagnoses: ['Hypertension'],
        comments: 'Regular checkup'
      };

      PatientModel.findById = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      // Act
      await createMedicalRecord(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database connection failed' });
    });
  });

  // ========================================
  // UPDATE MEDICAL RECORD TESTS
  // ========================================
  describe('updateMedicalRecord', () => {
    it('should update a medical record successfully', async () => {
      // Arrange
      req.params.id = mockRecord._id;
      req.body = {
        diagnoses: ['Hypertension', 'Diabetes'],
        comments: 'Updated comments'
      };

      const updatedRecord = { ...mockRecord, ...req.body };
      MedicalRecordModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedRecord);

      // Act
      await updateMedicalRecord(req, res);

      // Assert
      expect(MedicalRecordModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockRecord._id,
        req.body,
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedRecord);
    });

    it('should return 404 when record not found', async () => {
      // Arrange
      req.params.id = 'nonexistent-id';
      req.body = {
        diagnoses: ['Hypertension', 'Diabetes'],
        comments: 'Updated comments'
      };

      MedicalRecordModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      // Act
      await updateMedicalRecord(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Medical record not found' });
    });

    it('should handle validation errors during update', async () => {
      // Arrange
      req.params.id = mockRecord._id;
      req.body = {
        diagnoses: ['Hypertension', 'Diabetes'],
        comments: 'Updated comments'
      };

      MedicalRecordModel.findByIdAndUpdate = jest.fn()
        .mockRejectedValue(new Error('Validation failed'));

      // Act
      await updateMedicalRecord(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Validation failed' });
    });

    it('should handle database errors', async () => {
      // Arrange
      req.params.id = mockRecord._id;
      req.body = { comments: 'Updated' };

      MedicalRecordModel.findByIdAndUpdate = jest.fn()
        .mockRejectedValue(new Error('Database error'));

      // Act
      await updateMedicalRecord(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  // ========================================
  // DELETE MEDICAL RECORD TESTS
  // ========================================
  describe('deleteMedicalRecord', () => {
    it('should delete a medical record successfully', async () => {
      // Arrange
      req.params.id = mockRecord._id;
      MedicalRecordModel.findByIdAndDelete = jest.fn().mockResolvedValue(mockRecord);

      // Act
      await deleteMedicalRecord(req, res);

      // Assert
      expect(MedicalRecordModel.findByIdAndDelete).toHaveBeenCalledWith(mockRecord._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Medical record deleted successfully' });
    });

    it('should return 404 when record not found', async () => {
      // Arrange
      req.params.id = 'nonexistent-id';
      MedicalRecordModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      // Act
      await deleteMedicalRecord(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Medical record not found' });
    });

    it('should handle database errors', async () => {
      // Arrange
      req.params.id = mockRecord._id;
      MedicalRecordModel.findByIdAndDelete = jest.fn()
        .mockRejectedValue(new Error('Database error'));

      // Act
      await deleteMedicalRecord(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });
});