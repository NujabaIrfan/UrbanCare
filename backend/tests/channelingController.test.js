jest.mock('../models/appointmentModel.js');
jest.mock('../helpers/appointmentHelpers.js');
jest.mock('../config/constants.js');

import Appointment from '../models/appointmentModel.js';
import { 
  findAppointmentByIdAndOwner, 
  checkAppointmentModifiable, 
  checkTimeSlotConflict 
} from '../helpers/appointmentHelpers.js';
import { 
  getUserAppointments,
  updateAppointment,
  cancelAppointment,
  getAllAppointments,
  deleteAppointment,
  updateAppointmentStatus
} from '../controllers/channelingController.js';

const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const MODIFIABLE_STATUSES = ['pending', 'confirmed'];

require('../config/constants.js').APPOINTMENT_STATUS = APPOINTMENT_STATUS;
require('../config/constants.js').MODIFIABLE_STATUSES = MODIFIABLE_STATUSES;

// Create a mock chainable function
const createMockChain = (mockData) => {
  const chain = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    // Add mockResolvedValue at the end of the chain
    mockResolvedValue: jest.fn().mockResolvedValue(mockData)
  };
  return chain;
};

describe('Appointment Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  // getUserAppointments Tests - FIXED
  describe('getUserAppointments', () => {
    it('should return all appointments for logged-in user', async () => {
      req.user = { id: 'user123' };

      const mockAppointments = [
        {
          _id: 'appointment1',
          patientId: 'user123',
          appointmentDate: '2024-01-15',
          appointmentTime: '10:00',
          status: APPOINTMENT_STATUS.CONFIRMED
        }
      ];

      // Fix the mock chain
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockAppointments)
      };

      Appointment.find.mockReturnValue(mockChain);

      await getUserAppointments(req, res);

      expect(Appointment.find).toHaveBeenCalledWith({ patientId: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        appointments: mockAppointments
      });
    });

    it('should handle errors when fetching appointments', async () => {
      req.user = { id: 'user123' };

      // Fix error mock
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      Appointment.find.mockReturnValue(mockChain);

      await getUserAppointments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  // updateAppointment Tests - FIXED
  describe('updateAppointment', () => {
    it('should update appointment successfully', async () => {
      req.params.id = 'appointment123';
      req.user = { id: 'user123' };
      req.body = {
        appointmentDate: '2024-01-20',
        appointmentTime: '14:00',
        symptoms: 'Fever and cough',
        notes: 'Regular checkup'
      };

      const mockAppointment = {
        _id: 'appointment123',
        patientId: 'user123',
        doctorId: 'doctor123',
        appointmentDate: '2024-01-15',
        appointmentTime: '10:00',
        symptoms: 'Headache',
        notes: '',
        status: APPOINTMENT_STATUS.PENDING
      };

      const updatedAppointment = {
        ...mockAppointment,
        ...req.body,
        updatedAt: new Date()
      };

      findAppointmentByIdAndOwner.mockResolvedValue(mockAppointment);
      checkAppointmentModifiable.mockReturnValue(true);
      checkTimeSlotConflict.mockResolvedValue(true);

      // Fix the mock chain for findByIdAndUpdate
      Appointment.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedAppointment)
      });

      await updateAppointment(req, res);

      expect(findAppointmentByIdAndOwner).toHaveBeenCalledWith('appointment123', 'user123');
      expect(checkAppointmentModifiable).toHaveBeenCalledWith(mockAppointment);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Appointment updated successfully',
        appointment: updatedAppointment
      });
    });

    it('should handle time slot conflict error', async () => {
      req.params.id = 'appointment123';
      req.user = { id: 'user123' };
      req.body = { appointmentDate: '2024-01-20', appointmentTime: '14:00' };

      const mockAppointment = {
        _id: 'appointment123',
        patientId: 'user123',
        doctorId: 'doctor123',
        appointmentDate: '2024-01-15',
        appointmentTime: '10:00',
        status: APPOINTMENT_STATUS.PENDING
      };

      findAppointmentByIdAndOwner.mockResolvedValue(mockAppointment);
      checkAppointmentModifiable.mockReturnValue(true);

      const conflictError = new Error('Time slot not available');
      conflictError.statusCode = 400;
      checkTimeSlotConflict.mockRejectedValue(conflictError);

      await updateAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Time slot not available'
      });
    });
  });

  // cancelAppointment Tests - FIXED
  describe('cancelAppointment', () => {
    it('should cancel appointment successfully', async () => {
      req.params.id = 'appointment123';
      req.user = { id: 'user123' };

      const mockAppointment = {
        _id: 'appointment123',
        patientId: 'user123',
        status: APPOINTMENT_STATUS.PENDING,
        doctorId: 'doctor123'
      };

      const cancelledAppointment = {
        ...mockAppointment,
        status: APPOINTMENT_STATUS.CANCELLED,
        cancelledAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      findAppointmentByIdAndOwner.mockResolvedValue(mockAppointment);

      // Fix the mock chain
      Appointment.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(cancelledAppointment)
      });

      await cancelAppointment(req, res);

      expect(findAppointmentByIdAndOwner).toHaveBeenCalledWith('appointment123', 'user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Appointment cancelled successfully',
        appointment: cancelledAppointment
      });
    });

    it('should not cancel completed appointment', async () => {
      req.params.id = 'appointment123';
      req.user = { id: 'user123' };

      const mockAppointment = {
        _id: 'appointment123',
        patientId: 'user123',
        status: APPOINTMENT_STATUS.COMPLETED
      };

      findAppointmentByIdAndOwner.mockResolvedValue(mockAppointment);

      await cancelAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Cannot cancel completed appointments'
      });
    });
  });

  // getAllAppointments Tests (Admin) - FIXED
  describe('getAllAppointments', () => {
    it('should return all appointments for admin', async () => {
      const mockAppointments = [
        {
          _id: 'appointment1',
          patientId: { name: 'John Doe', email: 'john@example.com' },
          doctorId: { name: 'Dr. Smith', specialization: 'Cardiology' },
          status: APPOINTMENT_STATUS.CONFIRMED
        }
      ];

      // Fix the complex mock chain
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockAppointments)
      };

      Appointment.find.mockReturnValue(mockChain);

      await getAllAppointments(req, res);

      expect(Appointment.find).toHaveBeenCalledWith();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        appointments: mockAppointments
      });
    });
  });

  // deleteAppointment Tests (Admin) - FIXED
  describe('deleteAppointment', () => {
    it('should delete appointment successfully', async () => {
      req.params.id = 'appointment123';
      const mockAppointment = { _id: 'appointment123', patientId: 'user123', doctorId: 'doctor123' };

      Appointment.findByIdAndDelete.mockResolvedValue(mockAppointment);

      await deleteAppointment(req, res);

      expect(Appointment.findByIdAndDelete).toHaveBeenCalledWith('appointment123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Appointment deleted successfully' });
    });

    it('should return 404 if appointment not found', async () => {
      req.params.id = 'appointment999';
      Appointment.findByIdAndDelete.mockResolvedValue(null);

      await deleteAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Appointment not found' });
    });
  });

  // updateAppointmentStatus Tests (Admin) - FIXED
  describe('updateAppointmentStatus', () => {
    it('should update appointment status successfully', async () => {
      req.params.id = 'appointment123';
      req.body = { status: APPOINTMENT_STATUS.CONFIRMED };

      const updatedAppointment = {
        _id: 'appointment123',
        status: APPOINTMENT_STATUS.CONFIRMED,
        patientId: { name: 'John Doe', email: 'john@example.com' },
        doctorId: { name: 'Dr. Smith', specialization: 'Cardiology' }
      };

      // Fix the double populate chain
      const mockChain = {
        populate: jest.fn().mockReturnThis()
      };
      
      // Mock the second populate call to return the resolved value
      mockChain.populate.mockImplementation((field, selection) => {
        if (selection === 'name email') {
          return {
            populate: jest.fn().mockResolvedValue(updatedAppointment)
          };
        }
        return mockChain;
      });

      Appointment.findByIdAndUpdate.mockReturnValue(mockChain);

      await updateAppointmentStatus(req, res);

      expect(Appointment.findByIdAndUpdate).toHaveBeenCalledWith(
        'appointment123',
        { status: APPOINTMENT_STATUS.CONFIRMED, updatedAt: expect.any(Date) },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: `Appointment status updated to ${APPOINTMENT_STATUS.CONFIRMED}`,
        appointment: updatedAppointment
      });
    });

    it('should return 400 for invalid status', async () => {
      req.params.id = 'appointment123';
      req.body = { status: 'invalid_status' };

      await updateAppointmentStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Invalid status')
      });
    });

    it('should return 404 if appointment not found', async () => {
      req.params.id = 'appointment999';
      req.body = { status: APPOINTMENT_STATUS.CONFIRMED };

      // Mock the chain to return null
      const mockChain = {
        populate: jest.fn().mockReturnThis()
      };
      mockChain.populate.mockImplementation((field, selection) => {
        if (selection === 'name email') {
          return {
            populate: jest.fn().mockResolvedValue(null)
          };
        }
        return mockChain;
      });

      Appointment.findByIdAndUpdate.mockReturnValue(mockChain);

      await updateAppointmentStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Appointment not found'
      });
    });
  });
});