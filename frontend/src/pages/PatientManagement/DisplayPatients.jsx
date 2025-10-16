import React, { useEffect, useState } from "react";
import axios from "axios";
import { data, Link } from "react-router-dom";

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
    <div>
      <h1 className="text-3xl">Patient Details</h1>
      <Link to="/add-patient">
      <button
        className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-900 h-fit"
      >
        Add Patient
      </button>
      
      </Link>

      <h4 className="font-bold mb-6 text-left">
                <Link to="/qr-scanner">Scan QR Code</Link>
              </h4>

      {/* patients table */}
      <div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Patient ID</th>
              <th>Age</th>
              <th>Gender</th>
              <th>QR Code</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {patients &&
              patients.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.name}</td>
                  <td>{patient.patientId}</td>
                  <td>{patient.age}</td>
                  <td>{patient.gender}</td>
                  <td>
                    {patient.qrCode && (
                      <img
                        src={patient.qrCode}
                        alt="QR Code"
                        className="w-20 h-20"
                      />
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => deleteHandler(patient._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 h-fit"
                    >
                      Delete
                    </button>
                    <Link to={`/medical-records/${patient._id}`}>
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 h-fit ml-3"
                    >
                      Medical Records
                    </button>
                    </Link>
                    <Link to={`/results/create`} state={{ email: patient.email }} >
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 h-fit ml-3"
                    >
                      Add Report
                    </button>
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DisplayPatients;
