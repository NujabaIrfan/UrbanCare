import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import PatientModel from "../models/PatientModel.js";
import { StatusCodes } from "http-status-codes"

//add new patient
export const addPatient = async (req, res) => {
  try {
    const { name, age, gender, contact, medicalHistory, email } = req.body;
    
    // generate patient id
    const patientId = `PAT-${uuidv4().slice(0, 8).toUpperCase()}`;
    
    // generate qr code as Base64
    const qrCodeData = await QRCode.toDataURL(patientId);
    
    const patient = new PatientModel({
      patientId,
      name,
      age,
      gender,
      contact,
      medicalHistory,
      qrCode: qrCodeData,
      email
    });
    
    await patient.save();
    res.status(StatusCodes.CREATED).json(patient);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

// get all patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await PatientModel.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// search patient by qr code value
export const getPatientByQRCode = async (req, res) => {
  try {
    const patient = await PatientModel.findOne({
      patientId: req.params.qrCode,
    });
    
    if (!patient) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Patient not found" });
    }
    
    res.json(patient);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// fetch patient by id
export const getPatientById = async (req, res) => {
  try {
    const patient = await PatientModel.findById(req.params.id);
    
    if (!patient) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Patient not found" });
    }
    
    res.json(patient);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

//delete patient
export const deletePatient = async (req, res) => {
  try {
    const patient = await PatientModel.findByIdAndDelete(req.params.id);
    
    if (!patient) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Patient not found" });
    }
    
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};