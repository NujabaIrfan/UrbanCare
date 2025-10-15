import { beforeEach, describe, expect, jest } from "@jest/globals";
import { generatePatientId, generateQRCode } from "../services/patientService";

// mock before importing
jest.unstable_mockModule("../services/patientService.js", () => ({
  generatePatientId: jest.fn(),
  generateQRCode: jest.fn(),
}));

jest.unstable_mockModule("../models/PatientModel.js", () => ({
  default: jest.fn(),
}));

//imports
const { createPatient } = await import("../controllers/patientController.js");
const patientService = await import("../services/patientService.js");
const PatientModelModule = await import("../models/PatientModel.js");
const PatientModel = PatientModelModule.default;

describe("PatientController - createPatient", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: "John Doe",
        age: 35,
        gender: "Male",
        contact: "+1234567890",
        medicalHistory: "None"
      }
    };

    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    jest.clearAllMocks();
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
    
    PatientModel.mockImplementation(() => mockPatient);

    // act
    await createPatient(req, res);

    // assert
    expect(patientService.generatePatientId).toHaveBeenCalled();
    expect(patientService.generateQRCode).toHaveBeenCalledWith('PAT-12345678');
    expect(mockPatient.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should return 400 on error', async()=> {
    //arrange
    patientService.generatePatientId.mockReturnValue('PAT-12345678');
    patientService.generateQRCode.mockRejectedValue(new Error('Failed'));

    //act
    await createPatient(req, res);

    //assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({error: 'Failed'});
  });
});
