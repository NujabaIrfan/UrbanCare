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

      // Fetch patient details
      const patientResponse = await axios.get(
        `http://localhost:5000/api/patients/${patientId}`
      );
      setPatient(patientResponse.data);

      // Fetch medical records for this patient
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
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link to="/display-patients">
            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              ← Back to Patients
            </button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">All Medical Records</h1>
        <Link to={`/add-medical-record/${patientId}`}>
          <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900">
            Add new record
          </button>
        </Link>

        <p>Patient name: {patient.name}</p>
        <p>Patient ID: {patient.patientId}</p>
        {/* medical records table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {records.length === 0 ? (
            <p className="text-gray-500">No medical records found.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {/* <th className="text-left p-3">Patient Name</th>
                  <th className="text-left p-3">Patient ID</th> */}
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-left p-3">Doctor</th>
                  <th className="text-left p-3">Diagnoses</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => {
                  return (
                    <tr key={record._id} className="border-b hover:bg-gray-50">
                      {/* <td className="p-3">{record.patientId?.name || 'N/A'}</td>
                    <td className="p-3">{record.patientId?.patientId || 'N/A'}</td> */}
                      <td className="p-3 text-left">
                        {new Date(record.appointmentDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-left">{record.department}</td>
                      <td className="p-3 text-left">{record.doctor}</td>
                      <td className="p-3 text-left">
                        {record.diagnoses || "N/A"}
                      </td>
                      <td className="p-3 text-left">
                        <Link
                          to={`/medical-records/update/${record._id}`}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteRecord(record._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default MedicalRecordsList;
