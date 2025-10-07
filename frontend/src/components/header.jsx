import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-[#2c4f7c] rounded-t-lg px-6 py-4 flex items-center justify-between">
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
          <a href="#" className="text-white text-sm hover:text-gray-200">Channeling</a>
          <a href="#" className="text-white text-sm hover:text-gray-200">Programs</a>
          <Link to="/payment" className="text-white text-sm hover:text-gray-200">Payment</Link>
          <a href="#" className="text-white text-sm hover:text-gray-200">Support</a>
          <a href="#" className="text-white text-sm hover:text-gray-200">About</a>
        </nav>
      </div>
      <div className="flex items-center bg-white rounded-full px-4 py-2 gap-2">
        <input 
          type="text" 
          placeholder="Search here ..." 
          className="outline-none text-sm w-48"
        />
        <button className="bg-gray-800 rounded-full p-1.5">
          <Search className="w-4 h-4 text-white" />
        </button>
      </div>
    </header>
  );
};

export default Header;