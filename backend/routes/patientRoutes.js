import express from "express";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import PatientModel from "../models/PatientModel.js";

const router = express.Router();

// ➕ Add new patient
router.post("/", async (req, res) => {
  try {
    const { name, age, gender, contact, medicalHistory } = req.body;

    // Generate unique patient ID
    const patientId = `PAT-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Generate QR code as Base64
    const qrCodeData = await QRCode.toDataURL(patientId);

    const patient = new PatientModel({
      patientId,
      name,
      age,
      gender,
      contact,
      medicalHistory,
      qrCode: qrCodeData,
    });

    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📋 Fetch all patients
router.get("/", async (req, res) => {
  try {
    const patients = await PatientModel.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔍 Search patient by QR code value
router.get("/lookup/:qrCode", async (req, res) => {
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
});

// 🧾 Fetch patient by MongoDB ID
router.get("/:id", async (req, res) => {
  try {
    const patient = await PatientModel.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ❌ Delete patient
router.delete("/:id", async (req, res) => {
  try {
    const patient = await PatientModel.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
