import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const { REACT_APP_API_URL } = process.env

function VerifyOTP() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    // Handle countdown timer for resend OTP
    useEffect(() => {
        let timer;
        
        // Update countdown every second
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0 && resendDisabled) {
            setResendDisabled(false);
        }
        
        return () => clearTimeout(timer);
    }, [countdown, resendDisabled]);

    // Format countdown to MM:SS
    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index, e) => {
        const value = e.target.value;
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        const enteredOTP = otp.join("");
        setLoading(true);

        if (enteredOTP.length !== 6) {
            toast.error("Please enter a 6-digit OTP.", { position: "top-right" });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${REACT_APP_API_URL}/api/auth/verify-otp`, {
                email: localStorage.getItem("email"),
                otp: enteredOTP
            });

            toast.success("OTP Verified Successfully! Redirecting to login...", { position: "top-right" });
            localStorage.removeItem("email"); // Clean up
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.error("Error verifying OTP:", error);
            if (error.response?.data?.message?.includes('not found')) {
                toast.error("OTP not found. Please click 'Resend' for a new code.", {
                    position: "top-right",
                    autoClose: 5000
                });
                setResendDisabled(false); // Enable resend immediately
            } else {
                toast.error(
                    error.response?.data?.message || "Verification failed. Please try again.",
                    { position: "top-right" }
                );
            }
            
            // Clear OTP fields on error
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0].focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${REACT_APP_API_URL}/api/auth/resend-otp`, {
                email: localStorage.getItem("email")
            });
            
            toast.success("New OTP sent to your email!", { position: "top-right" });
            
            // Reset UI state
            setResendDisabled(true);
            setCountdown(300); // 5 minutes
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0].focus();
            
        } catch (error) {
            console.error("Resend error:", error.response?.data);
            toast.error(
                error.response?.data?.message || "Failed to resend OTP. Please try again.",
                { position: "top-right" }
            );
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
            <div className="flex bg-white shadow-2xl rounded-lg w-4/5 max-w-4xl overflow-hidden border border-teal-200">
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
                            <span className="text-gray-700 ml-2">VERIFY OTP</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </h2>
                        
                        <p className="text-center text-gray-600 mb-2">
                            Enter the 6-digit verification code
                        </p>
                        <p className="text-center text-sm text-teal-600 font-medium mb-6">
                            Sent to {localStorage.getItem("email")}
                        </p>

                        {/* OTP Expiration Timer */}
                        {resendDisabled && (
                            <div className="text-center mb-6 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                ⏰ OTP expires in: <span className="font-bold text-teal-600">{formatCountdown(countdown)}</span>
                            </div>
                        )}

                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="flex justify-center gap-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-14 h-14 text-2xl font-semibold text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 transform hover:scale-105 focus:scale-110 bg-white text-gray-800 shadow-sm"
                                        autoFocus={index === 0}
                                    />
                                ))}
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
                                        VERIFYING...
                                    </span>
                                ) : (
                                    <>
                                        <span className="relative z-10">VERIFY OTP</span>
                                        <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></span>
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <p className="text-gray-600 text-sm">
                                    Didn't receive the code?{" "}
                                    <button
                                        type="button"
                                        onClick={!resendDisabled ? handleResendOTP : null}
                                        disabled={resendDisabled || loading}
                                        className={`font-medium transition duration-200 relative group ${
                                            resendDisabled || loading
                                                ? "text-gray-400 cursor-not-allowed" 
                                                : "text-teal-600 hover:text-teal-700 cursor-pointer"
                                        }`}
                                    >
                                        {resendDisabled ? `Resend in ${formatCountdown(countdown)}` : "Resend now"}
                                        {!resendDisabled && (
                                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 group-hover:w-full transition-all duration-300"></span>
                                        )}
                                    </button>
                                </p>
                            </div>
                        </form>
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4">URBAN CARE</h2>
                        <p className="text-lg mb-6 text-blue-100">Secure Account Verification</p>
                        
                        {/* Divider */}
                        <div className="w-20 h-1 bg-white bg-opacity-50 mx-auto mb-8"></div>
                        
                        {/* Security Features */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white bg-opacity-20 p-4 rounded-lg border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300 group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <p className="text-sm text-white">Secure Code</p>
                            </div>
                            <div className="bg-white bg-opacity-20 p-4 rounded-lg border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300 group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <p className="text-sm text-white">Time Limited</p>
                            </div>
                        </div>
                        
                        <p className="text-blue-100 mb-6">
                            Enter the 6-digit code sent to your email to complete verification
                        </p>
                        
                        {/* Security Tips */}
                        <div className="mt-6 text-left">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-200 mb-3">Verification Tips</h3>
                            <ul className="text-sm space-y-2 text-blue-100">
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Check your email inbox and spam folder
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Code expires in 5 minutes for security
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Contact support if you need assistance
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyOTP;