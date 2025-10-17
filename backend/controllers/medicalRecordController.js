import MedicalRecordModel from '../models/MedicalRecordModel.js';
import PatientModel from '../models/PatientModel.js';

class MedicalRecordService {
  constructor(MedicalRecordModel, PatientModel) {
    this.MedicalRecordModel = MedicalRecordModel;
    this.PatientModel = PatientModel;
  }

  async getAll() {
    return await this.MedicalRecordModel.find()
      .populate('patientId', 'name patientId age gender')
      .sort({ appointmentDate: -1 }); // Most recent first
  }

  async getByPatient(patientId) {
    return await this.MedicalRecordModel.find({ patientId })
      .populate('patientId', 'name patientId age gender')
      .sort({ appointmentDate: -1 });
  }

  async getById(id) {
    const record = await this.MedicalRecordModel.findById(id)
      .populate('patientId', 'name age gender contact');

    if (!record) {
      throw new Error('Medical record not found');
    }

    return record;
  }

  async create(data) {
    const { patientId, appointmentDate, department, doctor, diagnoses, comments } = data;

    // Check if patient exists
    const patient = await this.PatientModel.findById(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    const newRecord = new this.MedicalRecordModel({
      patientId,
      appointmentDate,
      department,
      doctor,
      diagnoses,
      comments
    });

    return await newRecord.save();
  }

  async update(id, updates) {
    const updatedRecord = await this.MedicalRecordModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      throw new Error('Medical record not found');
    }

    return updatedRecord;
  }

  async delete(id) {
    const deletedRecord = await this.MedicalRecordModel.findByIdAndDelete(id);

    if (!deletedRecord) {
      throw new Error('Medical record not found');
    }

    return { message: 'Medical record deleted successfully' };
  }
}

const service = new MedicalRecordService(MedicalRecordModel, PatientModel);

// Get all medical records
const getAllMedicalRecords = async (req, res) => {
  try {
    const records = await service.getAll();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatientMedicalRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await service.getByPatient(patientId);
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get record by id
const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await service.getById(id);
    res.status(200).json(record);
  } catch (error) {
    if (error.message === 'Medical record not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// Create new medical record
const createMedicalRecord = async (req, res) => {
  try {
    const newRecord = await service.create(req.body);
    res.status(201).json(newRecord);
  } catch (error) {
    if (error.message === 'Patient not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update a medical record
const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRecord = await service.update(id, req.body);
    res.status(200).json(updatedRecord);
  } catch (error) {
    if (error.message === 'Medical record not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete medical record
const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    await service.delete(id);
    res.status(200).json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    if (error.message === 'Medical record not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllMedicalRecords,
  getPatientMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
};