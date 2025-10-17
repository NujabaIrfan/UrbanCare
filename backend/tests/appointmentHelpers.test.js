jest.mock('../models/appointmentModel.js');
jest.mock('../config/constants.js');

import Appointment from '../models/appointmentModel.js';
import {
    findAppointmentByIdAndOwner,
    checkAppointmentModifiable,
    checkTimeSlotConflict
} from '../helpers/appointmentHelpers.js';

const APPOINTMENT_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

const MODIFIABLE_STATUSES = ['pending', 'confirmed'];

require('../config/constants.js').APPOINTMENT_STATUS = APPOINTMENT_STATUS;
require('../config/constants.js').MODIFIABLE_STATUSES = MODIFIABLE_STATUSES;

describe('Appointment Helpers Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ✅ findAppointmentByIdAndOwner Tests
    describe('findAppointmentByIdAndOwner', () => {
        it('should return appointment when found for the owner', async () => {
            const mockAppointment = {
                _id: 'appointment123',
                patientId: 'user123',
                status: APPOINTMENT_STATUS.PENDING,
                appointmentDate: '2024-01-20',
                appointmentTime: '14:00'
            };

            Appointment.findOne.mockResolvedValue(mockAppointment);

            const result = await findAppointmentByIdAndOwner('appointment123', 'user123');

            expect(Appointment.findOne).toHaveBeenCalledWith({
                _id: 'appointment123',
                patientId: 'user123'
            });
            expect(result).toEqual(mockAppointment);
        });

        it('should throw 404 error when appointment not found for owner', async () => {
            Appointment.findOne.mockResolvedValue(null);

            await expect(findAppointmentByIdAndOwner('appointment999', 'user123'))
                .rejects
                .toMatchObject({
                    message: 'Appointment not found',
                    statusCode: 404
                });

            expect(Appointment.findOne).toHaveBeenCalledWith({
                _id: 'appointment999',
                patientId: 'user123'
            });
        });

        it('should throw 404 error when appointment belongs to different user', async () => {
            Appointment.findOne.mockResolvedValue(null);

            await expect(findAppointmentByIdAndOwner('appointment123', 'differentUser456'))
                .rejects
                .toMatchObject({
                    message: 'Appointment not found',
                    statusCode: 404
                });

            expect(Appointment.findOne).toHaveBeenCalledWith({
                _id: 'appointment123',
                patientId: 'differentUser456'
            });
        });

        it('should handle database errors', async () => {
            const dbError = new Error('Database connection failed');
            Appointment.findOne.mockRejectedValue(dbError);

            await expect(findAppointmentByIdAndOwner('appointment123', 'user123'))
                .rejects
                .toThrow('Database connection failed');
        });
    });

    // ✅ checkAppointmentModifiable Tests
    describe('checkAppointmentModifiable', () => {
        it('should allow modification for pending appointment', () => {
            const appointment = { 
                _id: 'appointment123',
                status: APPOINTMENT_STATUS.PENDING 
            };

            expect(() => checkAppointmentModifiable(appointment)).not.toThrow();
        });

        it('should allow modification for confirmed appointment', () => {
            const appointment = { 
                _id: 'appointment123',
                status: APPOINTMENT_STATUS.CONFIRMED 
            };

            expect(() => checkAppointmentModifiable(appointment)).not.toThrow();
        });

        it('should throw error for completed appointment', () => {
            const appointment = { 
                _id: 'appointment123',
                status: APPOINTMENT_STATUS.COMPLETED 
            };

            expect(() => checkAppointmentModifiable(appointment))
                .toThrow('Cannot modify completed or cancelled appointments');

            try {
                checkAppointmentModifiable(appointment);
            } catch (error) {
                expect(error.statusCode).toBe(400);
            }
        });

        it('should throw error for cancelled appointment', () => {
            const appointment = { 
                _id: 'appointment123',
                status: APPOINTMENT_STATUS.CANCELLED 
            };

            expect(() => checkAppointmentModifiable(appointment))
                .toThrow('Cannot modify completed or cancelled appointments');

            try {
                checkAppointmentModifiable(appointment);
            } catch (error) {
                expect(error.statusCode).toBe(400);
            }
        });

        it('should include statusCode 400 in thrown error for completed appointments', () => {
            const appointment = { 
                _id: 'appointment123',
                status: APPOINTMENT_STATUS.COMPLETED 
            };

            try {
                checkAppointmentModifiable(appointment);
            } catch (error) {
                expect(error.statusCode).toBe(400);
                expect(error.message).toBe('Cannot modify completed or cancelled appointments');
            }
        });

        it('should include statusCode 400 in thrown error for cancelled appointments', () => {
            const appointment = { 
                _id: 'appointment123',
                status: APPOINTMENT_STATUS.CANCELLED 
            };

            try {
                checkAppointmentModifiable(appointment);
            } catch (error) {
                expect(error.statusCode).toBe(400);
                expect(error.message).toBe('Cannot modify completed or cancelled appointments');
            }
        });
    });

    // ✅ checkTimeSlotConflict Tests
    describe('checkTimeSlotConflict', () => {
        it('should not throw error when no conflict exists', async () => {
            Appointment.findOne.mockResolvedValue(null);

            await expect(checkTimeSlotConflict('doctor123', '2024-01-20', '14:00', 'currentAppointment123'))
                .resolves
                .toBeUndefined();

            expect(Appointment.findOne).toHaveBeenCalledWith({
                doctorId: 'doctor123',
                appointmentDate: '2024-01-20',
                appointmentTime: '14:00',
                status: { $in: MODIFIABLE_STATUSES },
                _id: { $ne: 'currentAppointment123' }
            });
        });

        it('should not throw error when no currentAppointmentId provided', async () => {
            Appointment.findOne.mockResolvedValue(null);

            await expect(checkTimeSlotConflict('doctor123', '2024-01-20', '14:00'))
                .resolves
                .toBeUndefined();

            expect(Appointment.findOne).toHaveBeenCalledWith({
                doctorId: 'doctor123',
                appointmentDate: '2024-01-20',
                appointmentTime: '14:00',
                status: { $in: MODIFIABLE_STATUSES },
                _id: { $ne: undefined }
            });
        });

        it('should throw error when time slot conflict exists', async () => {
            const existingAppointment = {
                _id: 'existingAppointment456',
                doctorId: 'doctor123',
                appointmentDate: '2024-01-20',
                appointmentTime: '14:00',
                status: APPOINTMENT_STATUS.CONFIRMED
            };

            Appointment.findOne.mockResolvedValue(existingAppointment);

            await expect(checkTimeSlotConflict('doctor123', '2024-01-20', '14:00', 'currentAppointment123'))
                .rejects
                .toMatchObject({
                    message: 'Time slot already booked. Please choose a different time.',
                    statusCode: 400
                });

            expect(Appointment.findOne).toHaveBeenCalledWith({
                doctorId: 'doctor123',
                appointmentDate: '2024-01-20',
                appointmentTime: '14:00',
                status: { $in: MODIFIABLE_STATUSES },
                _id: { $ne: 'currentAppointment123' }
            });
        });

        it('should only check modifiable statuses (pending and confirmed) for conflicts', async () => {
            Appointment.findOne.mockResolvedValue(null);

            await checkTimeSlotConflict('doctor123', '2024-01-20', '14:00', 'currentAppointment123');

            expect(Appointment.findOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: { $in: MODIFIABLE_STATUSES }
                })
            );
        });

        it('should exclude current appointment from conflict check', async () => {
            Appointment.findOne.mockResolvedValue(null);

            await checkTimeSlotConflict('doctor123', '2024-01-20', '14:00', 'currentAppointment123');

            expect(Appointment.findOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    _id: { $ne: 'currentAppointment123' }
                })
            );
        });

        it('should handle conflict with pending status appointment', async () => {
            const existingAppointment = {
                _id: 'existingAppointment456',
                doctorId: 'doctor123',
                appointmentDate: '2024-01-20',
                appointmentTime: '14:00',
                status: APPOINTMENT_STATUS.PENDING
            };

            Appointment.findOne.mockResolvedValue(existingAppointment);

            await expect(checkTimeSlotConflict('doctor123', '2024-01-20', '14:00', 'currentAppointment123'))
                .rejects
                .toMatchObject({
                    message: 'Time slot already booked. Please choose a different time.',
                    statusCode: 400
                });
        });

        it('should handle conflict with confirmed status appointment', async () => {
            const existingAppointment = {
                _id: 'existingAppointment456',
                doctorId: 'doctor123',
                appointmentDate: '2024-01-20',
                appointmentTime: '14:00',
                status: APPOINTMENT_STATUS.CONFIRMED
            };

            Appointment.findOne.mockResolvedValue(existingAppointment);

            await expect(checkTimeSlotConflict('doctor123', '2024-01-20', '14:00', 'currentAppointment123'))
                .rejects
                .toMatchObject({
                    message: 'Time slot already booked. Please choose a different time.',
                    statusCode: 400
                });
        });

        it('should ignore completed appointments when checking conflicts', async () => {
            // Simulate that no conflict found because existing appointment is completed
            Appointment.findOne.mockResolvedValue(null);

            await expect(checkTimeSlotConflict('doctor123', '2024-01-20', '14:00', 'currentAppointment123'))
                .resolves
                .toBeUndefined();

            // The query should only look for pending and confirmed statuses
            expect(Appointment.findOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: { $in: ['pending', 'confirmed'] } // MODIFIABLE_STATUSES
                })
            );
        });

        it('should ignore cancelled appointments when checking conflicts', async () => {
            // Simulate that no conflict found because existing appointment is cancelled
            Appointment.findOne.mockResolvedValue(null);

            await expect(checkTimeSlotConflict('doctor123', '2024-01-20', '14:00', 'currentAppointment123'))
                .resolves
                .toBeUndefined();

            // The query should only look for pending and confirmed statuses
            expect(Appointment.findOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: { $in: ['pending', 'confirmed'] } // MODIFIABLE_STATUSES
                })
            );
        });

        it('should handle database errors during conflict check', async () => {
            const dbError = new Error('Database connection failed');
            Appointment.findOne.mockRejectedValue(dbError);

            await expect(checkTimeSlotConflict('doctor123', '2024-01-20', '14:00', 'currentAppointment123'))
                .rejects
                .toThrow('Database connection failed');
        });

        it('should check all required fields in conflict query', async () => {
            Appointment.findOne.mockResolvedValue(null);

            await checkTimeSlotConflict('doctor123', '2024-01-25', '10:30', 'appointment789');

            expect(Appointment.findOne).toHaveBeenCalledWith({
                doctorId: 'doctor123',
                appointmentDate: '2024-01-25',
                appointmentTime: '10:30',
                status: { $in: MODIFIABLE_STATUSES },
                _id: { $ne: 'appointment789' }
            });
        });
    });
});