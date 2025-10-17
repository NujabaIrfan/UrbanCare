import Appointment from '../models/appointmentModel.js';
import { APPOINTMENT_STATUS, MODIFIABLE_STATUSES } from '../config/constants.js';
import { findAppointmentByIdAndOwner, checkAppointmentModifiable, checkTimeSlotConflict } from '../helpers/appointmentHelpers.js';

// Get all appointments for the logged-in user
export const getUserAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const appointments = await Appointment.find({ patientId: userId })
            .populate('doctorId', 'name specialization qualification email contactNumber')
            .sort({ appointmentDate: -1, appointmentTime: -1 });

        res.status(200).json({ success: true, appointments });

    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to fetch appointments' });
    }
};

// Update appointment (patient)
export const updateAppointment = async (req, res) => {
    try {
        const { appointmentDate, appointmentTime, symptoms, notes } = req.body;
        const appointmentId = req.params.id;
        const userId = req.user.id;

        const appointment = await findAppointmentByIdAndOwner(appointmentId, userId);
        checkAppointmentModifiable(appointment);

        if (appointmentDate !== appointment.appointmentDate || appointmentTime !== appointment.appointmentTime) {
            await checkTimeSlotConflict(
                appointment.doctorId, 
                appointmentDate || appointment.appointmentDate, 
                appointmentTime || appointment.appointmentTime, 
                appointmentId
            );
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {
                appointmentDate: appointmentDate || appointment.appointmentDate,
                appointmentTime: appointmentTime || appointment.appointmentTime,
                symptoms: symptoms || appointment.symptoms,
                notes: notes || appointment.notes,
                updatedAt: new Date()
            },
            { new: true }
        ).populate('doctorId', 'name specialization qualification');

        res.status(200).json({ success: true, message: 'Appointment updated successfully', appointment: updatedAppointment });

    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to update appointment' });
    }
};

// Cancel appointment (patient)
export const cancelAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const userId = req.user.id;

        const appointment = await findAppointmentByIdAndOwner(appointmentId, userId);

        if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
            return res.status(400).json({ success: false, message: 'Cannot cancel completed appointments' });
        }

        if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
            return res.status(400).json({ success: false, message: 'Appointment is already cancelled' });
        }

        const cancelledAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: APPOINTMENT_STATUS.CANCELLED, cancelledAt: new Date(), updatedAt: new Date() },
            { new: true }
        ).populate('doctorId', 'name specialization qualification');

        res.status(200).json({ success: true, message: 'Appointment cancelled successfully', appointment: cancelledAppointment });

    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to cancel appointment' });
    }
};

// Get all appointments (Admin)
export const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patientId', 'name email contactNumber')
            .populate('doctorId', 'name specialization qualification')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, appointments });

    } catch (error) {
        console.error('Get all appointments error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to fetch appointments' });
    }
};

// Delete appointment (Admin)
export const deleteAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const appointment = await Appointment.findByIdAndDelete(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.status(200).json({ success: true, message: 'Appointment deleted successfully' });

    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to delete appointment' });
    }
};

// Update appointment status (Admin)
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointmentId = req.params.id;

        if (!Object.values(APPOINTMENT_STATUS).includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be: ${Object.values(APPOINTMENT_STATUS).join(', ')}`
            });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status, updatedAt: new Date() },
            { new: true }
        ).populate('patientId', 'name email')
         .populate('doctorId', 'name specialization');

        if (!updatedAppointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.status(200).json({ success: true, message: `Appointment status updated to ${status}`, appointment: updatedAppointment });

    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to update appointment status' });
    }
};
