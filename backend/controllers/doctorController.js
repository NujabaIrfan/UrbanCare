import User from '../models/userModel.js';
import Patient from '../models/PatientModel.js';
import Appointment from '../models/appointmentModel.js';
import sendEmail from '../config/nodemailer.js';
import { appointmentTemplate } from '../emailTemplates/appointmentTemplate.js';
import { APPOINTMENT_STATUS, MODIFIABLE_STATUSES } from '../config/constants.js';
import { 
    checkTimeSlotConflict,
    findAppointmentByIdAndDoctor,
    generateAppointmentNumber
} from '../helpers/doctorHelper.js';

// Get all doctors
export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' })
            .select('name email specialization qualification experience availableDays availableTime contactNumber');
        
        res.json({
            success: true,
            doctors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get single doctor details
export const getDoctorById = async (req, res) => {
    try {
        const doctor = await User.findOne({ 
            _id: req.params.id, 
            role: 'doctor' 
        }).select('-password -otp -otpCreatedAt');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Book appointment
export const bookAppointment = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const { appointmentDate, appointmentTime, symptoms, notes } = req.body;

        if (!appointmentDate || !appointmentTime || !symptoms) {
            return res.status(400).json({
                success: false,
                message: 'Appointment date, time, and symptoms are required'
            });
        }

        const doctorId = req.params.id;
        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Doctor ID is required'
            });
        }

        const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        const patientProfile = await Patient.findOne({ patientId: "PAT-E75B964F" });
        {/*const patientProfile = await Patient.findOne({ userId: req.user.id });*/}

        if (!patientProfile) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found. Please complete your patient registration first.'
            });
        }

        if (!patientProfile.contact) {
            return res.status(400).json({
                success: false,
                message: 'Please add your contact number to your patient profile before booking appointments.'
            });
        }

        const existingAppointment = await Appointment.findOne({
            doctorId,
            appointmentDate,
            appointmentTime,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'Time slot already booked'
            });
        }

        let appointmentNumber;
        const lastAppointment = await Appointment.findOne()
            .sort({ createdAt: -1 })
            .select('appointmentNumber');

        if (!lastAppointment || !lastAppointment.appointmentNumber) {
            appointmentNumber = '1';
        } else {
            const lastNumber = Number(lastAppointment.appointmentNumber);
            appointmentNumber = String(isNaN(lastNumber) ? 1 : lastNumber + 1);
        }

        const appointment = new Appointment({
            patientId: req.user.id,
            doctorId,
            appointmentDate,
            appointmentTime,
            symptoms,
            notes: notes || '',
            patientName: patientProfile.name,
            patientContact: patientProfile.contact,
            status: 'pending',
            appointmentNumber
        });

        await appointment.save();

        try {
            const emailSubject = `Appointment Confirmation - ${appointmentNumber}`;
            const emailMessage = appointmentTemplate({
                patientName: patientProfile.name,
                doctorName: doctor.name,
                appointmentNumber,
                appointmentDate,
                appointmentTime,
                symptoms,
                notes: notes || 'N/A',
                doctorContact: doctor.contactNumber || 'N/A'
            });

            const user = await User.findById(req.user.id);
            await sendEmail(user.email, emailSubject, emailMessage);
        } catch (err) {
            console.error('Failed to send appointment email:', err);
        }

        res.status(201).json({
            success: true,
            message: `Appointment booked successfully! Your appointment number is: ${appointmentNumber}`,
            appointment: {
                id: appointment._id,
                appointmentNumber: appointment.appointmentNumber,
                date: appointment.appointmentDate,
                time: appointment.appointmentTime,
                doctor: doctor.name,
                patient: patientProfile.name,
                status: appointment.status
            }
        });

    } catch (error) {
        console.error('Booking error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update appointment status (for doctor)
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointmentId = req.params.appointmentId;

        if (!Object.values(APPOINTMENT_STATUS).includes(status)) throw { statusCode: 400, message: 'Invalid status' };

        const appointment = await findAppointmentByIdAndDoctor(appointmentId, req.user.id);

        appointment.status = status;
        await appointment.save();

        res.json({ success: true, message: 'Status updated successfully', appointment });

    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server error' });
    }
};
