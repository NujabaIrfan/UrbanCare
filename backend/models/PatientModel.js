const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true,
    },
    contact: {
        type: String,
        required: true
        
    },
    medicalHistory: {
        type: String,
        default: ''
    },
    qrCode: {
        type: String   //store base64 image
    },

}, {
    timestamps:true    //createdAt, updatedAt automatically
}

);

module.exports = mongoose.model('PatientModel', patientSchema);