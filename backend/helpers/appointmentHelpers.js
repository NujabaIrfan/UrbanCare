import Appointment from '../models/appointmentModel.js';
import { APPOINTMENT_STATUS, MODIFIABLE_STATUSES } from '../config/constants.js';

//Find appointment by ID and verify ownership (for patients)
export const findAppointmentByIdAndOwner = async (appointmentId, userId) => {
    const appointment = await Appointment.findOne({ _id: appointmentId, patientId: userId });
    if (!appointment) {
        const error = new Error('Appointment not found');
        error.statusCode = 404;
        throw error;
    }
    return appointment;
};

//Check if appointment can be modified (not completed or cancelled)
export const checkAppointmentModifiable = (appointment) => {
    if ([APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED].includes(appointment.status)) {
        const error = new Error('Cannot modify completed or cancelled appointments');
        error.statusCode = 400;
        throw error;
    }
};


//Check if a new date/time conflicts with existing appointments
export const checkTimeSlotConflict = async (doctorId, date, time, currentAppointmentId) => {
    const existingAppointment = await Appointment.findOne({
        doctorId,
        appointmentDate: date,
        appointmentTime: time,
        status: { $in: MODIFIABLE_STATUSES },
        _id: { $ne: currentAppointmentId }
    });

    if (existingAppointment) {
        const error = new Error('Time slot already booked. Please choose a different time.');
        error.statusCode = 400;
        throw error;
    }
};
