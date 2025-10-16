import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({
        email: "",
        password: "",
        general: ""
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            email: "",
            password: "",
            general: ""
        };

        // Email validation
        if (!email) {
            newErrors.email = "Email is required";
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email address";
            valid = false;
        }

        // Password validation
        if (!password) {
            newErrors.password = "Password is required";
            valid = false;
        } 

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fix the form errors before submitting", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }

        setLoading(true);
        setErrors({ ...errors, general: "" });

        try {
            const user = await login(email, password);
            
            if (user) {
                toast.success("Login successful! Redirecting...", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                setTimeout(() => navigate("/"), 2000);
            }
        } catch (error) {
            // Handle specific error cases based on backend responses
            if (error.response) {
                const { data } = error.response;
                if (data.message === 'Invalid credentials') {
                    toast.error("Invalid email or password", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                } else if (data.message === 'Account not verified. Please verify your email first.') {
                    toast.warn("Your account is not verified. Please check your email for verification link.", {
                        position: "top-right",
                        autoClose: 8000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                } else {
                    toast.error("Error logging in. Please try again.", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                }
            } else {
                toast.error("Network error. Please check your connection.", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
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
            
            {/* Main container with medical styling */}
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
                    
                    {/* Moved the login section lower with margin-top */}
                    <div className="mt-12"> {/* Added margin-top to push content lower */}
                        <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center justify-center">
                            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                                URBAN CARE
                            </span>
                            <span className="text-gray-700 ml-2">LOGIN</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </h2>
        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-3 uppercase tracking-wider">EMAIL</label>
                                <div className="relative group">
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setErrors({ ...errors, email: "" });
                                        }} 
                                        required 
                                        placeholder="Enter your email"
                                        className={`w-full pl-10 pr-3 py-3 border-2 ${
                                            errors.email ? "border-red-500" : "border-gray-300"
                                        } bg-white rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.email ? "focus:ring-red-500" : "focus:ring-teal-500"
                                        } text-gray-800 transition-all duration-300 group-hover:border-teal-400 shadow-sm`}
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5 group-hover:text-teal-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {/* Input focus animation */}
                                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-teal-500 to-blue-500 group-hover:w-full transition-all duration-500"></div>
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-3 uppercase tracking-wider">PASSWORD</label>
                                <div className="relative group">
                                    <input 
                                        type="password" 
                                        value={password} 
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setErrors({ ...errors, password: "" });
                                        }} 
                                        required 
                                        placeholder="Enter your password"
                                        className={`w-full pl-10 pr-3 py-3 border-2 ${
                                            errors.password ? "border-red-500" : "border-gray-300"
                                        } bg-white rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.password ? "focus:ring-red-500" : "focus:ring-teal-500"
                                        } text-gray-800 transition-all duration-300 group-hover:border-teal-400 shadow-sm`}
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5 group-hover:text-teal-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    {/* Input focus animation */}
                                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-teal-500 to-blue-500 group-hover:w-full transition-all duration-500"></div>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                )}
                            </div>
                            
                            {/* Remember me checkbox */}
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="remember" 
                                    className="w-4 h-4 bg-white border-gray-300 rounded focus:ring-teal-500"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                    Remember me
                                </label>
                            </div>
                            
                            {/* Login button */}
                            <button 
                                type="submit" 
                                className={`w-full text-white py-3 rounded-lg transition duration-300 font-bold relative overflow-hidden group ${
                                    loading 
                                    ? "bg-gray-400 cursor-not-allowed" 
                                    : "bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 mt-6 cursor-pointer shadow-lg"
                                }`}
                                disabled={loading}
                            >
                                {loading ? 
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        LOGGING IN
                                    </span> : 
                                    <>
                                        <span className="relative z-10">ACCESS YOUR ACCOUNT</span>
                                        <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></span>
                                    </>
                                }
                            </button>
                        </form>
                        <p className="text-gray-600 text-center mt-4">
                            <Link to="/forgot-password" className="hover:text-teal-600 transition duration-200 relative group">
                                Forgot Password?
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        </p>
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 10h6m-6 4h6m-3-2v6" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4">URBAN CARE</h2>
                        <p className="text-lg mb-6 text-blue-100">Comprehensive Hospital Management System</p>
                        
                        {/* Divider */}
                        <div className="w-20 h-1 bg-white bg-opacity-50 mx-auto mb-8"></div>
                        
                        {/* Hospital Features */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white bg-opacity-20 p-4 rounded-lg border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300 group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="text-sm text-white">Patient Records</p>
                            </div>
                            <div className="bg-white bg-opacity-20 p-4 rounded-lg border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300 group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-white">Appointments</p>
                            </div>
                        </div>
                        
                        <p className="text-blue-100 mb-6">New to Urban Care?</p>
                        
                        {/* Register button */}
                        <Link to="/register" className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-8 py-3 rounded-lg transition duration-300 font-semibold inline-flex items-center shadow-lg border border-white border-opacity-30">
                            <span className="relative z-10">CREATE ACCOUNT</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                        
                        {/* System Features */}
                        <div className="mt-8 text-left">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-200 mb-3">System Features</h3>
                            <ul className="text-sm space-y-2 text-blue-100">
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Secure patient data management
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Online appointment scheduling
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Medical records access
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;