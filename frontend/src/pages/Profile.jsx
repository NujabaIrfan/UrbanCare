import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';

const { REACT_APP_API_URL } = process.env

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [profile, setProfile] = useState({
        name: user?.name || "",
        email: user?.email || "",
        contactNumber: user?.contactNumber || "",
        address: user?.address || "",
    });
    const [newPassword, setNewPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Authentication required. Please log in again.");
                return;
            }

            // Input validation
            if (!profile.name || !profile.email) {
                toast.error("Name and email are required fields");
                return;
            }

            console.log("🔄 Attempting profile update", { updateData: profile });

            const response = await axios.put(
                `${REACT_APP_API_URL}/api/profile/update`,
                profile,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10 second timeout
                }
            );

            if (!response.data?.user) {
                throw new Error("Invalid response format");
            }

            setUser(response.data.user); // Update global state
            toast.success("Profile updated successfully!");
            setShowEditForm(false);
        } catch (error) {
            console.error("Profile Update Error:", {
                config: error.config,
                response: error.response,
                message: error.message
            });

            if (error.code === 'ECONNABORTED') {
                toast.error("Request timed out. Please check your connection.");
            } 
            else if (error.response?.status === 503) {
                toast.error("Server busy. Please try again shortly.");
            }
            else if (error.message.includes("Invalid response")) {
                toast.error("Data format error. Contact support.");
            }
            else {
                toast.error(error.response?.data?.message || "Profile update failed.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            toast.error("Please enter both old and new passwords.");
            return;
        }

        setLoading(true);
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Authentication required. Please log in again.");
                return;
            }

            console.log("🔐 Attempting password change");

            const response = await axios.put(
                `${REACT_APP_API_URL}/api/profile/change-password`,
                { oldPassword, newPassword },
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10 second timeout
                }
            );

            if (!response.data?.message) {
                throw new Error("Invalid response format");
            }

            toast.success("Password changed successfully! Please login again.");
            setOldPassword("");
            setNewPassword("");
            setShowPasswordForm(false);
            
            // Logout user after password change
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate('/login');
        } catch (error) {
            console.error("Password Change Error:", {
                config: error.config,
                response: error.response,
                message: error.message
            });

            if (error.code === 'ECONNABORTED') {
                toast.error("Request timed out. Please check your connection.");
            } 
            else if (error.response?.status === 503) {
                toast.error("Server busy. Please try again shortly.");
            }
            else if (error.message.includes("Invalid response")) {
                toast.error("Data format error. Contact support.");
            }
            else {
                toast.error(error.response?.data?.message || "Password change failed.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Authentication required. Please log in again.");
                return;
            }

            console.log("🗑️ Attempting account deletion");

            const response = await axios.delete(
                `${REACT_APP_API_URL}/api/profile/delete`,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10 second timeout
                }
            );

            if (!response.data?.message) {
                throw new Error("Invalid response format");
            }

            toast.success("Account deleted successfully!");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate('/');
        } catch (error) {
            console.error("Account Deletion Error:", {
                config: error.config,
                response: error.response,
                message: error.message
            });

            if (error.code === 'ECONNABORTED') {
                toast.error("Request timed out. Please check your connection.");
            } 
            else if (error.response?.status === 503) {
                toast.error("Server busy. Please try again shortly.");
            }
            else if (error.message.includes("Invalid response")) {
                toast.error("Data format error. Contact support.");
            }
            else {
                toast.error(error.response?.data?.message || "Failed to delete account.");
            }
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div 
            className="min-h-screen text-white relative flex flex-col items-center p-6"
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
            
            <h2 className="text-4xl font-bold text-center my-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                Patient Profile
            </h2>
            
            <div className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl p-8 border border-teal-200">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Welcome, {user?.name}!
                    </h2>
                    <p className="text-gray-600 mt-2">Manage your healthcare profile and settings</p>
                </div>

                {!showEditForm && !showPasswordForm && (
                    <>
                        {/* Profile Information */}
                        <div className="mb-8 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl shadow-lg border border-teal-100">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <p className="text-gray-700">
                                        <strong className="text-teal-600">Full Name:</strong> {user?.name}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong className="text-teal-600">Email Address:</strong> {user?.email}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-gray-700">
                                        <strong className="text-teal-600">Contact Number:</strong> {user?.contactNumber || "Not provided"}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong className="text-teal-600">Address:</strong> {user?.address || "Not provided"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button 
                                onClick={() => setShowEditForm(true)} 
                                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Profile
                            </button>
                            <button 
                                onClick={() => setShowPasswordForm(true)} 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Change Password
                            </button>
                            <button 
                                onClick={() => setShowDeleteModal(true)} 
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Account
                            </button>
                        </div>
                    </>
                )}

                {showEditForm && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl shadow-md border border-teal-100">
                        <h3 className="text-2xl font-bold text-teal-600 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile Information
                        </h3>
                        <div className="space-y-4">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={profile.name || ""} 
                                    onChange={handleChange} 
                                    placeholder="Full Name" 
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm" 
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={profile.email || ""} 
                                    onChange={handleChange} 
                                    placeholder="Email Address" 
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm" 
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="contactNumber" 
                                    value={profile.contactNumber || ""} 
                                    onChange={handleChange} 
                                    placeholder="Contact Number" 
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm" 
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="address" 
                                    value={profile.address || ""} 
                                    onChange={handleChange} 
                                    placeholder="Address" 
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm" 
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex space-x-4 mt-6">
                            <button 
                                onClick={handleUpdateProfile} 
                                disabled={loading} 
                                className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-70"
                            >
                                {loading ? "Updating..." : "Save Changes"}
                            </button>
                            <button 
                                onClick={() => setShowEditForm(false)} 
                                className="flex-1 bg-gray-500 text-white py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {showPasswordForm && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl shadow-md border border-teal-100">
                        <h3 className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Change Password
                        </h3>
                        <div className="space-y-4">
                            <div className="relative">
                                <input 
                                    type="password" 
                                    placeholder="Current Password" 
                                    value={oldPassword} 
                                    onChange={(e) => setOldPassword(e.target.value)} 
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm" 
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    placeholder="New Password" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm" 
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex space-x-4 mt-6">
                            <button 
                                onClick={handleChangePassword} 
                                disabled={loading} 
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-70"
                            >
                                {loading ? "Changing..." : "Update Password"}
                            </button>
                            <button 
                                onClick={() => setShowPasswordForm(false)} 
                                className="flex-1 bg-gray-500 text-white py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                        <div className="bg-white p-8 rounded-xl shadow-2xl border border-red-200 max-w-md w-full mx-4">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-red-600 mb-2">Delete Account</h3>
                                <p className="text-gray-600">
                                    Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
                                </p>
                            </div>
                            <div className="flex space-x-4">
                                <button 
                                    onClick={handleDeleteAccount} 
                                    disabled={loading} 
                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-md disabled:opacity-70"
                                >
                                    {loading ? "Deleting..." : "Yes, Delete"}
                                </button>
                                <button 
                                    onClick={() => setShowDeleteModal(false)} 
                                    className="flex-1 bg-gray-500 text-white py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold shadow-md"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;