import express from "express";
import {
  addPatient,
  getAllPatients,
  getPatientByQRCode,
  getPatientById,
  deletePatient
} from "../controllers/patientController.js";

const router = express.Router();

// Add new patient
router.post("/", addPatient);

// Fetch all patients
router.get("/", getAllPatients);

// Search patient by QR code value
router.get("/lookup/:qrCode", getPatientByQRCode);

// Fetch patient by MongoDB ID
router.get("/:id", getPatientById);

// Delete patient
router.delete("/:id", deletePatient);

export default router;