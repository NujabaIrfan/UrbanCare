import React, { useState, useEffect } from 'react';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled

    // Fetch all appointments on component mount
    useEffect(() => {
        fetchAllAppointments();
    }, []);

    const fetchAllAppointments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${REACT_APP_API_URL}/api/channel/admin/appointments`,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
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

    const deleteAppointment = async (appointmentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `${REACT_APP_API_URL}/api/channel/admin/appointments/${appointmentId}`,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete appointment');
        }
    };

    const updateAppointmentStatus = async (appointmentId, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${REACT_APP_API_URL}/api/channel/admin/appointments/${appointmentId}/status`,
                { status },
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDeleteAppointment = async (appointmentId) => {
        if (window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
            try {
                await deleteAppointment(appointmentId);
                alert('Appointment deleted successfully!');
                fetchAllAppointments(); // Refresh the list
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            await updateAppointmentStatus(appointmentId, newStatus);
            alert(`Appointment status updated to ${newStatus}`);
            fetchAllAppointments(); // Refresh the list
        } catch (error) {
            alert(error.message);
        }
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200'
        };
        
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Filter appointments based on selected filter
    const filteredAppointments = filter === 'all' 
        ? appointments 
        : appointments.filter(appt => appt.status === filter);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading appointments...</p>
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
                        onClick={fetchAllAppointments}
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
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin - Manage Appointments</h1>
                    <p className="text-gray-600">View and manage all appointments in the system</p>
                </div>

                {/* Filter Buttons */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filter === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)} 
                                {status !== 'all' && ` (${appointments.filter(a => a.status === status).length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredAppointments.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="text-gray-400 text-6xl mb-4">📅</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No appointments found</h3>
                        <p className="text-gray-600">
                            {filter === 'all' 
                                ? 'There are no appointments in the system yet.' 
                                : `No appointments with status "${filter}" found.`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredAppointments.map((appointment) => (
                            <div key={appointment._id} className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    Appointment #{appointment._id.toString().slice(-6)}
                                                </h3>
                                                <p className="text-gray-600 text-sm">
                                                    Created: {formatDate(appointment.createdAt)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {getStatusBadge(appointment.status)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-1">Patient</h4>
                                                <p className="text-gray-900">{appointment.patientId?.name}</p>
                                                <p className="text-sm text-gray-600">{appointment.patientId?.email}</p>
                                                <p className="text-sm text-gray-600">{appointment.patientContact}</p>
                                            </div>
                                            
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-1">Doctor</h4>
                                                <p className="text-gray-900">Dr. {appointment.doctorId?.name}</p>
                                                <p className="text-sm text-blue-600">{appointment.doctorId?.specialization}</p>
                                                <p className="text-sm text-gray-600">{appointment.doctorId?.qualification}</p>
                                            </div>
                                            
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-1">Appointment</h4>
                                                <p className="text-gray-900">{formatDate(appointment.appointmentDate)}</p>
                                                <p className="text-gray-900">{appointment.appointmentTime}</p>
                                                <p className="text-sm text-gray-600">Mode: {appointment.mode || 'physical'}</p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h4 className="font-semibold text-gray-700 mb-1">Symptoms</h4>
                                            <p className="text-gray-900">{appointment.symptoms}</p>
                                        </div>

                                        {appointment.notes && (
                                            <div className="mb-4">
                                                <h4 className="font-semibold text-gray-700 mb-1">Notes</h4>
                                                <p className="text-gray-900">{appointment.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-6">
                                        {/* Status Update Dropdown */}
                                        <div className="mb-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Update Status
                                            </label>
                                            <select
                                                value={appointment.status}
                                                onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDeleteAppointment(appointment._id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                        >
                                            Delete Appointment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary Stats */}
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
                            <div className="text-sm text-gray-600">Total</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-700">
                                {appointments.filter(a => a.status === 'pending').length}
                            </div>
                            <div className="text-sm text-yellow-600">Pending</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-700">
                                {appointments.filter(a => a.status === 'confirmed').length}
                            </div>
                            <div className="text-sm text-blue-600">Confirmed</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-700">
                                {appointments.filter(a => a.status === 'completed').length}
                            </div>
                            <div className="text-sm text-green-600">Completed</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-700">
                                {appointments.filter(a => a.status === 'cancelled').length}
                            </div>
                            <div className="text-sm text-red-600">Cancelled</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAppointments;