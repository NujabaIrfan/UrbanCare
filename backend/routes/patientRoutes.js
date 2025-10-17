import express from "express";
import {
  addPatient,
  getAllPatients,
  getPatientByQRCode,
  getPatientById,
  deletePatient
} from "../controllers/patientController.js";

const router = express.Router();

// add new patient
router.post("/", addPatient);

// getall patients
router.get("/", getAllPatients);

// search patient by qr code value
router.get("/lookup/:qrCode", getPatientByQRCode);

// get patient by id
router.get("/:id", getPatientById);

// delete patient
router.delete("/:id", deletePatient);

export default router;