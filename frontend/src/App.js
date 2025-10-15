import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Footer from './components/footer';
import PaymentPage from '../src/pages/payment';
import Home from '../src/pages/home';
import AdminPayment from './pages/AdminPayment';
import PaymentInterface from './pages/paymentInterface'
import AddPatient from './pages/PatientManagement/AddPatient';
import QRScanner from './components/QRScanner';
import DisplayPatients from './pages/PatientManagement/DisplayPatients';
function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/admin-payment" element={<AdminPayment />} />
          <Route path="/payment-interface" element={<PaymentInterface />} />
          <Route path="/add-patient" element={<AddPatient />} />
          <Route path="/qr-scanner" element={<QRScanner />} />
          <Route path="/display-patients" element={<DisplayPatients />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;