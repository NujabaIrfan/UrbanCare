const express = require('express');
const router = express.Router();
const PatientModel = require('../models/PatientModel');
const QRCode = require('qrcode');
const {v4: uuidv4} = require('uuid');

//add patient
router.post('/', async (req, res)=> {
    try{
        const{name, age, gender, contact, medicalHistory} = req.body;

        //generate patient id
        const patientId = `PAT-${uuidv4().slice(0,8).toUpperCase()}`;

        //generate qrcode as base64
        const qrCodeData = await QRCode.toDataURL(patientId);

        const patient = new PatientModel({
            patientId,
            name,
            age,
            gender,
            contact,
            medicalHistory,
            qrCode: qrCodeData
        });

        await patient.save();
        res.status(201).json(patient);
    } catch(error){
        res.status(400).json({error: error.message});
    }
});

//fetch all patients
router.get('/', async(req, res)=>{
    try{
        const patients = await PatientModel.find().sort({ createdAt: -1 });
res.json(patients);
    } catch(error){
        res.status(500).json({error: error.message});
    }
});

//search by qr
router.get('/lookup/:qrCode', async(req, res)=> {
    try{
        const patient = await PatientModel.findOne({patientId: req.params.qrCode});
        if(!patient){
            return res.status(404).json({error: 'Patient not found'});
        }
        res.json(patient);
    } catch(error){
        res.status(500).json({error: error.message});
    }
});

//fetch patient by id
router.get('/:id', async(req, res)=>{
    try{
        const patient = await PatientModel.findById(req.params.id);
        if(!patient){
            return res.status(404).json({error: 'Patient not found'});
        }
        res.json(patient);
    } catch(error){
        res.status(500).json({error:error.message});
    }
});

//delete patient
router.delete('/:id', async (req, res) => {
  try {
    const patient = await PatientModel.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;