import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid"; //for unique patient ids
import PatientModel from "../models/PatientModel.js";

// add a new patient
export const addPatient = async (req, res) => {
  try {
    const { name, age, gender, contact, medicalHistory, email } = req.body;
    
    // auto generate unique patient ID - eg; PAT-ABC123DE
    const patientId = `PAT-${uuidv4().slice(0, 8).toUpperCase()}`;
    
    // generate qr code as data url (to store directly)
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
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// fetch all patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await PatientModel.find().sort({ createdAt: -1 }); //newest first
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// search patient by scanning the qr code - patient id
export const getPatientByQRCode = async (req, res) => {
  try {
    const patient = await PatientModel.findOne({
      patientId: req.params.qrCode,
    });
    
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get a patient by id
export const getPatientById = async (req, res) => {
  try {
    const patient = await PatientModel.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// deletea patient
export const deletePatient = async (req, res) => {
  try {
    const patient = await PatientModel.findByIdAndDelete(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};