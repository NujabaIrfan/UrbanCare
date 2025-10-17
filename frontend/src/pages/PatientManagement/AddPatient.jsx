import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

const { REACT_APP_API_URL } = process.env

function AddPatient() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    contact: "",
    medicalHistory: "",
    email: ""
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${REACT_APP_API_URL}/api/patients`);
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients: ", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${REACT_APP_API_URL}/api/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newPatient = await response.json();
        setMessage("Patient added successfully!");
        setFormData({
          name: "",
          age: "",
          gender: "Male",
          contact: "",
          medicalHistory: "",
        });
        fetchPatients();
      } else {
        setMessage("Error adding patient");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?"))
      return;

    try {
      const response = await fetch(`${REACT_APP_API_URL}/api/patients/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchPatients();
      }
    } catch (error) {
      console.error("Error deleting patient: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">

        <h4 className="font-bold mb-6 text-left">
          <Link to="/display-patients">Patients</Link>
        </h4>
        <h1 className="text-3xl font-bold mb-6 text-center">
          Patient Management
        </h1>

        {/* Add patient form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Add New Patient</h2>

          <form onSubmit={handelSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Medical History
              </label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? "Adding..." : "Add Patient"}
            </button>
          </form>

          {message && (
            <div className="{`mt-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}">
              {message}
            </div>
          )}
        </div>

        {/* patient list display */}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">All Patients</h2>

          {patients.length === 0 ? (
            <p className="text-gray-500">No patients found</p>
          ) : (
            <div className="grid gap-4">
              {patients.map((patient) => (
                <div
                  key={patient._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{patient.name}</h3>
                      <p className="text-sm text-gray-600">
                        Patient ID: {patient.patientId}
                      </p>
                      <p className="text-sm text-gray-600">
                        Age: {patient.age} | Gender: {patient.gender}
                      </p>
                      <p className="text-sm text-gray-600">
                        Contact: {patient.contact}
                      </p>

                      {patient.medicalHistory && (
                        <p className="text-sm text-gray-600 mt-1">
                          History: {patient.medicalHistory}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {patient.qrCode && (
                        <img
                          src={patient.qrCode}
                          alt="QR Code"
                          className="w-20 h-20"
                        />
                      )}
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 h-fit"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddPatient;
