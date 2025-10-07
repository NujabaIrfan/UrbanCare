import React from 'react';

const Body = ({ onSubmit }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    // Form data handling logic would go here
    if (onSubmit) {
      onSubmit({
        // Form data object
      });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6 bg-white p-6 min-h-screen">
      {/* Left Panel */}
      <div className="border border-gray-300 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-6">Select Bill Details</h2>
        
        <div className="space-y-4 mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="billType" defaultChecked className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Doctor Scheduling</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="billType" className="w-4 h-4" />
            <span className="font-medium">Medicine</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="billType" className="w-4 h-4" />
            <span className="font-medium">Lab Reports</span>
          </label>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Enter Receipt Number</h3>
          <input 
            type="text" 
            placeholder="Enter Receipt Number" 
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <h3 className="font-semibold mb-2">Bill Information</h3>
          <div className="bg-gray-100 rounded h-64"></div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="border border-gray-300 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-6">Select Payment Details</h2>
        
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="paymentMethod" className="w-4 h-4" />
            <span>Online Banking</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="paymentMethod" defaultChecked className="w-4 h-4 text-blue-600" />
            <span>Credit/Debit Card</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="paymentMethod" className="w-4 h-4" />
            <span>PayPal</span>
          </label>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Card Payment Details</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Cardholder Name</label>
            <input 
              type="text" 
              placeholder="Enter cardholder name" 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Card Number</label>
            <input 
              type="text" 
              placeholder="1234 5678 9012 3456" 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input 
                type="text" 
                placeholder="MM/YY" 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CVV</label>
              <input 
                type="text" 
                placeholder="123" 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
              />
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg mt-2"
          >
            Confirm Card Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Body;