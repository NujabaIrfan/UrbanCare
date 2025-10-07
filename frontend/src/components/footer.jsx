import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#2c4f7c] rounded-b-lg px-6 py-6 grid grid-cols-3 gap-8">
      <div>
        <h3 className="text-white font-semibold mb-3">Urban Care Health Agency</h3>
        <ul className="space-y-2">
          <li><a href="#" className="text-gray-300 text-sm hover:text-white">Careers</a></li>
          <li><a href="#" className="text-gray-300 text-sm hover:text-white">News</a></li>
          <li><a href="#" className="text-gray-300 text-sm hover:text-white">Contact us</a></li>
          <li><a href="#" className="text-gray-300 text-sm hover:text-white">About us</a></li>
        </ul>
      </div>
      <div>
        <ul className="space-y-2 mt-8">
          <li><a href="#" className="text-gray-300 text-sm hover:text-white">National Health Program</a></li>
          <li><a href="#" className="text-gray-300 text-sm hover:text-white">National Clinical Service</a></li>
          <li><a href="#" className="text-gray-300 text-sm hover:text-white">Help For Digital Healthcare Providers</a></li>
        </ul>
      </div>
      <div>
        <h3 className="text-white font-semibold mb-3">Follow Us</h3>
        <div className="flex gap-2">
          <a href="#" className="bg-white p-2 rounded">
            <Facebook className="w-4 h-4 text-[#2c4f7c]" />
          </a>
          <a href="#" className="bg-white p-2 rounded">
            <Twitter className="w-4 h-4 text-[#2c4f7c]" />
          </a>
          <a href="#" className="bg-white p-2 rounded">
            <Instagram className="w-4 h-4 text-[#2c4f7c]" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;