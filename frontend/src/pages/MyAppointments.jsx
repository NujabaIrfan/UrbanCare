import React, { useState, useEffect } from 'react';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env

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
                `${REACT_APP_API_URL}/api/channel/my-appointments`,
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
                `${REACT_APP_API_URL}/api/channel/appointments/${appointmentId}`,
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
            `${REACT_APP_API_URL}/api/channel/appointments/${appointmentId}`, // Remove /cancel
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
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your appointments...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={fetchUserAppointments}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
                    <p className="text-gray-600">Manage your medical appointments</p>
                </div>

                {appointments.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="text-gray-400 text-6xl mb-4">📅</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No appointments yet</h3>
                        <p className="text-gray-600 mb-6">You haven't booked any appointments yet.</p>
                        <button 
                            onClick={() => window.location.href = '/doctors'}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Book Your First Appointment
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {appointments.map((appointment) => (
                            <div key={appointment._id} className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    Dr. {appointment.doctorId?.name}
                                                </h3>
                                                <p className="text-blue-600 font-medium">
                                                    {appointment.doctorId?.specialization}
                                                </p>
                                                <div className="text-gray-700 mt-1">
                                                    <span className="font-medium mr-2">Appointment No:</span>
                                                    {appointment.appointmentNumber}
                                                </div>
                                            </div>
                                            {getStatusBadge(appointment.status)}
                                        </div>

                                        {editingAppointment === appointment._id ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Appointment Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="appointmentDate"
                                                            value={editFormData.appointmentDate}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            min={new Date().toISOString().split('T')[0]}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Appointment Time
                                                        </label>
                                                        <select
                                                            name="appointmentTime"
                                                            value={editFormData.appointmentTime}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Symptoms
                                                    </label>
                                                    <textarea
                                                        name="symptoms"
                                                        value={editFormData.symptoms}
                                                        onChange={handleInputChange}
                                                        rows="3"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Describe your symptoms..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Additional Notes
                                                    </label>
                                                    <textarea
                                                        name="notes"
                                                        value={editFormData.notes}
                                                        onChange={handleInputChange}
                                                        rows="2"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Any additional information..."
                                                    />
                                                </div>
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => handleEditSubmit(appointment._id)}
                                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-center text-gray-700">
                                                        <span className="font-medium mr-2">Date:</span>
                                                        {formatDate(appointment.appointmentDate)}
                                                    </div>
                                                    <div className="flex items-center text-gray-700">
                                                        <span className="font-medium mr-2">Time:</span>
                                                        {appointment.appointmentTime}
                                                    </div>
                                                </div>
                                                <div className="text-gray-700">
                                                    <span className="font-medium mr-2">Symptoms:</span>
                                                    {appointment.symptoms}
                                                </div>
                                                {appointment.notes && (
                                                    <div className="text-gray-700">
                                                        <span className="font-medium mr-2">Notes:</span>
                                                        {appointment.notes}
                                                    </div>
                                                )}
                                                <div className="text-gray-700">
                                                    <span className="font-medium mr-2">Doctor:</span>
                                                    {appointment.doctorId?.qualification}
                                                </div>
                                                <div className="text-gray-700">
                                                    <span className="font-medium mr-2">Contact:</span>
                                                    {appointment.doctorId?.contactNumber}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {editingAppointment !== appointment._id && (
                                        <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-6">
                                            {!['completed', 'cancelled'].includes(appointment.status) && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditClick(appointment)}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelAppointment(appointment._id)}
                                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                                    >
                                                        Cancel
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
        </div>
    );
};

export default MyAppointments;