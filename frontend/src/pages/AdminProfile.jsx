import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaUserEdit, FaKey, FaTrash, FaUserShield, FaHospital, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import 'react-toastify/dist/ReactToastify.css';

const { REACT_APP_API_URL } = process.env

function AdminProfile() {
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
          const { data } = await axios.put(
              `${REACT_APP_API_URL}/api/profile/update`,
              profile, 
              { headers: { Authorization: `Bearer ${token}` } }
          );

          setUser(data.updatedUser); // Update global state
          toast.success("Profile updated successfully!");
          setShowEditForm(false);
      } catch (error) {
          toast.error(error.response?.data?.message || "Profile update failed.");
      }
      setLoading(false);
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            toast.error("Please enter both old and new passwords.");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${REACT_APP_API_URL}/api/profile/change-password`,
                { oldPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Password changed successfully!");
            setOldPassword("");
            setNewPassword("");
            setShowPasswordForm(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Password change failed.");
        }
        setLoading(false);
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${REACT_APP_API_URL}/api/profile/delete`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Account deleted successfully!");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete account.");
        }
        setLoading(false);
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
        
        {/* Header Section */}
        <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl border-4 border-white">
                <FaUserShield className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400 mb-2">
                Administrator Profile
            </h2>
            <p className="text-blue-100 text-lg">Hospital Management System Control Panel</p>
        </div>
        
        <div className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl p-8 border border-teal-200">
            {/* Welcome Section */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center">
                    <FaHospital className="mr-3 text-teal-500" />
                    Welcome, {profile.name}!
                </h2>
                <p className="text-gray-600 mt-2">Administrator Account Management</p>
            </div>
            
            {!showEditForm && !showPasswordForm && (
                <>
                    {/* Profile Information */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl shadow-lg border border-teal-100">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FaUserShield className="mr-2 text-teal-500" />
                            Administrator Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                                        <FaUserEdit className="text-teal-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Full Name</p>
                                        <p className="text-gray-800 font-semibold">{profile.name || "Not provided"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email Address</p>
                                        <p className="text-gray-800 font-semibold">{profile.email || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                        <FaPhone className="text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Contact Number</p>
                                        <p className="text-gray-800 font-semibold">{profile.contactNumber || "Not provided"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                        <FaMapMarkerAlt className="text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="text-gray-800 font-semibold">{profile.address || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                            onClick={() => setShowEditForm(true)} 
                            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                        >
                            <FaUserEdit className="mr-3" />
                            Edit Profile
                        </button>
                        <button 
                            onClick={() => setShowPasswordForm(true)} 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                        >
                            <FaKey className="mr-3" />
                            Change Password
                        </button>
                        <button 
                            onClick={() => setShowDeleteModal(true)} 
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                        >
                            <FaTrash className="mr-3" />
                            Delete Account
                        </button>
                    </div>
                </>
            )}

            {showEditForm && (
                <div className="mt-6 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl shadow-md border border-teal-100">
                    <h3 className="text-2xl font-bold text-teal-600 mb-4 flex items-center">
                        <FaUserEdit className="mr-2" />
                        Edit Administrator Profile
                    </h3>
                    <div className="space-y-4">
                        <div className="relative">
                            <input 
                                type="text" 
                                name="name" 
                                value={profile.name} 
                                onChange={handleChange} 
                                placeholder="Full Name"
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm" 
                            />
                            <FaUserEdit className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                        <div className="relative">
                            <input 
                                type="email" 
                                name="email" 
                                value={profile.email} 
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
                                value={profile.contactNumber} 
                                onChange={handleChange} 
                                placeholder="Contact Number"
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm" 
                            />
                            <FaPhone className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                        <div className="relative">
                            <input 
                                type="text" 
                                name="address" 
                                value={profile.address} 
                                onChange={handleChange} 
                                placeholder="Address"
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm" 
                            />
                            <FaMapMarkerAlt className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    </div>
                    <div className="flex space-x-4 mt-6">
                        <button 
                            onClick={handleUpdateProfile} 
                            disabled={loading} 
                            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-70 flex items-center justify-center"
                        >
                            {loading ? "Updating..." : "Save Changes"}
                        </button>
                        <button 
                            onClick={() => setShowEditForm(false)} 
                            className="flex-1 bg-gray-500 text-white py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {showPasswordForm && (
                <div className="mt-6 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl shadow-md border border-teal-100">
                    <h3 className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
                        <FaKey className="mr-2" />
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
                            <FaKey className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                        <div className="relative">
                            <input 
                                type="password" 
                                placeholder="New Password" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm" 
                            />
                            <FaKey className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    </div>
                    <div className="flex space-x-4 mt-6">
                        <button 
                            onClick={handleChangePassword} 
                            disabled={loading} 
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-70 flex items-center justify-center"
                        >
                            {loading ? "Changing..." : "Update Password"}
                        </button>
                        <button 
                            onClick={() => setShowPasswordForm(false)} 
                            className="flex-1 bg-gray-500 text-white py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
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
                                <FaTrash className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-red-600 mb-2">Delete Administrator Account</h3>
                            <p className="text-gray-600">
                                This action will permanently delete your administrator account and all associated data. 
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <button 
                                onClick={handleDeleteAccount} 
                                disabled={loading} 
                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-md disabled:opacity-70 flex items-center justify-center"
                            >
                                {loading ? "Deleting..." : "Yes, Delete"}
                            </button>
                            <button 
                                onClick={() => setShowDeleteModal(false)} 
                                className="flex-1 bg-gray-500 text-white py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold shadow-md flex items-center justify-center"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
)};

export default AdminProfile;