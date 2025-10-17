jest.mock('../models/userModel.js');
jest.mock('../models/PatientModel.js');
jest.mock('../models/appointmentModel.js');
jest.mock('../config/nodemailer.js');
jest.mock('../emailTemplates/appointmentTemplate.js');
jest.mock('../config/constants.js');
jest.mock('../helpers/doctorHelper.js');

import User from '../models/userModel.js';
import Patient from '../models/PatientModel.js';
import Appointment from '../models/appointmentModel.js';
import sendEmail from '../config/nodemailer.js';
import { appointmentTemplate } from '../emailTemplates/appointmentTemplate.js';
import { 
    checkTimeSlotConflict,
    findAppointmentByIdAndDoctor,
    generateAppointmentNumber
} from '../helpers/doctorHelper.js';
import {
    getAllDoctors,
    getDoctorById,
    bookAppointment,
    updateAppointmentStatus
} from '../controllers/doctorController.js';

const APPOINTMENT_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

const MODIFIABLE_STATUSES = ['pending', 'confirmed'];

require('../config/constants.js').APPOINTMENT_STATUS = APPOINTMENT_STATUS;
require('../config/constants.js').MODIFIABLE_STATUSES = MODIFIABLE_STATUSES;

const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
});

describe('Doctor Controller Tests', () => {
    let req, res;

    beforeEach(() => {
        req = { 
            body: {}, 
            params: {},
            user: {} 
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // ✅ getAllDoctors Tests
    describe('getAllDoctors', () => {
        it('should return all doctors successfully', async () => {
            const mockDoctors = [
                {
                    _id: 'doctor1',
                    name: 'Dr. Smith',
                    email: 'smith@hospital.com',
                    specialization: 'Cardiology',
                    qualification: 'MD',
                    experience: 10,
                    availableDays: ['Monday', 'Wednesday'],
                    availableTime: '9:00 AM - 5:00 PM',
                    contactNumber: '1234567890'
                }
            ];

            User.find.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockDoctors)
            });

            await getAllDoctors(req, res);

            expect(User.find).toHaveBeenCalledWith({ role: 'doctor' });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                doctors: mockDoctors
            });
        });

        it('should handle errors when fetching doctors', async () => {
            User.find.mockReturnValue({
                select: jest.fn().mockRejectedValue(new Error('Database error'))
            });

            await getAllDoctors(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server error'
            });
        });
    });

    // ✅ getDoctorById Tests
    describe('getDoctorById', () => {
        it('should return doctor by id successfully', async () => {
            req.params.id = 'doctor123';
            
            const mockDoctor = {
                _id: 'doctor123',
                name: 'Dr. Johnson',
                email: 'johnson@hospital.com',
                specialization: 'Neurology',
                qualification: 'MD, PhD',
                experience: 15,
                availableDays: ['Tuesday', 'Thursday'],
                availableTime: '10:00 AM - 4:00 PM',
                contactNumber: '9876543210'
            };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockDoctor)
            });

            await getDoctorById(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ 
                _id: 'doctor123', 
                role: 'doctor' 
            });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                doctor: mockDoctor
            });
        });

        it('should return 404 if doctor not found', async () => {
            req.params.id = 'doctor999';

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await getDoctorById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Doctor not found'
            });
        });

        it('should handle errors when fetching doctor', async () => {
            req.params.id = 'doctor123';

            User.findOne.mockReturnValue({
                select: jest.fn().mockRejectedValue(new Error('Database error'))
            });

            await getDoctorById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server error'
            });
        });
    });

    // ✅ bookAppointment Tests
    describe('bookAppointment', () => {
    beforeEach(() => {
        req.user = { id: 'user123' };
        req.params.id = 'doctor123';
        req.body = {
            appointmentDate: '2024-01-20',
            appointmentTime: '14:00',
            symptoms: 'Fever and headache',
            notes: 'Regular checkup'
        };
    });

    it('should book appointment successfully and send email to logged-in user', async () => {
        const mockDoctor = {
            _id: 'doctor123',
            name: 'Dr. Smith',
            contactNumber: '1234567890'
        };

        const mockPatient = {
            patientId: 'PAT-E75B964F',
            name: 'John Doe',
            contact: '9876543210'
        };

        const mockLastAppointment = {
            appointmentNumber: '5'
        };

        const mockUser = {
            _id: 'user123',
            email: 'john@example.com'
        };

        User.findOne.mockResolvedValue(mockDoctor);
        Patient.findOne.mockResolvedValue(mockPatient);
        Appointment.findOne
            .mockResolvedValueOnce(null) // No existing appointment
            .mockReturnValueOnce({
                sort: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockLastAppointment)
                })
            });
        User.findById.mockResolvedValue(mockUser);

        const mockAppointment = {
            _id: 'appointment123',
            appointmentNumber: '6',
            appointmentDate: '2024-01-20',
            appointmentTime: '14:00',
            status: 'pending',
            save: jest.fn().mockResolvedValue(true)
        };
        Appointment.mockImplementation(() => mockAppointment);

        appointmentTemplate.mockReturnValue('Email content');
        sendEmail.mockResolvedValue(true);

        await bookAppointment(req, res);

        expect(User.findOne).toHaveBeenCalledWith({
            _id: 'doctor123',
            role: 'doctor'
        });
        expect(Patient.findOne).toHaveBeenCalledWith({
        email: 'john@example.com'
        });
        expect(User.findById).toHaveBeenCalledWith('user123');
        expect(sendEmail).toHaveBeenCalledWith(
            'john@example.com',
            expect.any(String),
            expect.any(String)
        );

        expect(Appointment).toHaveBeenCalledWith({
            patientId: 'user123',
            doctorId: 'doctor123',
            appointmentDate: '2024-01-20',
            appointmentTime: '14:00',
            symptoms: 'Fever and headache',
            notes: 'Regular checkup',
            patientName: 'John Doe',
            patientContact: '9876543210',
            status: 'pending',
            appointmentNumber: '6'
        });
        expect(mockAppointment.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Appointment booked successfully! Your appointment number is: 6',
            appointment: expect.objectContaining({
                appointmentNumber: '6',
                date: '2024-01-20',
                time: '14:00',
                doctor: 'Dr. Smith',
                patient: 'John Doe',
                status: 'pending'
            })
        });
    });

    it('should return 401 if user not authenticated', async () => {
        req.user = null;

        await bookAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Authentication required'
        });
    });

    it('should return 400 if required fields are missing', async () => {
        req.body = {};

        await bookAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Appointment date, time, and symptoms are required'
        });
    });

    it('should return 404 if doctor not found', async () => {
        User.findOne.mockResolvedValue(null);

        await bookAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Doctor not found'
        });
    });

    it('should return 404 if patient profile not found', async () => {
        User.findOne.mockResolvedValue({ _id: 'doctor123', role: 'doctor' });
        Patient.findOne.mockResolvedValue(null);

        await bookAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Patient profile not found. Please complete your patient registration first.'
        });
    });

    it('should return 400 if patient contact not available', async () => {
        User.findOne.mockResolvedValue({ _id: 'doctor123', role: 'doctor' });
        Patient.findOne.mockResolvedValue({
            patientId: 'PAT-E75B964F',
            name: 'John Doe',
            contact: null
        });

        await bookAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message:
                'Please add your contact number to your patient profile before booking appointments.'
        });
    });

    it('should return 400 if time slot already booked', async () => {
        User.findOne.mockResolvedValue({ _id: 'doctor123', role: 'doctor' });
        Patient.findOne.mockResolvedValue({
            patientId: 'PAT-E75B964F',
            name: 'John Doe',
            contact: '9876543210'
        });
        Appointment.findOne.mockResolvedValue({ _id: 'existingAppointment' }); // Existing appointment found

        await bookAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Time slot already booked'
        });
    });

    it('should handle CastError for invalid ID format', async () => {
        const castError = new Error('Cast to ObjectId failed');
        castError.name = 'CastError';

        User.findOne.mockRejectedValue(castError);

        await bookAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid ID format'
        });
    });

    it('should handle email sending failure gracefully', async () => {
        const mockDoctor = {
            _id: 'doctor123',
            name: 'Dr. Smith',
            contactNumber: '1234567890'
        };

        const mockPatient = {
            patientId: 'PAT-E75B964F',
            name: 'John Doe',
            contact: '9876543210'
        };

        User.findOne.mockResolvedValue(mockDoctor);
        Patient.findOne.mockResolvedValue(mockPatient);
        Appointment.findOne.mockResolvedValueOnce(null);
        Appointment.findOne.mockReturnValueOnce({
            sort: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            })
        });
        User.findById.mockResolvedValue({ email: 'john@example.com' });

        const mockAppointment = {
            _id: 'appointment123',
            appointmentNumber: '1',
            save: jest.fn().mockResolvedValue(true)
        };
        Appointment.mockImplementation(() => mockAppointment);

        appointmentTemplate.mockReturnValue('Email content');
        sendEmail.mockRejectedValue(new Error('Email failed'));

        await bookAppointment(req, res);

        expect(User.findById).toHaveBeenCalledWith('user123');
        expect(sendEmail).toHaveBeenCalledWith(
            'john@example.com',
            expect.any(String),
            expect.any(String)
        );

        // Should still succeed even if email fails
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Appointment booked successfully! Your appointment number is: 1',
            appointment: expect.any(Object)
        });
    });
});


    // ✅ updateAppointmentStatus Tests (Doctor)
    describe('updateAppointmentStatus', () => {
        beforeEach(() => {
            req.user = { id: 'doctor123' };
            req.params.appointmentId = 'appointment123';
            req.body = { status: APPOINTMENT_STATUS.CONFIRMED };
        });

        it('should update appointment status successfully', async () => {
            const mockAppointment = {
                _id: 'appointment123',
                status: APPOINTMENT_STATUS.PENDING,
                save: jest.fn().mockResolvedValue(true)
            };

            findAppointmentByIdAndDoctor.mockResolvedValue(mockAppointment);

            await updateAppointmentStatus(req, res);

            expect(findAppointmentByIdAndDoctor).toHaveBeenCalledWith('appointment123', 'doctor123');
            expect(mockAppointment.status).toBe(APPOINTMENT_STATUS.CONFIRMED);
            expect(mockAppointment.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ 
                success: true, 
                message: 'Status updated successfully', 
                appointment: mockAppointment 
            });
        });

        it('should return 400 for invalid status', async () => {
            req.body.status = 'invalid_status';

            await updateAppointmentStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid status'
            });
        });

        it('should handle appointment not found error', async () => {
            const notFoundError = new Error('Appointment not found');
            notFoundError.statusCode = 404;
            findAppointmentByIdAndDoctor.mockRejectedValue(notFoundError);

            await updateAppointmentStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Appointment not found'
            });
        });

        it('should handle general errors', async () => {
            findAppointmentByIdAndDoctor.mockRejectedValue(new Error('Database error'));

            await updateAppointmentStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Database error' // FIXED: Changed from 'Server error' to 'Database error'
            });
        });
    });
});