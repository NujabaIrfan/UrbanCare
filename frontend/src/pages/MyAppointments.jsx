import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [editFormData, setEditFormData] = useState({
        appointmentDate: '',
        appointmentTime: '',
        symptoms: '',
        notes: ''
    });

    // Fetch user's appointments on component mount
    useEffect(() => {
        fetchUserAppointments();
    }, []);

    const fetchUserAppointments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:5000/api/channel/my-appointments',
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setAppointments(response.data.appointments);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
            setError('Failed to load appointments');
            setLoading(false);
        }
    };

    const updateAppointment = async (appointmentId, updateData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/channel/appointments/${appointmentId}`,
                updateData,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update appointment');
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `http://localhost:5000/api/channel/appointments/${appointmentId}`,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to cancel appointment');
        }
    };

    const handleEditClick = (appointment) => {
        setEditingAppointment(appointment._id);
        setEditFormData({
            appointmentDate: appointment.appointmentDate,
            appointmentTime: appointment.appointmentTime,
            symptoms: appointment.symptoms,
            notes: appointment.notes || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingAppointment(null);
        setEditFormData({
            appointmentDate: '',
            appointmentTime: '',
            symptoms: '',
            notes: ''
        });
    };

    const handleEditSubmit = async (appointmentId) => {
        try {
            await updateAppointment(appointmentId, editFormData);
            alert('Appointment updated successfully!');
            setEditingAppointment(null);
            fetchUserAppointments(); // Refresh the list
        } catch (error) {
            alert(error.message);
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await cancelAppointment(appointmentId);
                alert('Appointment cancelled successfully!');
                fetchUserAppointments(); // Refresh the list
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleInputChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: 'bg-amber-50 text-amber-700 border border-amber-200',
            confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            completed: 'bg-blue-50 text-blue-700 border border-blue-200',
            cancelled: 'bg-red-50 text-red-700 border border-red-200'
        };
        
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-50 text-gray-700'}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-6 text-gray-700 text-lg font-medium">Loading your appointments...</p>
                    <p className="text-gray-500 mt-2">Please wait while we fetch your medical records</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <p className="text-gray-800 text-xl mb-4 font-semibold">{error}</p>
                    <button 
                        onClick={fetchUserAppointments}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
            style={{
                background: "linear-gradient(135deg, #4c6da9ff 0%, #2a5298 100%)",
            }}>
            {/* Header Section */}
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-blue-50 p-4 rounded-2xl shadow-lg border border-blue-100"
                        style={{
                            background: "linear-gradient(135deg, #4c6da9ff 0%, #2a5298 100%)",
                        }}>
                            <span className="text-4xl text-blue-600">🏥</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">Your Appointments</h1>
                    <p className="text-white-600 text-lg max-w-2xl mx-auto">
                        Manage and track your healthcare appointments in one place
                    </p>
                </div>

                {/* Stats Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 shadow-lg border border-blue-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-800">{appointments.length}</div>
                            <div className="text-gray-600 text-sm font-medium">Total Appointments</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-emerald-600">
                                {appointments.filter(a => a.status === 'confirmed').length}
                            </div>
                            <div className="text-gray-600 text-sm font-medium">Confirmed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-amber-600">
                                {appointments.filter(a => a.status === 'pending').length}
                            </div>
                            <div className="text-gray-600 text-sm font-medium">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-600">
                                {appointments.filter(a => a.status === 'completed').length}
                            </div>
                            <div className="text-gray-600 text-sm font-medium">Completed</div>
                        </div>
                    </div>
                </div>

                {appointments.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-200">
                        <div className="text-gray-400 text-6xl mb-6">📅</div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Appointments Scheduled</h3>
                        <p className="text-gray-600 text-lg mb-8">
                            You haven't booked any medical appointments yet.
                        </p>
                        <button 
                            onClick={() => window.location.href = '/doctors'}
                            className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
                        >
                            Book Your First Appointment
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {appointments.map((appointment) => (
                            <div key={appointment._id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-start space-x-4">
                                                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                                    <span className="text-2xl text-blue-600">👨‍⚕️</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-800">
                                                        Dr. {appointment.doctorId?.name}
                                                    </h3>
                                                    <p className="text-blue-600 font-semibold text-lg mt-1">
                                                        {appointment.doctorId?.specialization}
                                                    </p>
                                                    <div className="text-gray-600 mt-2">
                                                        <span className="font-semibold">Appointment ID:</span>
                                                        <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                                                            #{appointment.appointmentNumber}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end space-y-2">
                                                {getStatusBadge(appointment.status)}
                                                <div className="text-gray-500 text-sm font-medium">
                                                    {formatDate(appointment.appointmentDate)}
                                                </div>
                                            </div>
                                        </div>

                                        {editingAppointment === appointment._id ? (
                                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                                <h4 className="text-gray-800 text-lg font-semibold mb-4">Edit Appointment Details</h4>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-gray-700 font-medium mb-2">
                                                                Appointment Date
                                                            </label>
                                                            <input
                                                                type="date"
                                                                name="appointmentDate"
                                                                value={editFormData.appointmentDate}
                                                                onChange={handleInputChange}
                                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                                                                min={new Date().toISOString().split('T')[0]}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 font-medium mb-2">
                                                                Appointment Time
                                                            </label>
                                                            <select
                                                                name="appointmentTime"
                                                                value={editFormData.appointmentTime}
                                                                onChange={handleInputChange}
                                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                                                            >
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
                                                    <div>
                                                        <label className="block text-gray-700 font-medium mb-2">
                                                            Symptoms
                                                        </label>
                                                        <textarea
                                                            name="symptoms"
                                                            value={editFormData.symptoms}
                                                            onChange={handleInputChange}
                                                            rows="3"
                                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-500"
                                                            placeholder="Describe your symptoms in detail..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-700 font-medium mb-2">
                                                            Additional Notes
                                                        </label>
                                                        <textarea
                                                            name="notes"
                                                            value={editFormData.notes}
                                                            onChange={handleInputChange}
                                                            rows="2"
                                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-500"
                                                            placeholder="Any additional information for the doctor..."
                                                        />
                                                    </div>
                                                    <div className="flex space-x-3 pt-2">
                                                        <button
                                                            onClick={() => handleEditSubmit(appointment._id)}
                                                            className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2"
                                                        >
                                                            <span>💾</span>
                                                            <span>Save Changes</span>
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold border border-gray-400"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center text-gray-700">
                                                        <span className="font-semibold text-blue-600 mr-3 w-8">🕒</span>
                                                        <span className="text-lg font-medium">{appointment.appointmentTime}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700">
                                                        <span className="font-semibold text-blue-600 mr-3 w-8">🎯</span>
                                                        <div>{getStatusBadge(appointment.status)}</div>
                                                    </div>
                                                    <div className="text-gray-700">
                                                        <span className="font-semibold text-blue-600 mr-3 w-8">📝</span>
                                                        <span>{appointment.symptoms}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    {appointment.notes && (
                                                        <div className="text-gray-700">
                                                            <span className="font-semibold text-blue-600 mr-3 w-8">📋</span>
                                                            <span>{appointment.notes}</span>
                                                        </div>
                                                    )}
                                                    <div className="text-gray-700">
                                                        <span className="font-semibold text-blue-600 mr-3 w-8">🎓</span>
                                                        <span>{appointment.doctorId?.qualification}</span>
                                                    </div>
                                                    <div className="text-gray-700">
                                                        <span className="font-semibold text-blue-600 mr-3 w-8">📞</span>
                                                        <span>{appointment.doctorId?.contactNumber}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {editingAppointment !== appointment._id && (
                                        <div className="flex flex-col space-y-3 mt-6 lg:mt-0 lg:ml-6">
                                            {!['completed', 'cancelled'].includes(appointment.status) && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditClick(appointment)}
                                                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                                                    >
                                                        <span>✏️</span>
                                                        <span>Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelAppointment(appointment._id)}
                                                        className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                                                    >
                                                        <span>❌</span>
                                                        <span>Cancel</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="max-w-6xl mx-auto mt-12 text-center border-t border-gray-200 pt-8">
                <p className="text-gray-600 text-sm">
                    Need help? Contact our support team at support@hospital.com or call (555) 123-HELP
                </p>
            </div>
        </div>
    );
};

export default MyAppointments;