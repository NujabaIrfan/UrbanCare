import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentNumber: { type: String, unique: true, required: true }, // ✅ Use Number for sequence
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    symptoms: { type: String, required: true },
    notes: { type: String, default: '' },
    patientName: { type: String, required: true },
    patientContact: { type: String, required: true },
    status: { 
        type: String, 
        default: 'pending', 
        enum: ['pending', 'confirmed', 'completed', 'cancelled'] 
    },
    mode: {
        type: String,
        default: 'physical',
        enum: ['physical', 'online']
    },
    cancelledAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
