import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Footer from './components/footer';
import PaymentPage from '../src/pages/payment';
import Home from '../src/pages/home';
import AdminPayment from './pages/AdminPayment';
import PaymentInterface from './pages/paymentInterface'
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
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;