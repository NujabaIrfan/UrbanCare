import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const URL = "http://localhost:5000/api/patients";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function DisplayPatients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchHandler().then((data) => setPatients(data));
  }, []);

  const deleteHandler = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this patient?"
    );
    if (confirmDelete) {
      await axios
        .delete(`http://localhost:5000/api/patients/${id}`)
        .then(() =>
          setPatients(patients.filter((patient) => patient._id !== id))
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Patient Details</h1>
          
          {/* Navigation Buttons */}
          <div className="flex gap-3 mb-4">
            <Link to="/add-patient">
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 font-medium">
                Add Patient
              </button>
            </Link>
            
            <Link to="/qr-scanner">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 font-medium">
                Scan QR Code
              </button>
            </Link>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients && patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {patient.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {patient.patientId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {patient.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {patient.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {patient.qrCode && (
                          <img
                            src={patient.qrCode}
                            alt="QR Code"
                            className="w-20 h-20 object-contain"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteHandler(patient._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200 text-sm font-medium"
                          >
                            Delete
                          </button>
                          <Link to={`/medical-records/${patient._id}`}>
                            <button className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition duration-200 text-sm font-medium">
                              Medical Records
                            </button>
                          </Link>
                          <Link to={`/results/create`} state={{ email: patient.email }}>
                            <button className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition duration-200 text-sm font-medium">
                              Add Report
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisplayPatients;