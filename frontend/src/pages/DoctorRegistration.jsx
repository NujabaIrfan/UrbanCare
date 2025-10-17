import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { REACT_APP_API_URL } = process.env

const DoctorRegistration = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const availableDaysOptions = [
    'Monday',
    'Tuesday', 
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const timeSlots = [
    '9:00 AM - 12:00 PM',
    '12:00 PM - 3:00 PM', 
    '3:00 PM - 6:00 PM',
    '9:00 AM - 3:00 PM',
    '9:00 AM - 5:00 PM',
    'Custom'
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    setSuccessMessage('');

    try {
      // Prepare data for backend
      const formData = {
        ...data,
        role: 'doctor',
        availableDays: data.availableDays || [],
        // If custom time is selected, use customTime, otherwise use availableTime
        availableTime: data.availableTime === 'Custom' ? data.customTime : data.availableTime
      };

      // Remove customTime if not needed
      if (data.availableTime !== 'Custom') {
        delete formData.customTime;
      }

      const response = await axios.post(`${REACT_APP_API_URL}/api/auth/register`, formData);

      if (response.data.success) {
        setSuccessMessage('Registration successful!');
        toast.success('Registration successful! OTP sent to your email.');
        // Redirect to OTP verification page or login
        setTimeout(() => {
          navigate('/doctorRegister');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.data?.errors) {
        const fieldErrors = error.response.data.errors;
        const firstError = fieldErrors[0];
        setServerError(`${firstError.field}: ${firstError.message}`);
        toast.error(`${firstError.field}: ${firstError.message}`);
      } else {
        setServerError(error.response?.data?.message || 'Registration failed. Please try again.');
        toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const watchAvailableTime = watch('availableTime');
  const watchPassword = watch('password');

  return (
    <div 
      className="min-h-screen text-white relative flex items-center justify-center p-6"
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
      
      {/* Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 bg-teal-600 p-3 rounded-lg shadow-lg hover:bg-teal-700 transition-all duration-300 hover:scale-110 flex items-center justify-center group z-10"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-white" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10M12 4.5v4" 
          />
        </svg>
        <span className="absolute opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs px-2 py-1 rounded-md -bottom-8 transform transition-all duration-300">Home</span>
      </Link>

      <div className="flex bg-white shadow-2xl rounded-2xl w-full max-w-6xl overflow-hidden border border-teal-200">
        {/* Left Side - Form */}
        <div 
          className="w-full p-8 relative flex flex-col"
          style={{
            background: "linear-gradient(135deg, #f0f9ff 0%, #e6f3ff 50%, #f0f9ff 100%)"
          }}
        >
          {/* Medical themed top border */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-blue-400 to-teal-600"></div>
          
          {/* Medical corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-teal-500"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-teal-500"></div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                URBAN CARE
              </span>
              <span className="text-gray-700 ml-2">DOCTOR REGISTRATION</span>
            </h2>
            <p className="text-gray-600 mt-2">Join our healthcare team and make a difference</p>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-red-600 font-medium">{serverError}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-green-600 font-medium">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-teal-100">
              <h3 className="text-xl font-bold text-teal-600 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    {...register('name', {
                      required: 'Name is required',
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: 'Name can only contain letters'
                      }
                    })}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 shadow-sm text-gray-800 bg-white ${
                      errors.name ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                    }`}
                    placeholder="Enter your full name"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div className="relative">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: 'Invalid email format'
                      }
                    })}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 shadow-sm text-gray-800 bg-white ${
                      errors.email ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                    }`}
                    placeholder="Enter your email"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div className="relative">
                  <label htmlFor="contactNumber" className="block text-gray-700 text-sm font-bold mb-2">Contact Number *</label>
                  <input
                    type="tel"
                    id="contactNumber"
                    {...register('contactNumber', {
                      required: 'Contact number is required',
                      pattern: {
                        value: /^\d{10}$/,
                        message: 'Contact number must be 10 digits'
                      }
                    })}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 shadow-sm text-gray-800 bg-white ${
                      errors.contactNumber ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                    }`}
                    placeholder="Enter contact number"
                    maxLength={10}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber.message}</p>}
                </div>

                <div className="relative">
                  <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Address *</label>
                  <input
                    type="text"
                    id="address"
                    {...register('address', {
                      required: 'Address is required'
                    })}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 shadow-sm text-gray-800 bg-white ${
                      errors.address ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                    }`}
                    placeholder="Enter your address"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-teal-100">
              <h3 className="text-xl font-bold text-teal-600 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Professional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="specialization" className="block text-gray-700 text-sm font-bold mb-2">Specialization *</label>
                  <input
                    type="text"
                    id="specialization"
                    {...register('specialization', {
                      required: 'Specialization is required'
                    })}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 shadow-sm text-gray-800 bg-white ${
                      errors.specialization ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                    }`}
                    placeholder="e.g., Cardiology, Neurology"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization.message}</p>}
                </div>

                <div className="relative">
                  <label htmlFor="qualification" className="block text-gray-700 text-sm font-bold mb-2">Qualification *</label>
                  <input
                    type="text"
                    id="qualification"
                    {...register('qualification', {
                      required: 'Qualification is required'
                    })}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 shadow-sm text-gray-800 bg-white ${
                      errors.qualification ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                    }`}
                    placeholder="e.g., MBBS, MD, MS"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  {errors.qualification && <p className="text-red-500 text-sm mt-1">{errors.qualification.message}</p>}
                </div>

                <div className="relative">
                  <label htmlFor="experience" className="block text-gray-700 text-sm font-bold mb-2">Experience (Years) *</label>
                  <input
                    type="number"
                    id="experience"
                    {...register('experience', {
                      required: 'Experience is required',
                      min: {
                        value: 0,
                        message: 'Experience cannot be negative'
                      },
                      valueAsNumber: true
                    })}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 shadow-sm text-gray-800 bg-white ${
                      errors.experience ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                    }`}
                    placeholder="Years of experience"
                    min="0"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>}
                </div>
              </div>
            </div>

            {/* Availability Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-teal-100">
              <h3 className="text-xl font-bold text-teal-600 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Availability
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-3">Available Days *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableDaysOptions.map(day => (
                      <label key={day} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:border-teal-500 transition-colors duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                          value={day}
                          {...register('availableDays', {
                            required: 'At least one day must be selected'
                          })}
                          className="text-teal-500 focus:ring-teal-500"
                        />
                        <span className="text-gray-700">{day}</span>
                      </label>
                    ))}
                  </div>
                  {errors.availableDays && <p className="text-red-500 text-sm mt-1">{errors.availableDays.message}</p>}
                </div>

                <div className="relative">
                  <label htmlFor="availableTime" className="block text-gray-700 text-sm font-bold mb-2">Available Time Slot *</label>
                  <select
                    id="availableTime"
                    {...register('availableTime', {
                      required: 'Available time is required'
                    })}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 shadow-sm text-gray-800 bg-white ${
                      errors.availableTime ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                    }`}
                  >
                    <option value="">Select time slot</option>
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.availableTime && <p className="text-red-500 text-sm mt-1">{errors.availableTime.message}</p>}
                </div>

                {watchAvailableTime === 'Custom' && (
                  <div className="relative">
                    <label htmlFor="customTime" className="block text-gray-700 text-sm font-bold mb-2">Custom Time Slot *</label>
                    <input
                      type="text"
                      id="customTime"
                      {...register('customTime', {
                        required: watchAvailableTime === 'Custom' ? 'Custom time is required' : false
                      })}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 shadow-sm text-gray-800 bg-white ${
                        errors.customTime ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                      }`}
                      placeholder="e.g., 10:00 AM - 4:00 PM"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.customTime && <p className="text-red-500 text-sm mt-1">{errors.customTime.message}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-teal-100">
              <h3 className="text-xl font-bold text-teal-600 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password *</label>
                  <input
                    type="password"
                    id="password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/,
                        message: 'Password must contain uppercase, lowercase, number, and special character'
                      }
                    })}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 shadow-sm text-gray-800 bg-white ${
                      errors.password ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                    }`}
                    placeholder="Enter password"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </div>

                <div className="relative">
                  <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === watchPassword || 'Passwords do not match'
                    })}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 shadow-sm text-gray-800 bg-white ${
                      errors.confirmPassword ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                    }`}
                    placeholder="Confirm password"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-4 rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  REGISTERING...
                </>
              ) : (
                'REGISTER AS DOCTOR'
              )}
            </button>

            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium transition duration-200">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegistration;