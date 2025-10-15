import { jest } from '@jest/globals';

// Mock dependencies BEFORE importing
const mockMedicalRecordModelConstructor = jest.fn();
const mockMedicalRecordModelStatics = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
};

jest.unstable_mockModule('../models/MedicalRecordModel.js', () => ({
  default: Object.assign(mockMedicalRecordModelConstructor, mockMedicalRecordModelStatics)
}));

const mockPatientModelStatics = {
  findById: jest.fn()
};

jest.unstable_mockModule('../models/PatientModel.js', () => ({
  default: mockPatientModelStatics
}));

// Import AFTER mocking
const {
  getAllMedicalRecords,
  getPatientMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
} = await import('../controllers/medicalRecordController.js');

const MedicalRecordModelModule = await import('../models/MedicalRecordModel.js');
const MedicalRecordModel = MedicalRecordModelModule.default;

const PatientModelModule = await import('../models/PatientModel.js');
const PatientModel = PatientModelModule.default;

describe('MedicalRecordController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe('getAllMedicalRecords', () => {
    it('should return all medical records with populated patient data', async () => {
      // Arrange
      const mockRecords = [
        {
          _id: '1',
          appointmentDate: new Date('2024-01-15'),
          department: 'Cardiology',
          doctor: 'Dr. Smith',
          patientId: {
            name: 'John Doe',
            patientId: 'PAT-123',
            age: 35,
            gender: 'Male'
          }
        },
        {
          _id: '2',
          appointmentDate: new Date('2024-01-10'),
          department: 'Neurology',
          doctor: 'Dr. Jones',
          patientId: {
            name: 'Jane Smith',
            patientId: 'PAT-456',
            age: 28,
            gender: 'Female'
          }
        }
      ];

      const mockSort = jest.fn().mockResolvedValue(mockRecords);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      MedicalRecordModel.find.mockReturnValue({ populate: mockPopulate });

      // Act
      await getAllMedicalRecords(req, res);

      // Assert
      expect(MedicalRecordModel.find).toHaveBeenCalledWith();
      expect(mockPopulate).toHaveBeenCalledWith('patientId', 'name patientId age gender');
      expect(mockSort).toHaveBeenCalledWith({ appointmentDate: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecords);
    });

    it('should return empty array when no records exist', async () => {
      // Arrange
      const mockSort = jest.fn().mockResolvedValue([]);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      MedicalRecordModel.find.mockReturnValue({ populate: mockPopulate });

      // Act
      await getAllMedicalRecords(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 on database error', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      const mockSort = jest.fn().mockRejectedValue(dbError);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      MedicalRecordModel.find.mockReturnValue({ populate: mockPopulate });

      // Act
      await getAllMedicalRecords(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database connection failed' });
    });
  });

  describe('getPatientMedicalRecords', () => {
    beforeEach(() => {
      req.params = { patientId: 'patient123' };
    });

    it('should return all records for a specific patient', async () => {
      // Arrange
      const mockRecords = [
        {
          _id: '1',
          patientId: 'patient123',
          appointmentDate: new Date('2024-01-15'),
          department: 'Cardiology'
        }
      ];

      const mockSort = jest.fn().mockResolvedValue(mockRecords);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      MedicalRecordModel.find.mockReturnValue({ populate: mockPopulate });

      // Act
      await getPatientMedicalRecords(req, res);

      // Assert
      expect(MedicalRecordModel.find).toHaveBeenCalledWith({ patientId: 'patient123' });
      expect(mockPopulate).toHaveBeenCalledWith('patientId', 'name patientId age gender');
      expect(mockSort).toHaveBeenCalledWith({ appointmentDate: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecords);
    });

    it('should return empty array when patient has no records', async () => {
      // Arrange
      const mockSort = jest.fn().mockResolvedValue([]);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      MedicalRecordModel.find.mockReturnValue({ populate: mockPopulate });

      // Act
      await getPatientMedicalRecords(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 on error', async () => {
      // Arrange
      const error = new Error('Query failed');
      const mockSort = jest.fn().mockRejectedValue(error);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      MedicalRecordModel.find.mockReturnValue({ populate: mockPopulate });

      // Act
      await getPatientMedicalRecords(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Query failed' });
    });
  });

  describe('getMedicalRecordById', () => {
    beforeEach(() => {
      req.params = { id: 'record123' };
    });

    it('should return a medical record by id with patient details', async () => {
      // Arrange
      const mockRecord = {
        _id: 'record123',
        appointmentDate: new Date('2024-01-15'),
        department: 'Cardiology',
        patientId: {
          name: 'John Doe',
          age: 35,
          gender: 'Male',
          contact: '+1234567890'
        }
      };

      const mockPopulate = jest.fn().mockResolvedValue(mockRecord);
      MedicalRecordModel.findById.mockReturnValue({ populate: mockPopulate });

      // Act
      await getMedicalRecordById(req, res);

      // Assert
      expect(MedicalRecordModel.findById).toHaveBeenCalledWith('record123');
      expect(mockPopulate).toHaveBeenCalledWith('patientId', 'name age gender contact');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecord);
    });

    it('should return 404 when record not found', async () => {
      // Arrange
      const mockPopulate = jest.fn().mockResolvedValue(null);
      MedicalRecordModel.findById.mockReturnValue({ populate: mockPopulate });

      // Act
      await getMedicalRecordById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Medical record not found' });
    });

    it('should return 500 on database error', async () => {
      // Arrange
      const error = new Error('Database error');
      const mockPopulate = jest.fn().mockRejectedValue(error);
      MedicalRecordModel.findById.mockReturnValue({ populate: mockPopulate });

      // Act
      await getMedicalRecordById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('createMedicalRecord', () => {
    beforeEach(() => {
      req.body = {
        patientId: 'patient123',
        appointmentDate: '2024-01-15',
        department: 'Cardiology',
        doctor: 'Dr. Smith',
        diagnoses: 'Hypertension',
        comments: 'Patient requires follow-up'
      };
    });

    it('should create medical record successfully when patient exists', async () => {
      // Arrange
      const mockPatient = { _id: 'patient123', name: 'John Doe' };
      PatientModel.findById.mockResolvedValue(mockPatient);

      const mockRecord = {
        ...req.body,
        _id: 'newRecord123',
        save: jest.fn().mockResolvedValue()
      };

      mockMedicalRecordModelConstructor.mockImplementation(() => mockRecord);

      // Act
      await createMedicalRecord(req, res);

      // Assert
      expect(PatientModel.findById).toHaveBeenCalledWith('patient123');
      expect(mockMedicalRecordModelConstructor).toHaveBeenCalledWith(req.body);
      expect(mockRecord.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockRecord);
    });

    it('should return 404 when patient does not exist', async () => {
      // Arrange
      PatientModel.findById.mockResolvedValue(null);

      // Act
      await createMedicalRecord(req, res);

      // Assert
      expect(PatientModel.findById).toHaveBeenCalledWith('patient123');
      expect(mockMedicalRecordModelConstructor).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Patient not found' });
    });

    it('should return 500 on save error', async () => {
      // Arrange
      const mockPatient = { _id: 'patient123', name: 'John Doe' };
      PatientModel.findById.mockResolvedValue(mockPatient);

      const saveError = new Error('Validation failed');
      const mockRecord = {
        ...req.body,
        save: jest.fn().mockRejectedValue(saveError)
      };

      mockMedicalRecordModelConstructor.mockImplementation(() => mockRecord);

      // Act
      await createMedicalRecord(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Validation failed' });
    });
  });

  describe('updateMedicalRecord', () => {
    beforeEach(() => {
      req.params = { id: 'record123' };
      req.body = {
        department: 'Neurology',
        doctor: 'Dr. Johnson',
        diagnoses: 'Migraine'
      };
    });

    it('should update medical record successfully', async () => {
      // Arrange
      const mockUpdatedRecord = {
        _id: 'record123',
        ...req.body,
        patientId: 'patient123'
      };

      MedicalRecordModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedRecord);

      // Act
      await updateMedicalRecord(req, res);

      // Assert
      expect(MedicalRecordModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'record123',
        req.body,
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedRecord);
    });

    it('should return 404 when record not found', async () => {
      // Arrange
      MedicalRecordModel.findByIdAndUpdate.mockResolvedValue(null);

      // Act
      await updateMedicalRecord(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Medical record not found' });
    });

    it('should return 500 on update error', async () => {
      // Arrange
      const error = new Error('Update failed');
      MedicalRecordModel.findByIdAndUpdate.mockRejectedValue(error);

      // Act
      await updateMedicalRecord(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Update failed' });
    });
  });

  describe('deleteMedicalRecord', () => {
    beforeEach(() => {
      req.params = { id: 'record123' };
    });

    it('should delete medical record successfully', async () => {
      // Arrange
      const mockDeletedRecord = {
        _id: 'record123',
        patientId: 'patient123',
        department: 'Cardiology'
      };

      MedicalRecordModel.findByIdAndDelete.mockResolvedValue(mockDeletedRecord);

      // Act
      await deleteMedicalRecord(req, res);

      // Assert
      expect(MedicalRecordModel.findByIdAndDelete).toHaveBeenCalledWith('record123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Medical record deleted successfully' });
    });

    it('should return 404 when record not found', async () => {
      // Arrange
      MedicalRecordModel.findByIdAndDelete.mockResolvedValue(null);

      // Act
      await deleteMedicalRecord(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Medical record not found' });
    });

    it('should return 500 on delete error', async () => {
      // Arrange
      const error = new Error('Delete failed');
      MedicalRecordModel.findByIdAndDelete.mockRejectedValue(error);

      // Act
      await deleteMedicalRecord(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Delete failed' });
    });
  });
});