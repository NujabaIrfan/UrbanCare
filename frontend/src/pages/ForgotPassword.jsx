import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { REACT_APP_API_URL } = process.env

function ForgotPassword() {
    const [step, setStep] = useState(1); // 1 = Verify Email, 2 = Reset Password
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // Password strength state
    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false
    });

    const [strengthLevel, setStrengthLevel] = useState(0);
    const [strengthColor, setStrengthColor] = useState('bg-gray-500');

    // Validate email
    const validateEmail = (value) => {
        if (!value) {
            setErrors({...errors, email: "Email is required"});
            return false;
        } else if (!/^\S+@\S+\.\S+$/.test(value)) {
            setErrors({...errors, email: "Invalid email format"});
            return false;
        } else {
            const newErrors = {...errors};
            delete newErrors.email;
            setErrors(newErrors);
            return true;
        }
    };

    // Validate password
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

        if (!value) {
            setErrors({...errors, newPassword: "Password is required"});
            return false;
        } else if (level < 5) {
            setErrors({...errors, newPassword: "Please meet all password requirements"});
            return false;
        } else {
            const newErrors = {...errors};
            delete newErrors.newPassword;
            setErrors(newErrors);
            return true;
        }
    };

    // Validate confirm password
    const validateConfirmPassword = (value) => {
        if (!value) {
            setErrors({...errors, confirmPassword: "Confirm password is required"});
            return false;
        } else if (newPassword !== value) {
            setErrors({...errors, confirmPassword: "Passwords do not match"});
            return false;
        } else {
            const newErrors = {...errors};
            delete newErrors.confirmPassword;
            setErrors(newErrors);
            return true;
        }
    };

    // Validate confirm password when password changes
    useEffect(() => {
        if (confirmPassword) {
            validateConfirmPassword(confirmPassword);
        }
    }, [newPassword]);

    // Verify Email
    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        if (!validateEmail(email)) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${REACT_APP_API_URL}/api/auth/verify-email`, { email });
            setMessage(response.data.message);
            toast.success("Email verified! You can now reset your password.");
            setTimeout(() => {
                setStep(2); // Move to Reset Password step
            }, 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Something went wrong";
            setError(errorMsg);
            toast.error(errorMsg);
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors.reduce((acc, curr) => {
                    acc[curr.field] = curr.message;
                    return acc;
                }, {}));
            }
        } finally {
            setLoading(false);
        }
    };

    // Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        const isPasswordValid = validatePassword(newPassword);
        const isConfirmValid = validateConfirmPassword(confirmPassword);

        if (!isPasswordValid || !isConfirmValid) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${REACT_APP_API_URL}/api/auth/forgot-password`, { 
                email, 
                newPassword, 
                confirmPassword 
            });
            setMessage(response.data.message);
            toast.success("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Something went wrong";
            setError(errorMsg);
            toast.error(errorMsg);
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors.reduce((acc, curr) => {
                    acc[curr.field] = curr.message;
                    return acc;
                }, {}));
            }
        } finally {
            setLoading(false);
        }
    };

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
                    
                    {/* Content */}
                    <div className="mt-8">
                        <h2 className="text-3xl font-bold mb-2 text-gray-800 flex items-center justify-center">
                            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                                URBAN CARE
                            </span>
                            <span className="text-gray-700 ml-2">
                                {step === 1 ? "FORGOT PASSWORD" : "RESET PASSWORD"}
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {step === 1 ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                )}
                            </svg>
                        </h2>
                        
                        <p className="text-center text-gray-600 mb-6">
                            {step === 1 ? "Enter your email to receive a password reset link" : "Create a new password to secure your account"}
                        </p>

                        {message && <p className="mt-4 text-green-600 text-center font-semibold bg-green-50 p-3 rounded-lg">{message}</p>}
                        {error && <p className="mt-4 text-red-600 text-center font-semibold bg-red-50 p-3 rounded-lg">{error}</p>}

                        {step === 1 ? (
                            // Email Verification
                            <form onSubmit={handleVerifyEmail} className="space-y-5">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2 uppercase tracking-wider">EMAIL ADDRESS</label>
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                validateEmail(e.target.value);
                                            }}
                                            required
                                            className={`w-full pl-10 pr-3 py-3 border-2 ${
                                                errors.email ? "border-red-500" : "border-gray-300"
                                            } bg-white rounded-lg focus:outline-none focus:ring-2 ${
                                                errors.email ? "focus:ring-red-500" : "focus:ring-teal-500"
                                            } text-gray-800 transition-all duration-300 group-hover:border-teal-400 shadow-sm`}
                                            placeholder="Enter your email address"
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5 group-hover:text-teal-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-teal-500 to-blue-500 group-hover:w-full transition-all duration-500"></div>
                                    </div>
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full text-white py-3 rounded-lg transition duration-300 font-bold relative overflow-hidden group bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 cursor-pointer shadow-lg disabled:opacity-70"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            VERIFYING EMAIL...
                                        </span>
                                    ) : (
                                        <>
                                            <span className="relative z-10">VERIFY EMAIL</span>
                                            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></span>
                                        </>
                                    )}
                                </button>

                                <div className="text-center mt-4">
                                    <p className="text-gray-600">
                                        Remember your password? 
                                        <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium ml-1 transition duration-200 relative group">
                                            Back to Login
                                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 group-hover:w-full transition-all duration-300"></span>
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        ) : (
                            // Reset Password
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2 uppercase tracking-wider">NEW PASSWORD</label>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                validatePassword(e.target.value);
                                            }}
                                            required
                                            className={`w-full pl-10 pr-3 py-3 border-2 ${
                                                errors.newPassword ? "border-red-500" : "border-gray-300"
                                            } bg-white rounded-lg focus:outline-none focus:ring-2 ${
                                                errors.newPassword ? "focus:ring-red-500" : "focus:ring-teal-500"
                                            } text-gray-800 transition-all duration-300 group-hover:border-teal-400 shadow-sm`}
                                            placeholder="Enter new password"
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
                                    
                                    {errors.newPassword && <p className="text-red-500 text-sm mt-2">{errors.newPassword}</p>}
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
                                            className={`w-full pl-10 pr-3 py-3 border-2 ${
                                                errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                            } bg-white rounded-lg focus:outline-none focus:ring-2 ${
                                                errors.confirmPassword ? "focus:ring-red-500" : "focus:ring-teal-500"
                                            } text-gray-800 transition-all duration-300 group-hover:border-teal-400 shadow-sm`}
                                            placeholder="Confirm your password"
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5 group-hover:text-teal-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-teal-500 to-blue-500 group-hover:w-full transition-all duration-500"></div>
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full text-white py-3 rounded-lg transition duration-300 font-bold relative overflow-hidden group bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 cursor-pointer shadow-lg disabled:opacity-70"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            RESETTING PASSWORD...
                                        </span>
                                    ) : (
                                        <>
                                            <span className="relative z-10">RESET PASSWORD</span>
                                            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></span>
                                        </>
                                    )}
                                </button>

                                <div className="text-center mt-4">
                                    <p className="text-gray-600">
                                        Changed your mind? 
                                        <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium ml-1 transition duration-200 relative group">
                                            Back to Login
                                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 group-hover:w-full transition-all duration-300"></span>
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
                
                {/* Right side - Hospital Information */}
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4">URBAN CARE</h2>
                        <p className="text-lg mb-6 text-blue-100">
                            {step === 1 ? "Secure Password Recovery" : "Create a Strong New Password"}
                        </p>
                        
                        {/* Divider */}
                        <div className="w-20 h-1 bg-white bg-opacity-50 mx-auto mb-8"></div>
                        
                        {/* Security Features */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white bg-opacity-20 p-4 rounded-lg border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300 group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <p className="text-sm text-white">Secure Process</p>
                            </div>
                            <div className="bg-white bg-opacity-20 p-4 rounded-lg border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300 group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <p className="text-sm text-white">Protected Access</p>
                            </div>
                        </div>
                        
                        <p className="text-blue-100 mb-6">
                            {step === 1 ? "We'll help you regain access to your account" : "Ensure your new password is strong and unique"}
                        </p>
                        
                        {/* Security Tips */}
                        <div className="mt-6 text-left">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-200 mb-3">Security Tips</h3>
                            <ul className="text-sm space-y-2 text-blue-100">
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Use a unique password
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Enable two-factor authentication
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Keep your recovery email updated
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;