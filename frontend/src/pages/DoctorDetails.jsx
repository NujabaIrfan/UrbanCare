import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { REACT_APP_API_URL } = process.env

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
            const response = await axios.get(`${REACT_APP_API_URL}/api/doctors`);
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
            const response = await axios.get(`${REACT_APP_API_URL}/api/doctors/${doctorId}`);
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
            `${REACT_APP_API_URL}/api/doctors/${selectedDoctor._id}/appointments`,
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
    if (loading) return <div className="flex justify-center items-center h-64 text-gray-600">Loading doctors...</div>;
    if (error) return <div className="flex justify-center items-center h-64 text-red-500">{error}</div>;

    // If doctor is selected, show details view
    if (selectedDoctor) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
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
                <button 
                    className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={handleBackToList}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Doctors List
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
                    {detailsLoading ? (
                        <div className="flex justify-center items-center h-64 text-gray-600">Loading doctor details...</div>
                    ) : (
                        <>
                            {/* Doctor Header */}
                            <div className="flex items-start space-x-6 mb-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {selectedDoctor.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedDoctor.name}</h1>
                                    <p className="text-lg text-blue-600 font-semibold mb-1">{selectedDoctor.specialization}</p>
                                    <p className="text-gray-600">{selectedDoctor.qualification}</p>
                                </div>
                            </div>

                            {/* Booking Success View */}
                            {bookingSuccess && lastAppointment ? (
                                <div className="text-center py-8">
                                    <div className="text-green-500 text-6xl mb-4">✅</div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment Booked Successfully!</h2>
                                    
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 max-w-md mx-auto">
                                        <div className="space-y-2 text-left">
                                            <p><strong>Appointment Number:</strong> {lastAppointment.appointmentNumber}</p>
                                            <p><strong>Doctor:</strong> Dr. {lastAppointment.doctor}</p>
                                            <p><strong>Date:</strong> {lastAppointment.date}</p>
                                            <p><strong>Time:</strong> {lastAppointment.time}</p>
                                            <p><strong>Status:</strong> <span className="text-green-600 font-medium">{lastAppointment.status}</span></p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 max-w-md mx-auto">
                                        <p className="text-gray-600 mb-4">What would you like to do next?</p>
                                        
                                        <button 
                                            onClick={handleBookAnother}
                                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                                        >
                                            Book Another Appointment with Dr. {selectedDoctor.name}
                                        </button>
                                        
                                        <button 
                                            onClick={handleBookAnotherDoctor}
                                            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg"
                                        >
                                            Book with Another Doctor
                                        </button>
                                        
                                        <button 
                                            onClick={handleBackToList}
                                            className="w-full bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                                        >
                                            Back to Doctors List
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Stats Section */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-blue-700">350+</div>
                                            <div className="text-sm text-gray-600">points</div>
                                        </div>
                                        <div className="bg-green-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-green-700">15+</div>
                                            <div className="text-sm text-gray-600">figures</div>
                                        </div>
                                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-purple-700">255+</div>
                                            <div className="text-sm text-gray-600">points</div>
                                        </div>
                                        <div className="bg-orange-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-orange-700">8.7/10</div>
                                            <div className="text-sm text-gray-600">hours</div>
                                        </div>
                                    </div>

                                    {/* Doctor Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Experience</h3>
                                            <p className="text-gray-700">{selectedDoctor.experience} years</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact</h3>
                                            <p className="text-gray-700">{selectedDoctor.contactNumber}</p>
                                            <p className="text-gray-700">{selectedDoctor.email}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Availability</h3>
                                            <p className="text-gray-700"><strong>Days:</strong> {selectedDoctor.availableDays?.join(', ')}</p>
                                            <p className="text-gray-700"><strong>Time:</strong> {selectedDoctor.availableTime}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Address</h3>
                                            <p className="text-gray-700">{selectedDoctor.address}</p>
                                        </div>
                                    </div>

                                    {/* Booking Form or Book Button */}
                                    {!showBooking ? (
                                        <button 
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                                            onClick={handleBookAppointment}
                                        >
                                            Book Appointment
                                        </button>
                                    ) : (
                                        <form className="bg-gray-50 rounded-2xl p-6" onSubmit={handleBookingSubmit}>
                                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Book Appointment with Dr. {selectedDoctor.name}</h3>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div className="form-group">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date:</label>
                                                    <input
                                                        type="date"
                                                        name="appointmentDate"
                                                        value={bookingData.appointmentDate}
                                                        onChange={handleInputChange}
                                                        required
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Time:</label>
                                                    <select
                                                        name="appointmentTime"
                                                        value={bookingData.appointmentTime}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>

                                            <div className="flex space-x-4">
                                                <button 
                                                    type="button" 
                                                    className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                                                    onClick={() => setShowBooking(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                                                    Confirm Booking
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Default view - doctors list
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Our Doctors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(doctor => (
                    <div 
                        key={doctor._id} 
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                        onClick={() => handleCardClick(doctor._id)}
                    >
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                                {doctor.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                                <p className="text-blue-600 font-semibold">{doctor.specialization}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-600">{doctor.experience} years experience</p>
                            <div className="flex items-center text-sm text-gray-500">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Available: {doctor.availableDays?.join(', ')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorDetails;