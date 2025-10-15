import express from "express";
const router = express.Router();
import {
  getAllMedicalRecords,
  getPatientMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
} from '../controllers/medicalRecordController.js';

// Get all medical records (add this BEFORE the /:id route)
router.get('/', getAllMedicalRecords);

// Get all medical records for a specific patient
router.get('/patients/:patientId', getPatientMedicalRecords);

// Get a single medical record by ID
router.get('/:id', getMedicalRecordById);

// Create a new medical record
router.post('/', createMedicalRecord);

// Update a medical record
router.put('/:id', updateMedicalRecord);

// Delete a medical record
router.delete('/:id', deleteMedicalRecord);

export default router;

