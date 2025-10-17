import Appointment from '../models/appointmentModel.js';
import { APPOINTMENT_STATUS, MODIFIABLE_STATUSES } from '../config/constants.js';


//Find appointment by ID and verify ownership (patient)
export const findAppointmentByIdAndOwner = async (appointmentId, userId) => {
    const appointment = await Appointment.findOne({ _id: appointmentId, patientId: userId });
    if (!appointment) {
        const error = new Error('Appointment not found');
        error.statusCode = 404;
        throw error;
    }
    return appointment;
};

//Find appointment by ID and verify doctor ownership
export const findAppointmentByIdAndDoctor = async (appointmentId, doctorId) => {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        const error = new Error('Appointment not found');
        error.statusCode = 404;
        throw error;
    }

    if (appointment.doctorId.toString() !== doctorId) {
        const error = new Error('Not authorized to update this appointment');
        error.statusCode = 403;
        throw error;
    }

    return appointment;
};

//Check if appointment can be modified (patient)
export const checkAppointmentModifiable = (appointment) => {
    if ([APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED].includes(appointment.status)) {
        const error = new Error('Cannot modify completed or cancelled appointments');
        error.statusCode = 400;
        throw error;
    }
};

//Check for appointment time slot conflict
export const checkTimeSlotConflict = async (doctorId, date, time, excludeAppointmentId = null) => {
    const existing = await Appointment.findOne({
        doctorId,
        appointmentDate: date,
        appointmentTime: time,
        status: { $in: MODIFIABLE_STATUSES },
        _id: { $ne: excludeAppointmentId }
    });

    if (existing) {
        const error = new Error('Time slot already booked. Please choose a different time.');
        error.statusCode = 400;
        throw error;
    }
};

//Generate sequential appointment number
export const generateAppointmentNumber = async () => {
    const lastAppointment = await Appointment.findOne().sort({ createdAt: -1 }).select('appointmentNumber');
    if (!lastAppointment || !lastAppointment.appointmentNumber) return '1';
    const lastNumber = Number(lastAppointment.appointmentNumber);
    return String(isNaN(lastNumber) ? 1 : lastNumber + 1);
};
