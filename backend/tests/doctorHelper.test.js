jest.mock('../models/appointmentModel.js');
jest.mock('../config/constants.js');

import Appointment from '../models/appointmentModel.js';
import {
    checkTimeSlotConflict,
    findAppointmentByIdAndDoctor,
    generateAppointmentNumber
} from '../helpers/doctorHelper.js';

import {
    findAppointmentByIdAndOwner,
    checkAppointmentModifiable
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

describe('Appointment Helper Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ✅ findAppointmentByIdAndOwner Tests
    describe('findAppointmentByIdAndOwner', () => {
        it('should return appointment when found for the owner', async () => {
            const mockAppointment = {
                _id: 'appointment123',
                patientId: 'user123',
                status: APPOINTMENT_STATUS.PENDING
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
        });

        it('should throw 404 error when appointment belongs to different user', async () => {
            Appointment.findOne.mockResolvedValue(null);

            await expect(findAppointmentByIdAndOwner('appointment123', 'differentUser'))
                .rejects
                .toMatchObject({
                    message: 'Appointment not found',
                    statusCode: 404
                });
        });
    });

    // ✅ findAppointmentByIdAndDoctor Tests
    describe('findAppointmentByIdAndDoctor', () => {
        it('should return appointment when found for the doctor', async () => {
            const mockAppointment = {
                _id: 'appointment123',
                doctorId: 'doctor123',
                status: APPOINTMENT_STATUS.PENDING
            };

            Appointment.findById.mockResolvedValue(mockAppointment);

            const result = await findAppointmentByIdAndDoctor('appointment123', 'doctor123');

            expect(Appointment.findById).toHaveBeenCalledWith('appointment123');
            expect(result).toEqual(mockAppointment);
        });

        it('should throw 404 error when appointment not found', async () => {
            Appointment.findById.mockResolvedValue(null);

            await expect(findAppointmentByIdAndDoctor('appointment999', 'doctor123'))
                .rejects
                .toMatchObject({
                    message: 'Appointment not found',
                    statusCode: 404
                });
        });

        it('should throw 403 error when appointment belongs to different doctor', async () => {
            const mockAppointment = {
                _id: 'appointment123',
                doctorId: 'differentDoctor',
                status: APPOINTMENT_STATUS.PENDING
            };

            Appointment.findById.mockResolvedValue(mockAppointment);

            await expect(findAppointmentByIdAndDoctor('appointment123', 'doctor123'))
                .rejects
                .toMatchObject({
                    message: 'Not authorized to update this appointment',
                    statusCode: 403
                });
        });

        it('should handle ObjectId comparison correctly', async () => {
            const mockAppointment = {
                _id: 'appointment123',
                doctorId: { toString: () => 'doctor123' },
                status: APPOINTMENT_STATUS.PENDING
            };

            Appointment.findById.mockResolvedValue(mockAppointment);

            const result = await findAppointmentByIdAndDoctor('appointment123', 'doctor123');

            expect(result).toEqual(mockAppointment);
        });
    });

    // ✅ checkAppointmentModifiable Tests
    describe('checkAppointmentModifiable', () => {
        it('should allow modification for pending appointment', () => {
            const appointment = { status: APPOINTMENT_STATUS.PENDING };

            expect(() => checkAppointmentModifiable(appointment)).not.toThrow();
        });

        it('should allow modification for confirmed appointment', () => {
            const appointment = { status: APPOINTMENT_STATUS.CONFIRMED };

            expect(() => checkAppointmentModifiable(appointment)).not.toThrow();
        });

        it('should throw error for completed appointment', () => {
            const appointment = { status: APPOINTMENT_STATUS.COMPLETED };

            expect(() => checkAppointmentModifiable(appointment))
                .toThrow('Cannot modify completed or cancelled appointments');
        });

        it('should throw error for cancelled appointment', () => {
            const appointment = { status: APPOINTMENT_STATUS.CANCELLED };

            expect(() => checkAppointmentModifiable(appointment))
                .toThrow('Cannot modify completed or cancelled appointments');
        });

        it('should include statusCode 400 in thrown error', () => {
            const appointment = { status: APPOINTMENT_STATUS.COMPLETED };

            try {
                checkAppointmentModifiable(appointment);
            } catch (error) {
                expect(error.statusCode).toBe(400);
            }
        });
    });

    // ✅ checkTimeSlotConflict Tests
    describe('checkTimeSlotConflict', () => {
        it('should not throw error when no conflict exists', async () => {
            Appointment.findOne.mockResolvedValue(null);

            await expect(checkTimeSlotConflict('doctor123', '2024-01-20', '14:00'))
                .resolves
                .toBeUndefined();

            expect(Appointment.findOne).toHaveBeenCalledWith({
                doctorId: 'doctor123',
                appointmentDate: '2024-01-20',
                appointmentTime: '14:00',
                status: { $in: MODIFIABLE_STATUSES },
                _id: { $ne: null } // FIXED: Changed from undefined to null
            });
        });

        it('should not throw error when excluding current appointment', async () => {
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

        it('should throw error when time slot conflict exists', async () => {
            const existingAppointment = {
                _id: 'existingAppointment',
                doctorId: 'doctor123',
                appointmentDate: '2024-01-20',
                appointmentTime: '14:00'
            };

            Appointment.findOne.mockResolvedValue(existingAppointment);

            await expect(checkTimeSlotConflict('doctor123', '2024-01-20', '14:00'))
                .rejects
                .toMatchObject({
                    message: 'Time slot already booked. Please choose a different time.',
                    statusCode: 400
                });
        });

        it('should only check modifiable statuses for conflicts', async () => {
            Appointment.findOne.mockResolvedValue(null);

            await checkTimeSlotConflict('doctor123', '2024-01-20', '14:00');

            expect(Appointment.findOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: { $in: MODIFIABLE_STATUSES }
                })
            );
        });
    });

    // ✅ generateAppointmentNumber Tests
    describe('generateAppointmentNumber', () => {
        it('should return "1" when no appointments exist', async () => {
            Appointment.findOne.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(null)
                })
            });

            const result = await generateAppointmentNumber();

            expect(result).toBe('1');
            expect(Appointment.findOne).toHaveBeenCalled();
        });

        it('should return "1" when last appointment has no appointmentNumber', async () => {
            const lastAppointment = { _id: 'appointment123' }; // No appointmentNumber

            Appointment.findOne.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(lastAppointment)
                })
            });

            const result = await generateAppointmentNumber();

            expect(result).toBe('1');
        });

        it('should increment numeric appointment number', async () => {
            const lastAppointment = { appointmentNumber: '5' };

            Appointment.findOne.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(lastAppointment)
                })
            });

            const result = await generateAppointmentNumber();

            expect(result).toBe('6');
        });

        it('should handle non-numeric appointment numbers by returning "1"', async () => {
            const lastAppointment = { appointmentNumber: 'INVALID' };

            Appointment.findOne.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(lastAppointment)
                })
            });

            const result = await generateAppointmentNumber();

            expect(result).toBe('1');
        });

        it('should handle NaN by returning "1"', async () => {
            const lastAppointment = { appointmentNumber: 'ABC123' };

            Appointment.findOne.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(lastAppointment)
                })
            });

            const result = await generateAppointmentNumber();

            expect(result).toBe('1');
        });

        it('should handle complex query chain correctly', async () => {
            const lastAppointment = { appointmentNumber: '10' };

            const mockSort = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(lastAppointment)
            });

            Appointment.findOne.mockReturnValue({
                sort: mockSort
            });

            const result = await generateAppointmentNumber();

            expect(Appointment.findOne).toHaveBeenCalledWith();
            expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(result).toBe('11');
        });
    });
});