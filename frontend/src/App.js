import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Outlet  } from 'react-router-dom';
import Header from './components/header';
import Footer from './components/footer';
import PaymentPage from '../src/pages/payment';
import Home from '../src/pages/home';
import AdminPayment from './pages/AdminPayment';
import PaymentInterface from './pages/paymentInterface'
import AddPatient from './pages/PatientManagement/AddPatient';
import QRScanner from './components/QRScanner';
import DisplayPatients from './pages/PatientManagement/DisplayPatients';
import MedicalRecordsList from './pages/MedicalRecords/MedicalRecordsList';
import AddMedicalRecord from './pages/MedicalRecords/AddMedicalRecord';
import UpdateMedicalRecord from './pages/MedicalRecords/UpdateMedicalRecord';
import ResultPage from './pages/ResultPage';
import CreateResults from './pages/CreateResults';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import Profile from './pages/Profile';
import AdminProfile from './pages/AdminProfile';
import UserManage from './pages/UserManage';
import DoctorRegistration from './pages/DoctorRegistration';
import ResultsPage from './pages/ResultsPage';
import BookAppointment from './pages/BookAppointment';
import DoctorDetails from './pages/DoctorDetails';
import MyAppointments from './pages/MyAppointments';
import AdminAppointments from './pages/AdminAppointments';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Routes with Header and Footer */}
          <Route element={<><Header /><Outlet /><Footer /></>}>
            <Route path="/" element={<Home />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/admin-payment" element={<AdminPayment />} />
            <Route path="/payment-interface" element={<PaymentInterface />} />
            <Route path="/add-patient" element={<AddPatient />} />
            <Route path="/qr-scanner" element={<QRScanner />} />
            <Route path="/display-patients" element={<DisplayPatients />} />
            <Route path="/medical-records/:patientId" element={<MedicalRecordsList />} />
            <Route path="/add-medical-record/:patientId" element={<AddMedicalRecord />} />
            <Route path="/medical-records/update/:recordId" element={<UpdateMedicalRecord />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/adminProfile" element={<AdminProfile />} />
            <Route path="/userManage" element={<UserManage />} />
            <Route path="/results/" element={<ResultsPage />} />
            <Route path="/results/create" element={<CreateResults />} />
            <Route path="/results/:resultId" element={<ResultPage />} />
            <Route path="/doctorRegister" element={<DoctorRegistration/>}/>
            <Route path="/bookAppointment" element={<BookAppointment/>}/>
            <Route path="/doctorDetails" element={<DoctorDetails/>}/>
            <Route path="/doctor/:id" element={<DoctorDetails/>}/>
            <Route path="/myAppointments" element={<MyAppointments/>}/>
            <Route path="/adminAppointments" element={<AdminAppointments/>}/>
          </Route>

          {/* Routes without Header and Footer */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
