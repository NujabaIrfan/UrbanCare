import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';  
import axios from 'axios';
import { toast } from "react-toastify";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [address, setAddress] = useState('');
    const navigate = useNavigate(); 

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [contactNumberError, setContactNumberError] = useState('');
    const [addressError, setAddressError] = useState('');

    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false
    });

    const [strengthLevel, setStrengthLevel] = useState(0);
    const [strengthColor, setStrengthColor] = useState('bg-gray-500');

    // Validate name (letters only)
    const validateName = (value) => {
        if (!value) {
            setNameError("Name is required");
            return false;
        } else if (!/^[A-Za-z\s]+$/.test(value)) {
            setNameError("Name can only contain letters");
            return false;
        } else {
            setNameError("");
            return true;
        }
    };

    // Validate email
    const validateEmail = (value) => {
        if (!value) {
            setEmailError("Email is required");
            return false;
        } else if (!/^\S+@\S+\.\S+$/.test(value)) {
            setEmailError("Invalid email format");
            return false;
        } else {
            setEmailError("");
            return true;
        }
    };

    // Enhanced password validation with strength meter
    const validatePassword = (value) => {
        const newStrength = {
            length: value.length >= 8,
            uppercase: /[A-Z]/.test(value),
            lowercase: /[a-z]/.test(value),
            number: /[0-9]/.test(value),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value)
        };

        setPasswordStrength(newStrength);

        // Calculate strength level (0-5)
        const level = Object.values(newStrength).filter(Boolean).length;
        setStrengthLevel(level);

        // Set strength color
        let color;
        if (level <= 1) color = 'bg-red-500';
        else if (level === 2) color = 'bg-yellow-500';
        else if (level === 3) color = 'bg-blue-500';
        else color = 'bg-green-500';
        setStrengthColor(color);

        // Set error message if needed
        if (!value) {
            setPasswordError("Password is required");
            return false;
        } else if (level < 5) {
            setPasswordError("Please meet all password requirements");
            return false;
        } else {
            setPasswordError("");
            return true;
        }
    };

    // Validate confirm password
    const validateConfirmPassword = (value) => {
        if (!value) {
            setConfirmPasswordError("Confirm password is required");
            return false;
        } else if (password !== value) {
            setConfirmPasswordError("Passwords do not match");
            return false;
        } else {
            setConfirmPasswordError("");
            return true;
        }
    };

    // Validate contact number
    const validateContactNumber = (value) => {
        if (!value) {
            setContactNumberError("Contact number is required");
            return false;
        } else if (!/^\d{10}$/.test(value)) {
            setContactNumberError("Invalid contact number. It should be 10 digits.");
            return false;
        } else {
            setContactNumberError("");
            return true;
        }
    };

    // Validate address
    const validateAddress = (value) => {
        if (!value) {
            setAddressError("Address is required");
            return false;
        } else {
            setAddressError("");
            return true;
        }
    };

    // Handle name change with validation
    const handleNameChange = (e) => {
        const value = e.target.value;
        // Only allow letters and spaces
        if (/^[A-Za-z\s]*$/.test(value)) {
            setName(value);
            validateName(value);
        }
    };

    // Validate all fields before submission
    const validateAll = () => {
        const isNameValid = validateName(name);
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
        const isContactNumberValid = validateContactNumber(contactNumber);
        const isAddressValid = validateAddress(address);

        return (
            isNameValid &&
            isEmailValid &&
            isPasswordValid &&
            isConfirmPasswordValid &&
            isContactNumberValid &&
            isAddressValid
        );
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateAll()) return;

        try {
            console.log("Sending:", { name, email, password, confirmPassword, contactNumber, address });
            const response = await axios.post('http://localhost:5000/api/auth/register', { 
                name, 
                email, 
                password, 
                confirmPassword,
                contactNumber, 
                address 
            });
            
            localStorage.setItem('email', email);

            toast.success("Check your email for OTP verification!", { position: "top-right" });
            
            navigate('/verify-otp');
        } catch (error) {
            console.error('Registration failed:', error);
            if (error.response?.data?.errors) {
                error.response.data.errors.forEach(err => {
                    toast.error(`${err.field}: ${err.message}`, { position: "top-right" });
                });
            } else {
                toast.error(error.response?.data?.message || "Registration failed. Please try again.", { position: "top-right" });
            }
        }
    };

    // Validate confirm password whenever password changes
    useEffect(() => {
        if (confirmPassword) {
            validateConfirmPassword(confirmPassword);
        }
    }, [password]);

    return (
        <div 
            className="flex items-center justify-center min-h-screen text-white relative"
            style={{
                background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Home Button with medical styling */}
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
            
            {/* Main container matching login page */}
            <div className="flex bg-white shadow-2xl rounded-lg w-4/5 max-w-6xl overflow-hidden border border-teal-200">
                {/* Left side - Form with light gradient */}
                <div 
                    className="w-1/2 p-8 relative flex flex-col justify-center"
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
                    
                    {/* Moved the register section lower */}
                    <div className="mt-8">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center justify-center">
                            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                                URBAN CARE
                            </span>
                            <span className="text-gray-700 ml-2">REGISTER</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                            </svg>
                        </h2>
        
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase tracking-wider">NAME</label>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={handleNameChange} 
                                        required 
                                        placeholder="Enter your name"
                                        className={`w-full pl-10 pr-3 py-3 border-2 ${
                                            nameError ? "border-red-500" : "border-gray-300"
                                        } bg-white rounded-lg focus:outline-none focus:ring-2 ${
                                            nameError ? "focus:ring-red-500" : "focus:ring-teal-500"
                                        } text-gray-800 transition-all duration-300 group-hover:border-teal-400 shadow-sm`}
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5 group-hover:text-teal-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-teal-500 to-blue-500 group-hover:w-full transition-all duration-500"></div>
                                </div>
                                {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase tracking-wider">EMAIL</label>
                                <div className="relative group">
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            validateEmail(e.target.value);
                                        }} 
                                        required 
                                        placeholder="Enter your email"
                                        className={`w-full pl-10 pr-3 py-3 border-2 ${
                                            emailError ? "border-red-500" : "border-gray-300"
                                        } bg-white rounded-lg focus:outline-none focus:ring-2 ${
                                            emailError ? "focus:ring-red-500" : "focus:ring-teal-500"
                                        } text-gray-800 transition-all duration-300 group-hover:border-teal-400 shadow-sm`}
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5 group-hover:text-teal-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-teal-500 to-blue-500 group-hover:w-full transition-all duration-500"></div>
                                </div>
                                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase tracking-wider">PASSWORD</label>
                                <div className="relative group">
                                    <input 
                                        type="password" 
                                        value={password} 
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            validatePassword(e.target.value);
                                        }} 
                                        required 
                                        placeholder="Enter your password"
                                        className={`w-full pl-10 pr-3 py-3 border-2 ${
                                            passwordError ? "border-red-500" : "border-gray-300"
                                        } bg-white rounded-lg focus:outline-none focus:ring-2 ${
                                            passwordError ? "focus:ring-red-500" : "focus:ring-teal-500"
                                        } text-gray-800 transition-all duration-300 group-hover:border-teal-400 shadow-sm`}
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5 group-hover:text-teal-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-teal-500 to-blue-500 group-hover:w-full transition-all duration-500"></div>
                                </div>
                                
                                {/* Password Strength Meter */}
                                <div className="mt-3">
                                    <div className="flex items-center mb-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full ${strengthColor} transition-all duration-300`}
                                                style={{ width: `${strengthLevel * 20}%` }}
                                            ></div>
                                        </div>
                                        <span className="ml-2 text-xs text-gray-600 font-medium">
                                            {strengthLevel <= 1 ? 'Weak' : 
                                             strengthLevel <= 3 ? 'Medium' : 'Strong'}
                                        </span>
                                    </div>
                                    
                                    {/* Password Requirements */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className={`flex items-center ${passwordStrength.length ? 'text-green-500' : 'text-gray-500'}`}>
                                            <span className="mr-1">✓</span>
                                            <span>8+ characters</span>
                                        </div>
                                        <div className={`flex items-center ${passwordStrength.uppercase ? 'text-green-500' : 'text-gray-500'}`}>
                                            <span className="mr-1">✓</span>
                                            <span>Uppercase letter</span>
                                        </div>
                                        <div className={`flex items-center ${passwordStrength.lowercase ? 'text-green-500' : 'text-gray-500'}`}>
                                            <span className="mr-1">✓</span>
                                            <span>Lowercase letter</span>
                                        </div>
                                        <div className={`flex items-center ${passwordStrength.number ? 'text-green-500' : 'text-gray-500'}`}>
                                            <span className="mr-1">✓</span>
                                            <span>Number</span>
                                        </div>
                                        <div className={`flex items-center ${passwordStrength.specialChar ? 'text-green-500' : 'text-gray-500'}`}>
                                            <span className="mr-1">✓</span>
                                            <span>Special character</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase tracking-wider">CONFIRM PASSWORD</label>
                                <div className="relative group">
                                    <input 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            validateConfirmPassword(e.target.value);
                                        }} 
                                        required 
                                        placeholder="Confirm your password"
                                        className={`w-full pl-10 pr-3 py-3 border-2 ${
                                            confirmPasswordError ? "border-red-500" : "border-gray-300"
                                        } bg-white rounded-lg focus:outline-none focus:ring-2 ${
                                            confirmPasswordError ? "focus:ring-red-500" : "focus:ring-teal-500"
                                        } text-gray-800 transition-all duration-300 group-hover:border-teal-400 shadow-sm`}
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5 group-hover:text-teal-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-teal-500 to-blue-500 group-hover:w-full transition-all duration-500"></div>
                                </div>
                                {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase tracking-wider">CONTACT NUMBER</label>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        value={contactNumber} 
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            setContactNumber(value);
                                            validateContactNumber(value);
                                        }} 
                                        required 
                                        placeholder="Enter your contact number"
                                        maxLength="10"
                                        className={`w-full pl-10 pr-3 py-3 border-2 ${
                                            contactNumberError ? "border-red-500" : "border-gray-300"
                                        } bg-white rounded-lg focus:outline-none focus:ring-2 ${
                                            contactNumberError ? "focus:ring-red-500" : "focus:ring-teal-500"
                                        } text-gray-800 transition-all duration-300 group-hover:border-teal-400 shadow-sm`}
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5 group-hover:text-teal-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-teal-500 to-blue-500 group-hover:w-full transition-all duration-500"></div>
                                </div>
                                {contactNumberError && <p className="text-red-500 text-sm mt-1">{contactNumberError}</p>}
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase tracking-wider">ADDRESS</label>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        value={address} 
                                        onChange={(e) => {
                                            setAddress(e.target.value);
                                            validateAddress(e.target.value);
                                        }} 
                                        required 
                                        placeholder="Enter your address"
                                        className={`w-full pl-10 pr-3 py-3 border-2 ${
                                            addressError ? "border-red-500" : "border-gray-300"
                                        } bg-white rounded-lg focus:outline-none focus:ring-2 ${
                                            addressError ? "focus:ring-red-500" : "focus:ring-teal-500"
                                        } text-gray-800 transition-all duration-300 group-hover:border-teal-400 shadow-sm`}
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5 group-hover:text-teal-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-teal-500 to-blue-500 group-hover:w-full transition-all duration-500"></div>
                                </div>
                                {addressError && <p className="text-red-500 text-sm mt-1">{addressError}</p>}
                            </div>

                            <button 
                                type="submit" 
                                className="w-full text-white py-3 rounded-lg transition duration-300 font-bold relative overflow-hidden group bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 mt-6 cursor-pointer shadow-lg"
                            >
                                <span className="relative z-10">CREATE ACCOUNT</span>
                                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></span>
                            </button>
                        </form>
                        
                        <div className="text-center mt-6">
                            <p className="text-gray-600">
                                Already have an account? 
                                <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium ml-1 transition duration-200 relative group">
                                    Login here
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Right side - Hospital Information (same as login) */}
                <div className="w-1/2 bg-gradient-to-br from-teal-600 via-blue-500 to-teal-700 text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                    {/* Medical pattern background */}
                    <div className="absolute inset-0 opacity-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                            <pattern id="medical-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                                <path d="M0 0h80v80H0z" fill="none" />
                                <path d="M20 20h40v40H20z" stroke="#fff" strokeWidth="1" fill="none" />
                                <path d="M40 20v-10M40 60v10M20 40h-10M60 40h10" stroke="#fff" strokeWidth="1" />
                                <path d="M30 35h20v10H30z" fill="#fff" />
                                <path d="M35 30v20" stroke="#fff" strokeWidth="2" />
                            </pattern>
                            <rect x="0" y="0" width="100%" height="100%" fill="url(#medical-pattern)"></rect>
                        </svg>
                    </div>
                    
                    {/* Medical border */}
                    <div className="absolute inset-x-4 top-4 bottom-4 border-2 border-white border-opacity-30 rounded-lg"></div>
                    
                    <div className="relative z-10">
                        <div className="mb-6">
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 10h6m-6 4h6m-3-2v6" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4">URBAN CARE</h2>
                        <p className="text-lg mb-6 text-blue-100">Join Our Healthcare Community</p>
                        
                        {/* Divider */}
                        <div className="w-20 h-1 bg-white bg-opacity-50 mx-auto mb-8"></div>
                        
                        {/* Registration Benefits */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white bg-opacity-20 p-4 rounded-lg border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300 group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <p className="text-sm text-white">Secure Account</p>
                            </div>
                            <div className="bg-white bg-opacity-20 p-4 rounded-lg border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300 group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-white">Easy Booking</p>
                            </div>
                        </div>
                        
                        <p className="text-blue-100 mb-6">Get started with Urban Care today!</p>
                        
                        {/* Registration Benefits */}
                        <div className="mt-6 text-left">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-200 mb-3">Why Register?</h3>
                            <ul className="text-sm space-y-2 text-blue-100">
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Quick appointment scheduling
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Access medical records
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Receive health updates
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;