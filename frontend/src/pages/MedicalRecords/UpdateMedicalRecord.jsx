// UpdateMedicalRecord.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function UpdateMedicalRecord() {
  const navigate = useNavigate();
  const { recordId } = useParams(); // Get recordId from URL params
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentDate: '',
    department: '',
    doctor: '',
    diagnoses: '',
    comments: ''
  });
  const [selectedPatient, setSelectedPatient] = useState(null); // For displaying patient details
  const [backPath, setBackPath] = useState('/medical-records'); // Default back path
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (recordId) {
      fetchRecord(recordId);
    }
  }, [recordId]);

  const fetchRecord = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/medical-records/${id}`);
      const record = response.data;
      setFormData({
        patientId: record.patientId._id || record.patientId,
        appointmentDate: record.appointmentDate ? record.appointmentDate.split('T')[0] : '', // Format date
        department: record.department || '',
        doctor: record.doctor || '',
        diagnoses: record.diagnoses || '',
        comments: record.comments || ''
      });
      setSelectedPatient(record.patientId);
      // Set back path based on patient
      setBackPath(record.patientId?._id ? `/medical-records/${record.patientId._id}` : '/medical-records');
    } catch (error) {
      console.error('Error fetching record:', error);
      setMessage('Error: Record not found.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'patientId' && e.target.value) {
      fetchPatientDetails(e.target.value);
    }
  };

  const fetchPatientDetails = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/patients/${id}`);
      setSelectedPatient(response.data);
      setBackPath(`/medical-records/${id}`);
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.put(`http://localhost:5000/api/medical-records/${recordId}`, formData);

      if (response.status === 200) {
        setMessage('Medical record updated successfully!');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate(backPath);
        }, 2000);
      }
    } catch (error) {
      setMessage('Error: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to={backPath}>
            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              ← Back to Medical Records
            </button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">Update Medical Record</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Patient <span className="text-red-500">*</span>
              </label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a patient</option>
                <option value={selectedPatient?._id}>{selectedPatient?.name} - {selectedPatient?.patientId} (Age: {selectedPatient?.age})</option>
              </select>
              {selectedPatient && (
                <p className="text-sm text-gray-600 mt-1">
                  Current: {selectedPatient.name} - {selectedPatient.patientId} (Age: {selectedPatient.age})
                </p>
              )}
            </div>

            {/* Appointment Date */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Appointment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select department</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Surgery">Surgery</option>
                <option value="Dermatology">Dermatology</option>
                <option value="ENT">ENT</option>
                <option value="Ophthalmology">Ophthalmology</option>
                <option value="Psychiatry">Psychiatry</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Doctor */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Doctor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                required
                placeholder="Dr. John Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Diagnoses */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Diagnoses
              </label>
              <textarea
                name="diagnoses"
                value={formData.diagnoses}
                onChange={handleChange}
                rows="3"
                placeholder="Enter diagnosis details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Comments
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows="4"
                placeholder="Additional notes, treatment plans, or recommendations..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? 'Updating...' : 'Update Medical Record'}
            </button>
          </form>

          {/* Success, error Message */}
          {message && (
            <div
              className={`mt-4 p-3 rounded ${
                message.includes('success')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpdateMedicalRecord;