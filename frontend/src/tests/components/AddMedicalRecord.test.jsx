import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import AddMedicalRecord from '../../pages/MedicalRecords/AddMedicalRecord'

// Mock axios
vi.mock('axios');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AddMedicalRecord Component', () => {
  const mockPatients = [
    {
      _id: 'patient1',
      name: 'John Doe',
      patientId: 'PAT-001',
      age: 35,
      gender: 'Male',
      contact: '+1234567890'
    },
    {
      _id: 'patient2',
      name: 'Jane Smith',
      patientId: 'PAT-002',
      age: 28,
      gender: 'Female',
      contact: '+0987654321'
    }
  ];

  const mockPatientDetails = {
    _id: 'patient1',
    name: 'John Doe',
    patientId: 'PAT-001',
    age: 35,
    gender: 'Male',
    contact: '+1234567890'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockReset();
    axios.post.mockReset();
  });

  const renderComponent = (route = '/add-medical-record') => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/add-medical-record" element={<AddMedicalRecord />} />
          <Route path="/add-medical-record/:patientId" element={<AddMedicalRecord />} />
        </Routes>
      </MemoryRouter>
    );
  };

  // Helper to get form fields robustly (since labels lack proper association)
  const getPatientSelect = () => {
    const patientSection = screen.getByText('Patient').closest('div');
    return within(patientSection).queryByRole('combobox');
  };

  const getDateInput = () => {
    const dateSection = screen.getByText('Appointment Date').closest('div');
    return dateSection.querySelector('input[type="date"]');
  };

  const getDepartmentSelect = () => {
    const deptSection = screen.getByText('Department').closest('div');
    return within(deptSection).queryByRole('combobox');
  };

  const getDoctorInput = () => screen.getByPlaceholderText('Dr. John Smith');

  const getDiagnosesTextarea = () => screen.getByPlaceholderText('Enter diagnosis details...');

  const getCommentsTextarea = () => screen.getByPlaceholderText('Additional notes, treatment plans, or recommendations...');

  describe('Component Rendering', () => {
    it('should render the form with all required fields', async () => {
      axios.get.mockResolvedValueOnce({ data: mockPatients });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Add Medical Record/i })).toBeInTheDocument();
      });

      expect(getPatientSelect()).toBeInTheDocument();
      expect(getDateInput()).toBeInTheDocument();
      expect(getDepartmentSelect()).toBeInTheDocument();
      expect(getDoctorInput()).toBeInTheDocument();
      expect(getDiagnosesTextarea()).toBeInTheDocument();
      expect(getCommentsTextarea()).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add Medical Record/i })).toBeInTheDocument();
    });

    it('should display back button with correct text', async () => {
      axios.get.mockResolvedValueOnce({ data: mockPatients });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Back to Medical Records/i })).toBeInTheDocument();
      });
    });
  });

  describe('Patient Selection', () => {
    it('should fetch and display patients in dropdown', async () => {
      axios.get.mockResolvedValueOnce({ data: mockPatients });

      renderComponent();

      await waitFor(() => {
        expect(getPatientSelect()).toBeInTheDocument();
      });

      const patientSelect = getPatientSelect();
      const options = within(patientSelect).getAllByRole('option');
      expect(options).toHaveLength(mockPatients.length + 1); // +1 for "Select a patient"
      expect(screen.getByText('John Doe - PAT-001 (Age: 35)')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith - PAT-002 (Age: 28)')).toBeInTheDocument();
    });

    it('should fetch patient details when patient is selected from dropdown', async () => {
      const user = userEvent.setup();
      
      axios.get.mockResolvedValueOnce({ data: mockPatients });
      axios.get.mockResolvedValueOnce({ data: mockPatientDetails });

      renderComponent();

      await waitFor(() => {
        expect(getPatientSelect()).toBeInTheDocument();
      });

      const patientSelect = getPatientSelect();
      await user.selectOptions(patientSelect, 'patient1');

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/patients/patient1');
        expect(screen.getByText(/Selected: John Doe - PAT-001 \(Age: 35\)/i)).toBeInTheDocument();
      });
    });

    it('should handle error when fetching patients fails', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      renderComponent();

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Error fetching patients:', expect.any(Error));
      });

      consoleError.mockRestore();
    });
  });

  describe('Pre-selected Patient (URL param)', () => {
    it('should display patient details when patientId is in URL', async () => {
      axios.get.mockResolvedValueOnce({ data: mockPatients });
      axios.get.mockResolvedValueOnce({ data: mockPatientDetails });

      renderComponent('/add-medical-record/patient1');

      await waitFor(() => {
        expect(screen.getByText(/Add Medical Record for John Doe/i)).toBeInTheDocument();
        expect(screen.getByText(/John Doe - PAT-001 \(Age: 35\)/i)).toBeInTheDocument();
      });

      // Should not show dropdown, instead show read-only display
      expect(getPatientSelect()).not.toBeInTheDocument();
    });

    it('should show error message when patient not found', async () => {
      axios.get.mockResolvedValueOnce({ data: mockPatients });
      axios.get.mockRejectedValueOnce(new Error('Not found'));

      renderComponent('/add-medical-record/invalid-id');

      await waitFor(() => {
        expect(screen.getByText(/Error: Patient not found/i)).toBeInTheDocument();
      });
    });

    it('should show correct back button text for pre-selected patient', async () => {
      axios.get.mockResolvedValueOnce({ data: mockPatients });
      axios.get.mockResolvedValueOnce({ data: mockPatientDetails });

      renderComponent('/add-medical-record/patient1');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Back to Patient Records/i })).toBeInTheDocument();
      });
    });
  });

  describe('Form Input Handling', () => {
    it('should update form fields when user types', async () => {
      const user = userEvent.setup();
      
      axios.get.mockResolvedValueOnce({ data: mockPatients });

      renderComponent();

      await waitFor(() => {
        expect(getDoctorInput()).toBeInTheDocument();
      });

      const doctorInput = getDoctorInput();
      const diagnosesInput = getDiagnosesTextarea();
      const commentsInput = getCommentsTextarea();

      await user.type(doctorInput, 'Dr. Smith');
      await user.type(diagnosesInput, 'Hypertension');
      await user.type(commentsInput, 'Follow-up required');

      expect(doctorInput).toHaveValue('Dr. Smith');
      expect(diagnosesInput).toHaveValue('Hypertension');
      expect(commentsInput).toHaveValue('Follow-up required');
    });

    it('should update department when selected', async () => {
      const user = userEvent.setup();
      
      axios.get.mockResolvedValueOnce({ data: mockPatients });

      renderComponent();

      await waitFor(() => {
        expect(getDepartmentSelect()).toBeInTheDocument();
      });

      const departmentSelect = getDepartmentSelect();
      await user.selectOptions(departmentSelect, 'Cardiology');

      expect(departmentSelect).toHaveValue('Cardiology');
    });

    it('should update appointment date when selected', async () => {
      const user = userEvent.setup();
      
      axios.get.mockResolvedValueOnce({ data: mockPatients });

      renderComponent();

      await waitFor(() => {
        expect(getDateInput()).toBeInTheDocument();
      });

      const dateInput = getDateInput();
      await user.type(dateInput, '2024-01-15');

      expect(dateInput).toHaveValue('2024-01-15');
    });
  });

  describe('Form Submission', () => {
    const validFormData = {
      patientId: 'patient1',
      appointmentDate: '2024-01-15',
      department: 'Cardiology',
      doctor: 'Dr. Smith',
      diagnoses: 'Hypertension',
      comments: 'Follow-up in 2 weeks'
    };

    it('should submit form successfully with valid data', async () => {
      const user = userEvent.setup();
      
      axios.get.mockResolvedValueOnce({ data: mockPatients });
      axios.get.mockResolvedValueOnce({ data: mockPatientDetails });
      axios.post.mockResolvedValueOnce({ 
        status: 201, 
        data: { _id: 'record123', ...validFormData } 
      });

      renderComponent();

      await waitFor(() => {
        expect(getPatientSelect()).toBeInTheDocument();
      });

      // Fill in the form
      const patientSelect = getPatientSelect();
      await user.selectOptions(patientSelect, 'patient1');

      const dateInput = getDateInput();
      await user.type(dateInput, '2024-01-15');

      const departmentSelect = getDepartmentSelect();
      await user.selectOptions(departmentSelect, 'Cardiology');

      const doctorInput = getDoctorInput();
      await user.type(doctorInput, 'Dr. Smith');

      const diagnosesInput = getDiagnosesTextarea();
      await user.type(diagnosesInput, 'Hypertension');

      const commentsInput = getCommentsTextarea();
      await user.type(commentsInput, 'Follow-up in 2 weeks');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Add Medical Record/i });
      await user.click(submitButton);

      // Check API call
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:5000/api/medical-records',
          expect.objectContaining({
            patientId: 'patient1',
            department: 'Cardiology',
            doctor: 'Dr. Smith'
          })
        );
      });

      // Check success message
      await waitFor(() => {
        expect(screen.getByText(/Medical record added successfully!/i)).toBeInTheDocument();
      }, { timeout: 2000 });

      // Check navigation after timeout
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/medical-records');
      }, { timeout: 3000 });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      
      axios.get.mockResolvedValueOnce({ data: mockPatients });
      axios.get.mockResolvedValueOnce({ data: mockPatientDetails });
      
      // Delay the post response
      axios.post.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ status: 201, data: {} }), 100))
      );

      renderComponent();

      await waitFor(() => {
        expect(getPatientSelect()).toBeInTheDocument();
      });

      // Fill required fields
      const patientSelect = getPatientSelect();
      await user.selectOptions(patientSelect, 'patient1');

      const dateInput = getDateInput();
      await user.type(dateInput, '2024-01-15');

      const departmentSelect = getDepartmentSelect();
      await user.selectOptions(departmentSelect, 'Cardiology');

      const doctorInput = getDoctorInput();
      await user.type(doctorInput, 'Dr. Smith');

      const submitButton = screen.getByRole('button', { name: /Add Medical Record/i });
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByRole('button', { name: /Adding.../i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Adding.../i })).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Medical Record/i })).toBeInTheDocument();
      });
    });

    it('should display error message on submission failure', async () => {
      const user = userEvent.setup();
      
      axios.get.mockResolvedValueOnce({ data: mockPatients });
      axios.get.mockResolvedValueOnce({ data: mockPatientDetails });
      axios.post.mockRejectedValueOnce({
        response: { data: { message: 'Validation failed' } }
      });

      renderComponent();

      await waitFor(() => {
        expect(getPatientSelect()).toBeInTheDocument();
      });

      // Fill and submit form
      const patientSelect = getPatientSelect();
      await user.selectOptions(patientSelect, 'patient1');

      const dateInput = getDateInput();
      await user.type(dateInput, '2024-01-15');

      const departmentSelect = getDepartmentSelect();
      await user.selectOptions(departmentSelect, 'Cardiology');

      const doctorInput = getDoctorInput();
      await user.type(doctorInput, 'Dr. Smith');

      const submitButton = screen.getByRole('button', { name: /Add Medical Record/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Error: Validation failed/i)).toBeInTheDocument();
      });
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      
      axios.get.mockResolvedValueOnce({ data: mockPatients });
      axios.get.mockResolvedValueOnce({ data: mockPatientDetails });
      axios.post.mockResolvedValueOnce({ status: 201, data: {} });

      renderComponent();

      await waitFor(() => {
        expect(getPatientSelect()).toBeInTheDocument();
      });

      // Fill required fields to allow submission
      const patientSelect = getPatientSelect();
      await user.selectOptions(patientSelect, 'patient1');

      const dateInput = getDateInput();
      await user.type(dateInput, '2024-01-15');

      const departmentSelect = getDepartmentSelect();
      await user.selectOptions(departmentSelect, 'Cardiology');

      const doctorInput = getDoctorInput();
      await user.type(doctorInput, 'Dr. Smith');

      const submitButton = screen.getByRole('button', { name: /Add Medical Record/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Medical record added successfully!/i)).toBeInTheDocument();
      }, { timeout: 2000 });

      // Check form is reset (doctor field should be empty)
      await waitFor(() => {
        expect(getDoctorInput()).toHaveValue('');
      });
    });

    it('should navigate to patient records when submitted with patientId param', async () => {
      const user = userEvent.setup();
      
      axios.get.mockResolvedValueOnce({ data: mockPatients });
      axios.get.mockResolvedValueOnce({ data: mockPatientDetails });
      axios.post.mockResolvedValueOnce({ status: 201, data: {} });

      renderComponent('/add-medical-record/patient1');

      await waitFor(() => {
        expect(getDoctorInput()).toBeInTheDocument();
      });

      // Fill required fields
      const dateInput = getDateInput();
      await user.type(dateInput, '2024-01-15');

      const departmentSelect = getDepartmentSelect();
      await user.selectOptions(departmentSelect, 'Cardiology');

      const doctorInput = getDoctorInput();
      await user.type(doctorInput, 'Dr. Smith');

      const submitButton = screen.getByRole('button', { name: /Add Medical Record/i });
      await user.click(submitButton);

      // Check success message (ensures submission completed before timeout)
      await waitFor(() => {
        expect(screen.getByText(/Medical record added successfully!/i)).toBeInTheDocument();
      }, { timeout: 2000 });

      // Check navigation after timeout
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/medical-records/patient1');
      }, { timeout: 3000 });
    });
  });

  describe('Department Options', () => {
    it('should display all department options', async () => {
      axios.get.mockResolvedValueOnce({ data: mockPatients });

      renderComponent();

      await waitFor(() => {
        expect(getDepartmentSelect()).toBeInTheDocument();
      });

      const departmentSelect = getDepartmentSelect();
      const departments = [
        'Cardiology',
        'Neurology',
        'Orthopedics',
        'Pediatrics',
        'General Medicine',
        'Surgery',
        'Dermatology',
        'ENT',
        'Ophthalmology',
        'Psychiatry',
        'Other'
      ];

      departments.forEach(dept => {
        expect(within(departmentSelect).getByRole('option', { name: dept })).toBeInTheDocument();
      });
    });
  });
});