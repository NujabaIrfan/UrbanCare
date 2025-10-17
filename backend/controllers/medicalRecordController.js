import MedicalRecordModel from '../models/MedicalRecordModel.js';
import PatientModel from '../models/PatientModel.js';
import { StatusCodes } from "http-status-codes"

// Get all medical records
const getAllMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecordModel.find()
      .populate('patientId', 'name patientId age gender')
      .sort({ appointmentDate: -1 }); // Most recent first
    
    res.status(StatusCodes.OK).json(records);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getPatientMedicalRecords = async(req, res)=>{
    try{
        const{ patientId } = req.params;
        const records = await MedicalRecordModel.find({patientId})
        .populate('patientId', 'name patientId age gender')  // Added: Populate for patient details
        .sort({appointmentDate: -1});
        res.status(StatusCodes.OK).json(records);
    } catch (error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

//get record by id
const getMedicalRecordById = async(req, res)=>{
    try{
        const { id } = req.params;

         const record = await MedicalRecordModel.findById(id)
      .populate('patientId', 'name age gender contact');

        if (!record) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Medical record not found' });
    }

    res.status(StatusCodes.OK).json(record);
    } catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

//create new medical record
const createMedicalRecord = async(req, res)=> {
    try{
        const { patientId, appointmentDate, department, doctor, diagnoses, comments } = req.body;

        //check if patient exists
         const patient = await PatientModel.findById(patientId);
    if (!patient) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Patient not found' });
    }

     const newRecord = new MedicalRecordModel({
      patientId,
      appointmentDate,
      department,
      doctor,
      diagnoses,
      comments
    });

    await newRecord.save();
    res.status(StatusCodes.CREATED).json(newRecord);
    } catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

//update a medical record
const updateMedicalRecord = async(req, res)=> {
    try{
        const { id } = req.params;
    const updates = req.body;

     const updatedRecord = await MedicalRecordModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!updatedRecord) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Medical record not found' });
    }
    
    res.status(StatusCodes.OK).json(updatedRecord);
    } catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

//delete medical record
const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRecord = await MedicalRecordModel.findByIdAndDelete(id);
    
    if (!deletedRecord) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Medical record not found' });
    }
    
    res.status(StatusCodes.OK).json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
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