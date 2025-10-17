import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DoctorDetails = () => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showBooking, setShowBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [lastAppointment, setLastAppointment] = useState(null);
    const [bookingData, setBookingData] = useState({
        appointmentDate: '',
        appointmentTime: '',
        symptoms: '',
        notes: ''
    });

    // Fetch all doctors on component mount
    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/doctors');
            setDoctors(response.data.doctors);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch doctors');
            setLoading(false);
        }
    };

    const fetchDoctorDetails = async (doctorId) => {
        setDetailsLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/doctors/${doctorId}`);
            setSelectedDoctor(response.data.doctor);
            setDetailsLoading(false);
        } catch (error) {
            console.error('Error fetching doctor details:', error);
            setDetailsLoading(false);
        }
    };

    const handleCardClick = (doctorId) => {
        fetchDoctorDetails(doctorId);
    };

    const handleBackToList = () => {
        setSelectedDoctor(null);
        setShowBooking(false);
        setBookingSuccess(false);
        setLastAppointment(null);
        setBookingData({
            appointmentDate: '',
            appointmentTime: '',
            symptoms: '',
            notes: ''
        });
    };

    const handleBookAppointment = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to book an appointment');
            return;
        }
        setShowBooking(true);
        setBookingSuccess(false);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Booking...';
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:5000/api/doctors/${selectedDoctor._id}/appointments`,
                {
                    appointmentDate: bookingData.appointmentDate,
                    appointmentTime: bookingData.appointmentTime,
                    symptoms: bookingData.symptoms,
                    notes: bookingData.notes
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );

            // Store the last appointment details
            setLastAppointment(response.data.appointment);

            // Show success toasts
            toast.success(`Appointment booked! Your number: ${response.data.appointment.appointmentNumber}`);
            toast.info('A confirmation email has been sent to your email.');

            // Show booking success view instead of closing
            setBookingSuccess(true);
            setShowBooking(false);

            // Reset form data
            setBookingData({
                appointmentDate: '',
                appointmentTime: '',
                symptoms: '',
                notes: ''
            });

        } catch (error) {
            console.error('Booking error details:', error);

            // Handle backend responses specifically
            const message = error.response?.data?.message || error.message;

            if (message.includes('Patient profile not found')) {
                toast.error('You must complete your patient registration before booking.');
            } else if (error.response) {
                toast.error(message);
            } else if (error.request) {
                toast.error('No response from server. Check if backend is running.');
            } else {
                toast.error('Failed to book appointment: ' + message);
            }
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Confirm Booking';
            }
        }
    };

    const handleBookAnother = () => {
        setBookingSuccess(false);
        setShowBooking(false);
        // Stay on the same doctor's page to book another appointment
    };

    const handleBookAnotherDoctor = () => {
        setBookingSuccess(false);
        setShowBooking(false);
        setSelectedDoctor(null); // Go back to doctors list
    };

    const handleInputChange = (e) => {
        setBookingData({
            ...bookingData,
            [e.target.name]: e.target.value
        });
    };

    // Loading state
    if (loading) return (
        <div 
            className="min-h-screen flex justify-center items-center text-white"
            style={{
                background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
            }}
        >
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xl">Loading doctors...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div 
            className="min-h-screen flex justify-center items-center text-white"
            style={{
                background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
            }}
        >
            <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <p className="text-xl text-red-300">{error}</p>
            </div>
        </div>
    );

    // If doctor is selected, show details view
    if (selectedDoctor) {
        return (
            <div 
                className="min-h-screen text-white p-6"
                style={{
                    background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                }}
            >
                <ToastContainer 
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                
                <div className="max-w-6xl mx-auto">
                    <button 
                        className="mb-6 flex items-center text-teal-300 hover:text-teal-100 transition-colors bg-teal-800 bg-opacity-50 px-4 py-2 rounded-lg hover:bg-opacity-70"
                        onClick={handleBackToList}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Doctors List
                    </button>

                    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-teal-200">
                        {detailsLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading doctor details...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Doctor Header */}
                                <div className="flex items-start space-x-6 mb-8">
                                    <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                        {selectedDoctor.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dr. {selectedDoctor.name}</h1>
                                        <p className="text-lg text-teal-600 font-semibold mb-1">{selectedDoctor.specialization}</p>
                                        <p className="text-gray-600">{selectedDoctor.qualification}</p>
                                    </div>
                                </div>

                                {/* Booking Success View */}
                                {bookingSuccess && lastAppointment ? (
                                    <div className="text-center py-8">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment Booked Successfully!</h2>
                                        
                                        <div className="bg-white border border-green-300 rounded-xl p-6 mb-6 max-w-md mx-auto shadow-md">
                                            <div className="space-y-3 text-left">
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                    <span className="text-gray-700"><strong className="text-gray-900">Appointment Number:</strong> {lastAppointment.appointmentNumber}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span className="text-gray-700"><strong className="text-gray-900">Doctor:</strong> Dr. {lastAppointment.doctor}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-gray-700"><strong className="text-gray-900">Date:</strong> {lastAppointment.date}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-gray-700"><strong className="text-gray-900">Time:</strong> {lastAppointment.time}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                        {lastAppointment.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4 max-w-md mx-auto">
                                            <p className="text-gray-600 mb-4">What would you like to do next?</p>
                                            
                                            <button 
                                                onClick={handleBookAnother}
                                                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                            >
                                                Book Another Appointment with Dr. {selectedDoctor.name}
                                            </button>
                                            
                                            <button 
                                                onClick={handleBookAnotherDoctor}
                                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                            >
                                                Book with Another Doctor
                                            </button>
                                            
                                            <button 
                                                onClick={handleBackToList}
                                                className="w-full bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
                                            >
                                                Back to Doctors List
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Stats Section */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                            <div className="bg-teal-50 rounded-xl p-4 text-center border border-teal-100">
                                                <div className="text-2xl font-bold text-teal-700">{selectedDoctor.experience}+</div>
                                                <div className="text-sm text-gray-600">Years Experience</div>
                                            </div>
                                            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                                                <div className="text-2xl font-bold text-blue-700">98%</div>
                                                <div className="text-sm text-gray-600">Success Rate</div>
                                            </div>
                                            <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                                                <div className="text-2xl font-bold text-purple-700">500+</div>
                                                <div className="text-sm text-gray-600">Patients Treated</div>
                                            </div>
                                            <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
                                                <div className="text-2xl font-bold text-orange-700">4.9/5</div>
                                                <div className="text-sm text-gray-600">Rating</div>
                                            </div>
                                        </div>

                                        {/* Doctor Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Experience
                                                </h3>
                                                <p className="text-gray-700">{selectedDoctor.experience} years of professional experience</p>
                                            </div>
                                            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    Contact
                                                </h3>
                                                <p className="text-gray-700">{selectedDoctor.contactNumber}</p>
                                                <p className="text-gray-700">{selectedDoctor.email}</p>
                                            </div>
                                            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Availability
                                                </h3>
                                                <p className="text-gray-700"><strong>Days:</strong> {selectedDoctor.availableDays?.join(', ')}</p>
                                                <p className="text-gray-700"><strong>Time:</strong> {selectedDoctor.availableTime}</p>
                                            </div>
                                            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    </svg>
                                                    Address
                                                </h3>
                                                <p className="text-gray-700">{selectedDoctor.address}</p>
                                            </div>
                                        </div>

                                        {/* Booking Form or Book Button */}
                                        {!showBooking ? (
                                            <button 
                                                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                                onClick={handleBookAppointment}
                                            >
                                                Book Appointment with Dr. {selectedDoctor.name}
                                            </button>
                                        ) : (
                                            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-6 border border-teal-100">
                                                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Book Appointment with Dr. {selectedDoctor.name}
                                                </h3>
                                                
                                                <form onSubmit={handleBookingSubmit}>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                        <div className="relative">
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date:</label>
                                                            <input
                                                                type="date"
                                                                name="appointmentDate"
                                                                value={bookingData.appointmentDate}
                                                                onChange={handleInputChange}
                                                                required
                                                                min={new Date().toISOString().split('T')[0]}
                                                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 text-gray-900" // Added text-gray-900
                                                            />
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>

                                                        <div className="relative">
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Time:</label>
                                                            <select
                                                                name="appointmentTime"
                                                                value={bookingData.appointmentTime}
                                                                onChange={handleInputChange}
                                                                required
                                                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 text-gray-900" // Added text-gray-900
                                                            >
                                                                <option value="">Select Time</option>
                                                                <option value="09:00 AM">09:00 AM</option>
                                                                <option value="10:00 AM">10:00 AM</option>
                                                                <option value="11:00 AM">11:00 AM</option>
                                                                <option value="12:00 PM">12:00 PM</option>
                                                                <option value="02:00 PM">02:00 PM</option>
                                                                <option value="03:00 PM">03:00 PM</option>
                                                                <option value="04:00 PM">04:00 PM</option>
                                                            </select>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    <div className="mb-6">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms:</label>
                                                        <textarea
                                                            name="symptoms"
                                                            value={bookingData.symptoms}
                                                            onChange={handleInputChange}
                                                            required
                                                            placeholder="Describe your symptoms..."
                                                            rows="3"
                                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 text-gray-900" // Added text-gray-900
                                                        />
                                                    </div>

                                                    <div className="mb-6">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional):</label>
                                                        <textarea
                                                            name="notes"
                                                            value={bookingData.notes}
                                                            onChange={handleInputChange}
                                                            placeholder="Any additional information..."
                                                            rows="2"
                                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 text-gray-900" // Added text-gray-900
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex space-x-4">
                                                        <button 
                                                            type="button" 
                                                            className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
                                                            onClick={() => setShowBooking(false)}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button 
                                                            type="submit" 
                                                            className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                                                        >
                                                            Confirm Booking
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Default view - doctors list
    return (
        <div 
            className="min-h-screen text-white p-6"
            style={{
                background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
            }}
        >
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400 mb-4">
                        Our Medical Specialists
                    </h2>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                        Meet our team of experienced healthcare professionals dedicated to providing you with the best medical care
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {doctors.map(doctor => (
                        <div 
                            key={doctor._id} 
                            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-teal-200"
                            onClick={() => handleCardClick(doctor._id)}
                        >
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                    {doctor.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800">Dr. {doctor.name}</h3>
                                    <p className="text-teal-600 font-semibold">{doctor.specialization}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-gray-600 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {doctor.experience} years experience
                                </p>
                                <div className="flex items-center text-sm text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Available: {doctor.availableDays?.join(', ')}
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                    <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-medium">
                                        Available for Consultation
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DoctorDetails;