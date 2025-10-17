import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { AuthContext } from '../context/authContext';

// Define dropdown menus for different user roles
const adminDropDownMenus = [
  { label: "Profile", path: "/adminProfile" },
  { label: "User Manage", path: "/userManage"},
  { label: "Doctor Registration", path: "/doctorRegister" },
  { label: "Payment Management", path: "/admin-payment" },
  { label: "Appointment Manage", path: "/adminAppointments"},
  { label: "Patient Management", path: "/display-patients"},
];

const userDropDownMenus = [
  { label: "Profile", path: "/profile" },
  { label: "Reports", path: "/results"},
  { label: "My Appointments", path: "/myAppointments"},
];

const doctorDropDownMenus = [];

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  
  // Access user and logout from AuthContext
  const { user, logout } = useContext(AuthContext);

  // Set dropdown menus based on the logged-in user's role
  let dropDownMenus = [];

  if (user) {
    if (user.role === 'admin') {
      dropDownMenus = adminDropDownMenus;
    } else if (user.role === 'doctor') {
      dropDownMenus = doctorDropDownMenus;
    } else if (user.role === 'customer') {
      dropDownMenus = userDropDownMenus;
    }
  }

  const handleProfileClick = () => {
    if (!user) {
      // Redirect to login page if not logged in
      navigate('/login');
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    setShowDropdown(false);
    navigate('/login');
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  return (
    <header className="bg-[#2c4f7c] rounded-t-lg px-6 py-4 flex items-center justify-between relative">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-green-500"></div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-2 bg-red-600"></div>
          </div>
          <Link to="/" className="text-white font-bold text-lg">Urban Care</Link>
        </div>
        <nav className="flex gap-6">
          <Link to="/" className="text-white text-sm hover:text-gray-200">Home</Link>
          <a href="/doctorDetails" className="text-white text-sm hover:text-gray-200">Channeling</a>
          <a href="#" className="text-white text-sm hover:text-gray-200">Programs</a>
          <Link to="/payment" className="text-white text-sm hover:text-gray-200">Payment</Link>
          <a href="#" className="text-white text-sm hover:text-gray-200">Support</a>
          <a href="#" className="text-white text-sm hover:text-gray-200">About</a>
          <Link to="/display-patients" className="text-white text-sm hover:text-gray-200">Patient Registration</Link>
        </nav>
      </div>
      
      {/* Profile Icon */}
      <div className="relative">
        <button 
          onClick={handleProfileClick}
          className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
        >
          <User className="w-5 h-5 text-gray-700" />
        </button>
        
        {/* Dropdown Menu for logged-in users */}
        {user && showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
            {/* User info */}
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800">
                {user.name || user.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role}
              </p>
            </div>
            
            {/* Dropdown menu items */}
            <ul className="py-1">
              {dropDownMenus.map((menu, index) => (
                <li key={index}>
                  <Link 
                    to={menu.path} 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeDropdown}
                  >
                    {menu.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Logout button */}
            <div className="border-t border-gray-100 pt-1">
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={closeDropdown}
        />
      )}
    </header>
  );
};

export default Header;