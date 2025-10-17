import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { REACT_APP_API_URL } = process.env

const DoctorsList = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

    const handleCardClick = (doctorId) => {
        navigate(`/doctor/${doctorId}`);
    };

    if (loading) return <div className="loading">Loading doctors...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="doctors-container">
            <h2>Our Doctors</h2>
            <div className="doctors-grid">
                {doctors.map(doctor => (
                    <div 
                        key={doctor._id} 
                        className="doctor-card"
                        onClick={() => handleCardClick(doctor._id)}
                    >
                        <div className="doctor-avatar">
                            {doctor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="doctor-info">
                            <h3>{doctor.name}</h3>
                            <p className="specialization">{doctor.specialization}</p>
                            <p className="experience">{doctor.experience} years experience</p>
                            <div className="availability">
                                <span>Available: {doctor.availableDays?.join(', ')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorsList;