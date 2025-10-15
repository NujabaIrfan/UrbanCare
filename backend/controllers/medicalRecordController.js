const MedicalRecordModel = require('../models/MedicalRecordModel');
const PatientModel = require('../models/PatientModel');

// Get all medical records
const getAllMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecordModel.find()
      .populate('patientId', 'name patientId age gender')
      .sort({ appointmentDate: -1 }); // Most recent first
    
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatientMedicalRecords = async(req, res)=>{
    try{
        const{ patientId } = req.params;
        const records = await MedicalRecordModel.find({patientId})
        .populate('patientId', 'name patientId age gender')  // Added: Populate for patient details
        .sort({appointmentDate: -1});
        res.status(200).json(records);
    } catch (error){
        res.status(500).json({ message: error.message });
    }
};

//get record by id
const getMedicalRecordById = async(req, res)=>{
    try{
        const { id } = req.params;

         const record = await MedicalRecordModel.findById(id)
      .populate('patientId', 'name age gender contact');

        if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.status(200).json(record);
    } catch(error){
        res.status(500).json({ message: error.message });
    }
};

//create new medical record
const createMedicalRecord = async(req, res)=> {
    try{
        const { patientId, appointmentDate, department, doctor, diagnoses, comments } = req.body;

        //check if patient exists
         const patient = await PatientModel.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
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
    res.status(201).json(newRecord);
    } catch(error){
        res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    res.status(200).json(updatedRecord);
    } catch(error){
        res.status(500).json({ message: error.message });
    }
};

//delete medical record
const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRecord = await MedicalRecordModel.findByIdAndDelete(id);
    
    if (!deletedRecord) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    res.status(200).json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllMedicalRecords,
  getPatientMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
};