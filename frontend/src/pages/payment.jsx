import React, { useEffect, useState } from "react";

const UserBills = () => {
  const userId = "4567890"; // Replace with dynamic user ID from login/session
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchBills = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/receipts/patient/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bills');
      }
      
      const data = await response.json();
      setBills(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setBills([]);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handlePayNow = (bill, event) => {
    if (event) {
      event.stopPropagation();
    }

    if (bill.status === "Paid") {
        alert(`Bill ${bill.receiptNo} is already paid.`);
        return;
    }

    window.location.href = `/payment-interface?billId=${bill._id}&amount=${bill.total}&receiptNo=${bill.receiptNo}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">My Bills</h2>
          <p className="text-gray-600">View and manage your medical bills</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-12">No bills found.</p>
          ) : (
            bills.map((bill) => (
              <div
                key={bill._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
                onClick={() => setSelectedBill(bill)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{bill.patientName}</h3>
                      <p className="text-sm text-gray-500 mt-1">#{bill.receiptNo}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        bill.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {bill.status}
                    </span>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-gray-900">Rs. {bill.total.toFixed(2)}</p>
                  </div>

                  <button
                    onClick={(e) => handlePayNow(bill, e)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for Bill Details */}
      {selectedBill && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <button
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center"
                onClick={() => setSelectedBill(null)}
              >
                ×
              </button>
              <h3 className="text-2xl font-bold text-gray-900">Bill Details</h3>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Patient Name</span>
                  <span className="font-semibold text-gray-900">{selectedBill.patientName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Receipt Number</span>
                  <span className="font-semibold text-gray-900">{selectedBill.receiptNo}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedBill.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedBill.status}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="font-semibold text-gray-900 mb-3">Services</p>
                  <div className="space-y-2">
                    {selectedBill.services && selectedBill.services.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-700">{s.name}</span>
                        <span className="font-semibold text-gray-900">Rs. {s.cost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-gray-900">Rs. {selectedBill.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => handlePayNow(selectedBill, e)}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors duration-200 text-lg"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBills;