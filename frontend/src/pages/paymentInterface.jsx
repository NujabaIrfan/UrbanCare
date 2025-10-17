// frontend/src/PaymentPage.jsx
import React, { useState, useEffect } from "react";
import { CreditCard, Shield, Building2, User, FileText, Calendar, Clock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Replace with your Stripe publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const { REACT_APP_API_URL } = process.env

// Stripe Card Payment Component
const StripeCardForm = ({ billDetails, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`${REACT_APP_API_URL}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: billDetails.amount,
          billId: billDetails.billId,
          receiptNo: billDetails.receiptNo
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await response.json();

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: cardholderName,
          },
        }
      });

      if (error) {
        onError(error.message);
        setProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        const confirmResponse = await fetch(`${REACT_APP_API_URL}/api/payments/confirm-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            billId: billDetails.billId
          })
        });

        if (!confirmResponse.ok) {
          throw new Error('Failed to confirm payment');
        }

        const result = await confirmResponse.json();
        
        if (result.success) {
          onSuccess();
        } else {
          onError(result.message || 'Payment confirmation failed');
        }
      }
    } catch (err) {
      onError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <input 
          type="text" 
          placeholder="Cardholder Name" 
          value={cardholderName} 
          onChange={(e) => setCardholderName(e.target.value)} 
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm" 
          required
        />
        <User className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Card Details
        </label>
        <div className="px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 transition-all duration-300">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!stripe || processing || !cardholderName}
        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
          !stripe || processing || !cardholderName
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
        }`}
      >
        {processing ? (
          <span className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Processing Payment...
          </span>
        ) : (
          `Pay Rs. ${billDetails.amount.toFixed(2)}`
        )}
      </button>
    </div>
  );
};

// Main Payment Page Component
const PaymentPage = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showBillId, setShowBillId] = useState(false);
  const [billDetails, setBillDetails] = useState({
    billId: "",
    amount: 0,
    receiptNo: "",
    patientId: "",
    patientName: "",
    services: [],
    createdAt: "",
    status: "Pending"
  });

  // Insurance claim state
  const [insuranceData, setInsuranceData] = useState({
    insuranceProvider: '',
    policyNumber: '',
    claimantName: '',
    claimantId: ''
  });

  // Government funding state
  const [governmentData, setGovernmentData] = useState({
    programType: '',
    beneficiaryId: '',
    beneficiaryName: '',
    referenceNumber: ''
  });

  useEffect(() => {
    const fetchBillDetails = async () => {
      const params = new URLSearchParams(window.location.search);
      const billId = params.get('billId');
      
      if (billId) {
        try {
          const response = await fetch(`${REACT_APP_API_URL}/api/receipts/${billId}`);
          if (response.ok) {
            const receiptData = await response.json();
            setBillDetails({
              billId: receiptData._id,
              amount: receiptData.total,
              receiptNo: receiptData.receiptNo,
              patientId: receiptData.patientId,
              patientName: receiptData.patientName,
              services: receiptData.services || [],
              createdAt: receiptData.createdAt,
              status: receiptData.status
            });
          } else {
            setBillDetails({
              billId: billId,
              amount: parseFloat(params.get('amount')) || 0,
              receiptNo: params.get('receiptNo') || "",
              patientId: params.get('patientId') || "",
              patientName: params.get('patientName') || "Patient Name",
              services: [],
              createdAt: new Date().toISOString(),
              status: "Pending"
            });
          }
        } catch (error) {
          console.error('Error fetching bill details:', error);
          setBillDetails({
            billId: billId,
            amount: parseFloat(params.get('amount')) || 0,
            receiptNo: params.get('receiptNo') || "",
            patientId: params.get('patientId') || "",
            patientName: params.get('patientName') || "Patient Name",
            services: [],
            createdAt: new Date().toISOString(),
            status: "Pending"
          });
        }
      }
    };

    fetchBillDetails();
  }, []);

  const handlePaymentSuccess = () => {
    alert('Payment successful!');
    window.location.href = '/payment';
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleInsuranceClaim = async () => {
    if (!insuranceData.insuranceProvider || !insuranceData.policyNumber || !insuranceData.claimantName || !insuranceData.claimantId) {
      setError('Please fill all required fields');
      return;
    }

    setProcessing(true);
    setError(null);

    const claimData = {
      billId: billDetails.billId,
      receiptNo: billDetails.receiptNo,
      amount: billDetails.amount,
      ...insuranceData
    };

    try {
      const response = await fetch(`${REACT_APP_API_URL}/api/insurance/insurance-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit insurance claim');
      }

      const result = await response.json();

      if (result.success) {
        alert('Insurance claim submitted successfully! You will be notified once approved.');
        window.location.href = '/payment';
      } else {
        setError(result.message || 'Failed to submit claim. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit claim. Please try again.');
    }
    
    setProcessing(false);
  };

  const handleGovernmentFunding = async () => {
    if (!governmentData.programType || !governmentData.beneficiaryId || !governmentData.beneficiaryName) {
      setError('Please fill all required fields');
      return;
    }

    setProcessing(true);
    setError(null);

    const fundingData = {
      billId: billDetails.billId,
      receiptNo: billDetails.receiptNo,
      amount: billDetails.amount,
      ...governmentData
    };

    try {
      const response = await fetch(`${REACT_APP_API_URL}/api/government/government-funding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fundingData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit funding request');
      }

      const result = await response.json();

      if (result.success) {
        alert('Government funding request submitted successfully!');
        window.location.href = '/payment';
      } else {
        setError(result.message || 'Failed to submit funding request. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit funding request. Please try again.');
    }
    
    setProcessing(false);
  };

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Secure payment via Stripe",
      color: "from-teal-500 to-teal-600",
      hoverColor: "hover:from-teal-600 hover:to-teal-700"
    },
    {
      id: "insurance",
      name: "Insurance Claim",
      icon: Shield,
      description: "Submit insurance claim",
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700"
    },
    {
      id: "government",
      name: "Government Funding",
      icon: Building2,
      description: "Apply for government assistance",
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700"
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="min-h-screen text-white relative flex flex-col items-center p-6"
      style={{
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      }}
    >
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => window.history.back()}
            className="text-teal-200 hover:text-white mb-4 flex items-center transition-colors duration-300"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Bills
          </button>
          <h2 className="text-4xl font-bold text-center my-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
            Complete Payment
          </h2>
          <p className="text-teal-100 text-center text-lg">Review your bill details and choose payment method</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Bill Details */}
          <div className="space-y-6">
            {/* Bill Summary Card */}
            <div className="bg-white shadow-2xl rounded-2xl p-8 border border-teal-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FileText className="mr-3 text-teal-500" size={28} />
                Bill Summary
              </h3>
              
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="mr-2 text-teal-500" size={20} />
                    Patient Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-teal-600 font-medium">Patient ID:</span>
                      <p className="font-semibold text-gray-800">{billDetails.patientId}</p>
                    </div>
                    <div>
                      <span className="text-teal-600 font-medium">Patient Name:</span>
                      <p className="font-semibold text-gray-800">{billDetails.patientName}</p>
                    </div>
                    <div>
                      <span className="text-teal-600 font-medium">Receipt No:</span>
                      <p className="font-semibold text-gray-800">{billDetails.receiptNo}</p>
                    </div>
                    <div>
                      <span className="text-teal-600 font-medium">Bill Status:</span>
                      <span className={`font-semibold ${
                        billDetails.status === 'Paid' ? 'text-green-600' : 
                        billDetails.status === 'Pending' ? 'text-yellow-600' : 
                        billDetails.status === 'Claim Pending' ? 'text-blue-600' :
                        billDetails.status === 'Funding Pending' ? 'text-purple-600' : 'text-red-600'
                      }`}>
                        {billDetails.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Date Information */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <Calendar className="mr-2 text-teal-500" size={20} />
                    Date Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-teal-600 font-medium">Date:</span>
                      <p className="font-semibold text-gray-800">{formatDate(billDetails.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-teal-600 font-medium">Time:</span>
                      <p className="font-semibold text-gray-800">{formatTime(billDetails.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Bill ID Section */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <FileText className="mr-2 text-teal-500" size={20} />
                      Bill Reference
                    </h4>
                    <button
                      onClick={() => setShowBillId(!showBillId)}
                      className="text-teal-600 hover:text-teal-800 text-sm flex items-center transition-colors duration-300"
                    >
                      {showBillId ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
                      {showBillId ? 'Hide' : 'Show'} Bill ID
                    </button>
                  </div>
                  {showBillId ? (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-mono break-all text-gray-700">{billDetails.billId}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-teal-600">Bill ID is hidden for security</p>
                  )}
                </div>

                {/* Services Breakdown */}
                <div className="border border-teal-100 rounded-xl overflow-hidden">
                  <h4 className="font-semibold text-gray-800 p-4 border-b border-teal-100 bg-gradient-to-r from-teal-50 to-blue-50">
                    Services Breakdown
                  </h4>
                  <div className="p-4">
                    {billDetails.services && billDetails.services.length > 0 ? (
                      <div className="space-y-4">
                        {billDetails.services.map((service, index) => (
                          <div key={index} className="flex justify-between items-center py-3 border-b border-teal-50 last:border-b-0">
                            <div>
                              <p className="font-semibold text-gray-800">{service.name || `Service ${index + 1}`}</p>
                              {service.description && (
                                <p className="text-sm text-teal-600 mt-1">{service.description}</p>
                              )}
                            </div>
                            <p className="font-bold text-gray-800">
                              Rs. {(service.cost || service.amount || 0).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-teal-600">
                        <Clock className="mx-auto mb-3 text-teal-400" size={32} />
                        <p>No service details available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-teal-100 text-sm">Total Amount Due</p>
                      <p className="text-3xl font-bold">Rs. {billDetails.amount.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-teal-100 text-sm">Reference</p>
                      <p className="font-semibold text-lg">{billDetails.receiptNo}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Payment Options */}
          <div className="space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-white shadow-2xl rounded-2xl p-8 border border-teal-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Select Payment Method</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.id}
                      onClick={() => {
                        setSelectedMethod(method.id);
                        setError(null);
                      }}
                      className={`cursor-pointer rounded-xl p-6 transition-all duration-300 border-2 ${
                        selectedMethod === method.id
                          ? "border-teal-500 bg-gradient-to-r from-teal-50 to-blue-50 shadow-lg scale-105"
                          : "border-gray-200 bg-white hover:border-teal-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mr-4 shadow-md`}>
                          <Icon className="text-white" size={28} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg mb-1">{method.name}</h4>
                          <p className="text-teal-600">{method.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm shadow-md">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">!</span>
                  </div>
                  {error}
                </div>
              </div>
            )}

            {/* Payment Forms */}
            {selectedMethod === "card" && (
              <div className="bg-white shadow-2xl rounded-2xl p-8 border border-teal-200">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <CreditCard className="mr-3 text-teal-500" size={28} />
                  Card Payment
                </h3>
                <Elements stripe={stripePromise}>
                  <StripeCardForm
                    billDetails={billDetails}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              </div>
            )}

            {selectedMethod === "insurance" && (
              <div className="bg-white shadow-2xl rounded-2xl p-8 border border-teal-200">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Shield className="mr-3 text-blue-500" size={28} />
                  Insurance Claim
                </h3>
                <div className="space-y-6">
                  <div className="relative">
                    <select 
                      value={insuranceData.insuranceProvider}
                      onChange={(e) => setInsuranceData({...insuranceData, insuranceProvider: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
                      required
                    >
                      <option value="">Select provider</option>
                      <option value="Sri Lanka Insurance">Sri Lanka Insurance</option>
                      <option value="Ceylinco Insurance">Ceylinco Insurance</option>
                      <option value="AIA Insurance">AIA Insurance</option>
                      <option value="Union Assurance">Union Assurance</option>
                      <option value="Other">Other</option>
                    </select>
                    <Building2 className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Policy Number"
                      value={insuranceData.policyNumber}
                      onChange={(e) => setInsuranceData({...insuranceData, policyNumber: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
                      required
                    />
                    <FileText className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Claimant Name"
                      value={insuranceData.claimantName}
                      onChange={(e) => setInsuranceData({...insuranceData, claimantName: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
                      required
                    />
                    <User className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="National ID / Passport"
                      value={insuranceData.claimantId}
                      onChange={(e) => setInsuranceData({...insuranceData, claimantId: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
                      required
                    />
                    <FileText className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>

                  <button
                    onClick={handleInsuranceClaim}
                    disabled={processing}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
                      processing
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    }`}
                  >
                    {processing ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Insurance Claim'
                    )}
                  </button>
                </div>
              </div>
            )}

            {selectedMethod === "government" && (
              <div className="bg-white shadow-2xl rounded-2xl p-8 border border-teal-200">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Building2 className="mr-3 text-purple-500" size={28} />
                  Government Funding
                </h3>
                <div className="space-y-6">
                  <div className="relative">
                    <select 
                      value={governmentData.programType}
                      onChange={(e) => setGovernmentData({...governmentData, programType: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 shadow-sm"
                      required
                    >
                      <option value="">Select program</option>
                      <option value="Samurdhi">Samurdhi</option>
                      <option value="Elderly Support">Elderly Support</option>
                      <option value="Disability Assistance">Disability Assistance</option>
                      <option value="Low Income Healthcare">Low Income Healthcare</option>
                      <option value="Other">Other</option>
                    </select>
                    <FileText className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Beneficiary ID"
                      value={governmentData.beneficiaryId}
                      onChange={(e) => setGovernmentData({...governmentData, beneficiaryId: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 shadow-sm"
                      required
                    />
                    <User className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Beneficiary Name"
                      value={governmentData.beneficiaryName}
                      onChange={(e) => setGovernmentData({...governmentData, beneficiaryName: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 shadow-sm"
                      required
                    />
                    <User className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Reference Number (if applicable)"
                      value={governmentData.referenceNumber}
                      onChange={(e) => setGovernmentData({...governmentData, referenceNumber: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 shadow-sm"
                    />
                    <FileText className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>

                  <button
                    onClick={handleGovernmentFunding}
                    disabled={processing}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
                      processing
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                    }`}
                  >
                    {processing ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Funding Request'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;