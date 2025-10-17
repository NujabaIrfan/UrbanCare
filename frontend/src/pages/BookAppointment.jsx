import React, { useState, useEffect } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const { REACT_APP_API_URL } = process.env

const BookAppointment = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState("In-Person");
  const [message, setMessage] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Mock data for doctors (replace with actual API call)
  useEffect(() => {
    // This would typically be an API call to fetch doctors
    const mockDoctors = [
      {
        id: 1,
        name: "Dr. Smith",
        specialization: "Cardiologist Specialist",
        experience: "2024-present",
        patients: "15+ patients",
        rating: "8.7/10",
        description: "Dr. Smith is a highly skilled cardiologist specialising in heart and blood vessel care. He provides expert treatment for heart disease, high blood pressure, and related conditions. Initially a patient maintains a healthy heart and breast quality of life.",
        schedule: {
          morning: "9:00 AM - 10:00 AM",
          afternoon: "4:00 PM - 5:00 PM",
          evening: "8:00 PM - 9:00 PM"
        }
      },
      {
        id: 2,
        name: "Dr. Kelly",
        specialization: "Dermatologist Specialist",
        experience: "2022-present",
        patients: "20+ patients",
        rating: "9.1/10"
      },
      {
        id: 3,
        name: "Dr. Rodger",
        specialization: "Neurologist Specialist",
        experience: "2020-present",
        patients: "30+ patients",
        rating: "8.9/10"
      },
      {
        id: 4,
        name: "Dr. Michael",
        specialization: "Orthopedic Surgeon",
        experience: "2018-present",
        patients: "25+ patients",
        rating: "9.2/10"
      },
      {
        id: 5,
        name: "Dr. Sophia",
        specialization: "Pediatrician Specialist",
        experience: "2021-present",
        patients: "18+ patients",
        rating: "9.0/10"
      }
    ];
    
    setDoctors(mockDoctors);
  }, []);

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingForm(false);
  };

  const handleBookAppointment = () => {
    if (!selectedDoctor) {
      toast.error("Please select a doctor first", { position: "top-right" });
      return;
    }
    setShowBookingForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoctor || !date || !time || !mode) {
      toast.error("Please fill in all required fields", { position: "top-right" });
      return;
    }

    try {
      console.log("Sending:", { doctorId: selectedDoctor.id, date, time, mode });

      const response = await axios.post(`${REACT_APP_API_URL}/api/appointment/book`, {
        doctorId: selectedDoctor.id,
        date,
        time,
        mode
      });

      localStorage.setItem('appointmentId', response.data.appointmentNumber);

      toast.success(`Appointment Confirmed! ID: ${response.data.appointmentNumber}`, { position: "top-right" });
      setMessage(`Appointment Confirmed! ID: ${response.data.appointmentNumber}`);
      
      // Reset form
      setDate("");
      setTime("");
      setMode("In-Person");
      setShowBookingForm(false);
    } catch (error) {
      console.error('Booking failed:', error);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(`${err.field}: ${err.message}`, { position: "top-right" });
        });
      } else {
        toast.error(error.response?.data?.message || "Booking failed. Please try again.", { position: "top-right" });
      }
    }
  };

  return (
    <div className="container mx-auto p-5">
      <h2 className="text-2xl font-bold mb-6">Appointment Booking</h2>
      
      {/* Doctors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {doctors.map(doctor => (
          <div 
            key={doctor.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedDoctor?.id === doctor.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => handleDoctorSelect(doctor)}
          >
            <h3 className="font-bold text-lg">{doctor.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{doctor.specialization}</p>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{doctor.experience}</span>
              <span>{doctor.patients}</span>
              <span>{doctor.rating}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor Details or Booking Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {selectedDoctor && !showBookingForm ? (
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{selectedDoctor.name}</h3>
                <p className="text-gray-600">{selectedDoctor.specialization}</p>
              </div>
              <div className="text-right text-sm">
                <div className="flex space-x-4">
                  <span>{selectedDoctor.experience}</span>
                  <span>{selectedDoctor.patients}</span>
                  <span>{selectedDoctor.rating}</span>
                </div>
              </div>
            </div>
            
            <p className="mb-6 text-gray-700">{selectedDoctor.description}</p>
            
            <div className="mb-6">
              <h4 className="font-bold mb-2">Schedules</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div className="bg-gray-100 p-2 rounded">AM</div>
                <div className="bg-gray-100 p-2 rounded">9:00</div>
                <div className="bg-gray-100 p-2 rounded">PM</div>
                <div className="bg-gray-100 p-2 rounded">4:00</div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold mb-2">Time Sheet</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>9:00 AM</span>
                  <span>10:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span>4:00 PM</span>
                  <span>5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>8:00 PM</span>
                  <span>9:00 PM</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleBookAppointment}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Book Here
            </button>
          </div>
        ) : selectedDoctor && showBookingForm ? (
          <div>
            <h3 className="text-xl font-bold mb-4">Book Appointment with {selectedDoctor.name}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border p-2 w-full rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="border p-2 w-full rounded"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="border p-2 w-full rounded"
                >
                  <option>In-Person</option>
                  <option>Teleconsultation</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded font-medium hover:bg-blue-600 transition-colors">
                  Confirm Booking
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowBookingForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded font-medium hover:bg-gray-400 transition-colors"
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Please select a doctor to view details and book an appointment
          </div>
        )}
      </div>
      
      {message && <p className="mt-4 p-3 bg-green-100 text-green-700 rounded">{message}</p>}
    </div>
  );
};

export default BookAppointment;