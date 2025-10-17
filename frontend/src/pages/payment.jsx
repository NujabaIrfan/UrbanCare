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
    <div 
      className="min-h-screen text-white relative flex flex-col items-center p-6"
      style={{
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      }}
    >
      <div className="max-w-7xl w-full relative z-10">
        <h2 className="text-4xl font-bold text-center my-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
          My Bills
        </h2>
        <p className="text-center text-gray-200 mb-8">View and manage your medical bills</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-white text-lg">No bills found.</p>
            </div>
          ) : (
            bills.map((bill) => (
              <div
                key={bill._id}
                className="bg-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden border-2 border-teal-100 cursor-pointer transform hover:scale-105"
                onClick={() => setSelectedBill(bill)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{bill.patientName}</h3>
                        <p className="text-sm text-gray-500 mt-1">#{bill.receiptNo}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        bill.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {bill.status}
                    </span>
                  </div>

                  {/* Services Breakdown */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Services</p>
                    </div>
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto border border-teal-100">
                      {bill.services && bill.services.length > 0 ? (
                        bill.services.map((service, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 truncate pr-2 flex items-center">
                              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2"></span>
                              {service.name}
                            </span>
                            <span className="font-semibold text-gray-900 whitespace-nowrap">Rs. {service.cost.toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center">No services listed</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl p-4 mb-4 shadow-md">
                    <p className="text-sm text-white text-opacity-90 mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-white">Rs. {bill.total.toFixed(2)}</p>
                  </div>

                  <button
                    onClick={(e) => handlePayNow(bill, e)}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto border-2 border-teal-200">
            <div className="sticky top-0 bg-gradient-to-r from-teal-50 to-blue-50 border-b-2 border-teal-200 p-6 rounded-t-2xl">
              <button
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                onClick={() => setSelectedBill(null)}
              >
                ×
              </button>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Bill Details</h3>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg">
                  <span className="text-gray-600 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Patient Name
                  </span>
                  <span className="font-semibold text-gray-900">{selectedBill.patientName}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg">
                  <span className="text-gray-600 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    Receipt Number
                  </span>
                  <span className="font-semibold text-gray-900">{selectedBill.receiptNo}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg">
                  <span className="text-gray-600 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Status
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
                      selectedBill.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedBill.status}
                  </span>
                </div>

                <div className="border-t-2 border-teal-100 pt-4 mt-4">
                  <p className="font-semibold text-gray-900 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Services Breakdown
                  </p>
                  <div className="space-y-2">
                    {selectedBill.services && selectedBill.services.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gradient-to-r from-teal-50 to-blue-50 p-3 rounded-lg border border-teal-100">
                        <span className="text-gray-700 flex items-center">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                          {s.name}
                        </span>
                        <span className="font-semibold text-gray-900">Rs. {s.cost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl p-4 mt-4 shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold text-lg">Total Amount</span>
                    <span className="text-3xl font-bold text-white">Rs. {selectedBill.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => handlePayNow(selectedBill, e)}
                className="mt-6 w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 text-lg shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
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