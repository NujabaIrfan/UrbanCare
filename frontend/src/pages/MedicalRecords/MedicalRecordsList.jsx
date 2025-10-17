import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function MedicalRecordsList() {
  const { patientId } = useParams();
  const [records, setRecords] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (patientId) {
      fetchPatientRecords();
    } else {
      fetchAllRecords();
    }
  }, [patientId]);

  const fetchPatientRecords = async () => {
    try {
      setLoading(true);
      const patientResponse = await axios.get(
        `http://localhost:5000/api/patients/${patientId}`
      );
      setPatient(patientResponse.data);
      const recordsResponse = await axios.get(
        `http://localhost:5000/api/medical-records/patients/${patientId}`
      );
      setRecords(recordsResponse.data);
      setLoading(false);
    } catch (error) {
      setError("Error fetching records: " + error.message);
      setLoading(false);
    }
  };

  const fetchAllRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/medical-records"
      );
      setRecords(response.data);
      setLoading(false);
    } catch (error) {
      setError("Error fetching records: " + error.message);
      setLoading(false);
    }
  };

  const deleteRecord = async (recordId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this record?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(
          `http://localhost:5000/api/medical-records/${recordId}`
        );
        setRecords(records.filter((record) => record._id !== recordId));
      } catch (err) {
        alert("Error deleting record: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <div className="mb-6">
          <Link to="/display-patients">
            <button className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200 font-medium">
              ← Back to Patients
            </button>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Medical Records</h1>
          
          {patient && (
            <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-lg font-semibold text-gray-800">
                Patient: <span className="text-blue-600">{patient.name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Patient ID: <span className="font-medium">{patient.patientId}</span>
              </p>
            </div>
          )}

          <Link to={`/add-medical-record/${patientId}`}>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 font-medium">
              + Add New Record
            </button>
          </Link>
        </div>

        {/* Medical record list */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {records.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-lg">No medical records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Diagnoses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.appointmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.doctor}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.diagnoses || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Link
                            to={`/medical-records/update/${record._id}`}
                            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition duration-200 inline-block font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteRecord(record._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MedicalRecordsList;