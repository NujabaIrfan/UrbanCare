import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function AddMedicalRecord() {
  const navigate = useNavigate();
  const { patientId } = useParams(); 
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null); 
  const [formData, setFormData] = useState({
    patientId: patientId || '', 
    appointmentDate: '',
    department: '',
    doctor: '',
    diagnoses: '',
    comments: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPatients();
    if (patientId) {
      
      fetchPatientDetails(patientId);
      setFormData(prev => ({ ...prev, patientId })); 
    }
  }, [patientId]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchPatientDetails = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/patients/${id}`);
      setSelectedPatient(response.data);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setMessage('Error: Patient not found.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/medical-records', formData);

      if (response.status === 201) {
        setMessage('Medical record added successfully!');
        setFormData({
          patientId: patientId || '',
          appointmentDate: '',
          department: '',
          doctor: '',
          diagnoses: '',
          comments: ''
        });
        
        // redirect to patient's records if patientId provided, else all records
        const redirectPath = patientId ? `/medical-records/${patientId}` : '/medical-records';
        setTimeout(() => {
          navigate(redirectPath);
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
          <Link to={patientId ? `/medical-records/${patientId}` : '/medical-records'}>
            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              ← Back to {patientId ? 'Patient Records' : 'Medical Records'}
            </button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">
          {patientId ? `Add Medical Record for ${selectedPatient?.name || 'Patient'}` : 'Add Medical Record'}
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
           
            {patientId ? (
              // Read-only
              <div className="bg-gray-50 p-3 rounded-md">
                <label className="block text-sm font-medium mb-1">Patient</label>
                <p className="text-lg font-semibold">{selectedPatient?.name} - {selectedPatient?.patientId} (Age: {selectedPatient?.age})</p>
                <input type="hidden" name="patientId" value={patientId} />
              </div>
            ) : (
              
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
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} - {patient.patientId} (Age: {patient.age})
                    </option>
                  ))}
                </select>
                {selectedPatient && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {selectedPatient.name} - {selectedPatient.patientId} (Age: {selectedPatient.age})
                  </p>
                )}
              </div>
            )}

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
                max={new Date().toISOString().split('T')[0]}
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

            {/* Submit  */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add Medical Record'}
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

export default AddMedicalRecord;