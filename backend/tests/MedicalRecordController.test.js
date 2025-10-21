// mock the models - uses fakes when importing the controller
jest.mock('../models/MedicalRecordModel.js');
jest.mock('../models/PatientModel.js');

import MedicalRecordModel from '../models/MedicalRecordModel.js';
import PatientModel from '../models/PatientModel.js';

// importing controller - after mocks - to avoid real db calls
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

  // sample test data
  //mock a patient
  const mockPatient = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    patientId: 'P001',
    age: 35,
    gender: 'Male',
    contact: '1234567890'
  };

  //mock a med record
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

  // to reset mocks before each test
  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  //test - get all med records
  describe('getAllMedicalRecords', () => {
    it('should return all medical records successfully', async () => {
      // arrange - mock find chain--> return populated records
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockRecordWithPopulate])
      };
      MedicalRecordModel.find = jest.fn().mockReturnValue(mockChain);

      // call the handler
      await getAllMedicalRecords(req, res);

      // check calls and response (assert)
      expect(MedicalRecordModel.find).toHaveBeenCalledWith();
      expect(mockChain.populate).toHaveBeenCalledWith('patientId', 'name patientId age gender');
      expect(mockChain.sort).toHaveBeenCalledWith({ appointmentDate: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockRecordWithPopulate]);
    });

    it('should return empty array when no records exist', async () => {
      // arrange: empty result mock
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      };
      MedicalRecordModel.find = jest.fn().mockReturnValue(mockChain);

      // act: call the handler
      await getAllMedicalRecords(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database errors', async () => {
      // arrange: mocking rejection
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      MedicalRecordModel.find = jest.fn().mockReturnValue(mockChain);

      // act - handler call
      await getAllMedicalRecords(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

 //get medical recs of patients
  describe('getPatientMedicalRecords', () => {
    it('should return all records for a specific patient', async () => {
      // arrange - normal case
      req.params.patientId = mockPatient._id;
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockRecordWithPopulate])
      };
      MedicalRecordModel.find = jest.fn().mockReturnValue(mockChain);

      // act
      await getPatientMedicalRecords(req, res);

      // assert
      expect(MedicalRecordModel.find).toHaveBeenCalledWith({ patientId: mockPatient._id });
      expect(mockChain.populate).toHaveBeenCalledWith('patientId', 'name patientId age gender');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockRecordWithPopulate]);
    });

    it('should return empty array when patient has no records', async () => {
      // arrange - when patient doesnt have any  records
      req.params.patientId = mockPatient._id;
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      };
      MedicalRecordModel.find = jest.fn().mockReturnValue(mockChain);

      // act
      await getPatientMedicalRecords(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle errors when fetching patient records', async () => {
      // arrange - query fail handling
      req.params.patientId = mockPatient._id;
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Query failed'))
      };
      MedicalRecordModel.find = jest.fn().mockReturnValue(mockChain);

      // act
      await getPatientMedicalRecords(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Query failed' });
    });
  });

  //get medical record by id - specific rec
  describe('getMedicalRecordById', () => {
    it('should return a specific medical record', async () => {
      // arrange - normal case
      req.params.id = mockRecord._id;
      const mockChain = {
        populate: jest.fn().mockResolvedValue(mockRecordWithPopulate)
      };
      MedicalRecordModel.findById = jest.fn().mockReturnValue(mockChain);

      // act
      await getMedicalRecordById(req, res);

      // assert
      expect(MedicalRecordModel.findById).toHaveBeenCalledWith(mockRecord._id);
      expect(mockChain.populate).toHaveBeenCalledWith('patientId', 'name age gender contact');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecordWithPopulate);
    });

    it('should return 404 when record not found', async () => {
      // arrange - record not found - return 404
      req.params.id = 'nonexistent-id';
      const mockChain = {
        populate: jest.fn().mockResolvedValue(null)
      };
      MedicalRecordModel.findById = jest.fn().mockReturnValue(mockChain);

      // act
      await getMedicalRecordById(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Medical record not found' });
    });

    it('should handle database errors', async () => {
      // arrange - database error
      req.params.id = mockRecord._id;
      const mockChain = {
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      MedicalRecordModel.findById = jest.fn().mockReturnValue(mockChain);

      // act
      await getMedicalRecordById(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  //create a med record
  describe('createMedicalRecord', () => {
    it('should create a new medical record successfully', async () => {
      // arrange - normal case
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

      // act
      await createMedicalRecord(req, res);

      // assert
      expect(PatientModel.findById).toHaveBeenCalledWith(mockPatient._id);
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 404 when patient does not exist', async () => {
      // arrange - patient not found - should return 404
      req.body = {
        patientId: 'nonexistent-patient-id',
        appointmentDate: '2025-01-15',
        department: 'Cardiology',
        doctor: 'Dr. Smith',
        diagnoses: ['Hypertension'],
        comments: 'Regular checkup'
      };

      PatientModel.findById = jest.fn().mockResolvedValue(null);

      // act
      await createMedicalRecord(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Patient not found' });
    });

    it('should handle validation errors', async () => {
      // arrange - failed validation - patient found - schema validation fail
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

      // act
      await createMedicalRecord(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Validation failed' });
    });

    it('should handle database errors during patient lookup', async () => {
      // arrange - failed db connection
      req.body = {
        patientId: mockPatient._id,
        appointmentDate: '2025-01-15',
        department: 'Cardiology',
        doctor: 'Dr. Smith',
        diagnoses: ['Hypertension'],
        comments: 'Regular checkup'
      };

      PatientModel.findById = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      // act
      await createMedicalRecord(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database connection failed' });
    });
  });

  //update a record
  describe('updateMedicalRecord', () => {
    it('should update a medical record successfully', async () => {
      // arrange - normal
      req.params.id = mockRecord._id;
      req.body = {
        diagnoses: ['Hypertension', 'Diabetes'],
        comments: 'Updated comments'
      };

      const updatedRecord = { ...mockRecord, ...req.body };
      MedicalRecordModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedRecord);

      // act
      await updateMedicalRecord(req, res);

      // assert
      expect(MedicalRecordModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockRecord._id,
        req.body,
        { new: true, runValidators: true } //validation
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedRecord);
    });

    it('should return 404 when record not found', async () => {
      // arrange - record not found - return 404
      req.params.id = 'nonexistent-id';
      req.body = {
        diagnoses: ['Hypertension', 'Diabetes'],
        comments: 'Updated comments'
      };

      MedicalRecordModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      // act
      await updateMedicalRecord(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Medical record not found' });
    });

    it('should handle validation errors during update', async () => {
      // arrange - validation errors
      req.params.id = mockRecord._id;
      req.body = {
        diagnoses: ['Hypertension', 'Diabetes'],
        comments: 'Updated comments'
      };

      MedicalRecordModel.findByIdAndUpdate = jest.fn()
        .mockRejectedValue(new Error('Validation failed'));

      // act
      await updateMedicalRecord(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Validation failed' });
    });

    it('should handle database errors', async () => {
      // arrange -database error
      req.params.id = mockRecord._id;
      req.body = { comments: 'Updated' };

      MedicalRecordModel.findByIdAndUpdate = jest.fn()
        .mockRejectedValue(new Error('Database error'));

      // act
      await updateMedicalRecord(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  //delete med record
  describe('deleteMedicalRecord', () => {
    it('should delete a medical record successfully', async () => {
      // arrange - normal
      req.params.id = mockRecord._id;
      MedicalRecordModel.findByIdAndDelete = jest.fn().mockResolvedValue(mockRecord);

      // act
      await deleteMedicalRecord(req, res);

      // assert
      expect(MedicalRecordModel.findByIdAndDelete).toHaveBeenCalledWith(mockRecord._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Medical record deleted successfully' });
    });

    it('should return 404 when record not found', async () => {
      // arrange - record not found to delete
      req.params.id = 'nonexistent-id';
      MedicalRecordModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      // act
      await deleteMedicalRecord(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Medical record not found' });
    });

    it('should handle database errors', async () => {
      // arrange - db error
      req.params.id = mockRecord._id;
      MedicalRecordModel.findByIdAndDelete = jest.fn()
        .mockRejectedValue(new Error('Database error'));

      // act
      await deleteMedicalRecord(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });
});