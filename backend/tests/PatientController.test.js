// mocked uui with a simple factory to avoid es6 import issues in jest
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'abcd1234-5678-90ef-ghij-klmnopqrstuv')
}));

// mock qr library + patient model
jest.mock('qrcode');
jest.mock('../models/PatientModel.js');

import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import PatientModel from '../models/PatientModel.js';

// importing controller after mocks
import {
  addPatient,
  getAllPatients,
  getPatientByQRCode,
  getPatientById,
  deletePatient
} from '../controllers/patientController.js';

describe('Patient Controller Tests', () => {
  let req, res;

  // sample test data 
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

  // reset mocks before each test - avoid state leaks
  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  //test - adding a patient
  describe('addPatient', () => {
    it('should create a new patient successfully', async () => {
      // arrange - normal 
      req.body = mockPatientData;
      
      QRCode.toDataURL.mockResolvedValue('data:image/png;base64,mockQRCode');
      
      const saveMock = jest.fn().mockResolvedValue(mockPatient);
      PatientModel.mockImplementation(() => ({
        save: saveMock,
        ...mockPatient
      }));

      // act - call the handler
      await addPatient(req, res);

      // assert
      expect(uuidv4).toHaveBeenCalled(); //check uuid call
      expect(QRCode.toDataURL).toHaveBeenCalledWith('PAT-ABCD1234'); //check qr generation
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle QR code generation errors', async () => {
      // arrange - qr failure
      req.body = mockPatientData;
      
      QRCode.toDataURL.mockRejectedValue(new Error('QR generation failed'));

      // act
      await addPatient(req, res);

      // assert - bad request 400
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'QR generation failed' });
    });

    it('should handle database save errors', async () => {
      // arrange - qr okay, server failure
      req.body = mockPatientData;
      
      QRCode.toDataURL.mockResolvedValue('data:image/png;base64,mockQRCode');
      
      const saveMock = jest.fn().mockRejectedValue(new Error('Database error'));
      PatientModel.mockImplementation(() => ({
        save: saveMock
      }));

      // act
      await addPatient(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

    it('should handle validation errors for missing required fields', async () => {
      // arrange - incomplete body
      req.body = { name: 'John Doe' }; // missing other required fields
      
      QRCode.toDataURL.mockResolvedValue('data:image/png;base64,mockQRCode');
      
      const saveMock = jest.fn().mockRejectedValue(new Error('Validation failed'));
      PatientModel.mockImplementation(() => ({
        save: saveMock
      }));

      // act
      await addPatient(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Validation failed' });
    });
  });

  //test - get all patients
  describe('getAllPatients', () => {
    it('should return all patients successfully', async () => {
      // arrange - normal
      const mockChain = {
        sort: jest.fn().mockResolvedValue([mockPatient])
      };
      PatientModel.find = jest.fn().mockReturnValue(mockChain);

      // act
      await getAllPatients(req, res);

      // assert
      expect(PatientModel.find).toHaveBeenCalledWith();
      expect(mockChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith([mockPatient]);
    });

    it('should return empty array when no patients exist', async () => {
      // arrange - no patients, empty result
      const mockChain = {
        sort: jest.fn().mockResolvedValue([])
      };
      PatientModel.find = jest.fn().mockReturnValue(mockChain);

      // act
      await getAllPatients(req, res);

      // assert
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database errors', async () => {
      // arrange - db error- query rejection
      const mockChain = {
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      PatientModel.find = jest.fn().mockReturnValue(mockChain);

      // act
      await getAllPatients(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  //get patient by scanned qr code
  describe('getPatientByQRCode', () => {
    it('should return patient by QR code successfully', async () => {
      // arrange - normal
      req.params.qrCode = 'PAT-ABCD1234';
      PatientModel.findOne = jest.fn().mockResolvedValue(mockPatient);

      // act
      await getPatientByQRCode(req, res);

      // assert
      expect(PatientModel.findOne).toHaveBeenCalledWith({ patientId: 'PAT-ABCD1234' });
      expect(res.json).toHaveBeenCalledWith(mockPatient);
    });

    it('should return 404 when patient not found', async () => {
      // arrange - patient not found - returns 404
      req.params.qrCode = 'PAT-INVALID';
      PatientModel.findOne = jest.fn().mockResolvedValue(null);

      // act
      await getPatientByQRCode(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Patient not found' });
    });

    it('should handle database errors', async () => {
      // arrange - db errors
      req.params.qrCode = 'PAT-ABCD1234';
      PatientModel.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      // act
      await getPatientByQRCode(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  //get patient by id
  describe('getPatientById', () => {
    it('should return patient by ID successfully', async () => {
      // arrange - normal
      req.params.id = mockPatient._id;
      PatientModel.findById = jest.fn().mockResolvedValue(mockPatient);

      // act
      await getPatientById(req, res);

      // assert
      expect(PatientModel.findById).toHaveBeenCalledWith(mockPatient._id);
      expect(res.json).toHaveBeenCalledWith(mockPatient);
    });

    it('should return 404 when patient not found', async () => {
      // arrange - patient not found - return 404
      req.params.id = 'nonexistent-id';
      PatientModel.findById = jest.fn().mockResolvedValue(null);

      // act
      await getPatientById(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Patient not found' });
    });

    it('should handle database errors', async () => {
      // arrange - db errors
      req.params.id = mockPatient._id;
      PatientModel.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      // act
      await getPatientById(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

    it('should handle invalid ObjectId format', async () => {
      // arrange - bad id - throws cast error
      req.params.id = 'invalid-id-format';
      PatientModel.findById = jest.fn().mockRejectedValue(new Error('Cast to ObjectId failed'));

      // act
      await getPatientById(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cast to ObjectId failed' });
    });
  });

  //delete a patient
  describe('deletePatient', () => {
    it('should delete patient successfully', async () => {
      // arrange - normal
      req.params.id = mockPatient._id;
      PatientModel.findByIdAndDelete = jest.fn().mockResolvedValue(mockPatient);

      // act
      await deletePatient(req, res);

      // assert
      expect(PatientModel.findByIdAndDelete).toHaveBeenCalledWith(mockPatient._id);
      expect(res.json).toHaveBeenCalledWith({ message: 'Patient deleted successfully' });
    });

    it('should return 404 when patient not found', async () => {
      // arrange - can't delete - patient not found
      req.params.id = 'nonexistent-id';
      PatientModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      // act
      await deletePatient(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Patient not found' });
    });

    it('should handle database errors', async () => {
      // arrange - db error
      req.params.id = mockPatient._id;
      PatientModel.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Database error'));

      // act
      await deletePatient(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

    it('should handle invalid ObjectId format during delete', async () => {
      // arrange - bad object id - cast error thrown
      req.params.id = 'invalid-id';
      PatientModel.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Cast to ObjectId failed'));

      // act
      await deletePatient(req, res);

      // assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cast to ObjectId failed' });
    });
  });
});