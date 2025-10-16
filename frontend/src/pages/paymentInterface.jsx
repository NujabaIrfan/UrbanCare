// frontend/src/PaymentPage.jsx
import React, { useState, useEffect } from "react";
import { CreditCard, Shield, Building2 } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Replace with your Stripe publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Stripe Card Payment Component
const StripeCardForm = ({ billDetails, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

  // Fixed card element options - removed invalid 'padding' property
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
      // Step 1: Create payment intent on backend - matches your route
      const response = await fetch('http://localhost:5000/api/receipts/create-payment-intent', {
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

      // Step 2: Confirm the payment with Stripe
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
        // Step 3: Confirm payment on backend - matches your route
        const confirmResponse = await fetch('http://localhost:5000/api/payments/confirm-payment', {
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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          placeholder="John Doe"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Card Details
        </label>
        <div className="px-4 py-3 rounded-lg border border-gray-300 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!stripe || processing || !cardholderName}
        className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
          !stripe || processing || !cardholderName
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {processing ? 'Processing Payment...' : `Pay Rs. ${billDetails.amount.toFixed(2)}`}
      </button>
    </div>
  );
};

// Main Payment Page Component
const PaymentPage = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [billDetails, setBillDetails] = useState({
    billId: "",
    amount: 0,
    receiptNo: ""
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
    const params = new URLSearchParams(window.location.search);
    setBillDetails({
      billId: params.get('billId') || "",
      amount: parseFloat(params.get('amount')) || 0,
      receiptNo: params.get('receiptNo') || ""
    });
  }, []);

  const handlePaymentSuccess = () => {
    alert('Payment successful!');
    window.location.href = '/bills';
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleInsuranceClaim = async () => {
    // Basic validation
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
      const response = await fetch('http://localhost:5000/api/receipts/insurance-claim', {
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
        window.location.href = '/bills';
      } else {
        setError(result.message || 'Failed to submit claim. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit claim. Please try again.');
    }
    
    setProcessing(false);
  };

  const handleGovernmentFunding = async () => {
    // Basic validation
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
      const response = await fetch('http://localhost:5000/api/receipts/government-funding', {
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
        window.location.href = '/bills';
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
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "insurance",
      name: "Insurance Claim",
      icon: Shield,
      description: "Submit insurance claim",
      color: "from-green-500 to-green-600"
    },
    {
      id: "government",
      name: "Government Funding",
      icon: Building2,
      description: "Apply for government assistance",
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8">
          <button 
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center"
          >
            ← Back to Bills
          </button>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Complete Payment</h2>
          <p className="text-gray-600">Choose your preferred payment method</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Select Payment Method</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center mb-4`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1 text-sm">{method.name}</h4>
                      <p className="text-xs text-gray-600">{method.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            {/* Card Payment Form with Stripe */}
            {selectedMethod === "card" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Card Payment (Stripe)</h3>
                <Elements stripe={stripePromise}>
                  <StripeCardForm
                    billDetails={billDetails}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              </div>
            )}

            {/* Insurance Claim Form */}
            {selectedMethod === "insurance" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Insurance Claim</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Insurance Provider *
                    </label>
                    <select 
                      value={insuranceData.insuranceProvider}
                      onChange={(e) => setInsuranceData({...insuranceData, insuranceProvider: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select provider</option>
                      <option value="Sri Lanka Insurance">Sri Lanka Insurance</option>
                      <option value="Ceylinco Insurance">Ceylinco Insurance</option>
                      <option value="AIA Insurance">AIA Insurance</option>
                      <option value="Union Assurance">Union Assurance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Policy Number *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter policy number"
                      value={insuranceData.policyNumber}
                      onChange={(e) => setInsuranceData({...insuranceData, policyNumber: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Claimant Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={insuranceData.claimantName}
                      onChange={(e) => setInsuranceData({...insuranceData, claimantName: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      National ID / Passport *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter ID number"
                      value={insuranceData.claimantId}
                      onChange={(e) => setInsuranceData({...insuranceData, claimantId: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <button
                    onClick={handleInsuranceClaim}
                    disabled={processing}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                      processing
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {processing ? 'Submitting...' : 'Submit Insurance Claim'}
                  </button>
                </div>
              </div>
            )}

            {/* Government Funding Form */}
            {selectedMethod === "government" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Government Funding</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Program Type *
                    </label>
                    <select 
                      value={governmentData.programType}
                      onChange={(e) => setGovernmentData({...governmentData, programType: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select program</option>
                      <option value="Samurdhi">Samurdhi</option>
                      <option value="Elderly Support">Elderly Support</option>
                      <option value="Disability Assistance">Disability Assistance</option>
                      <option value="Low Income Healthcare">Low Income Healthcare</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Beneficiary ID *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter beneficiary ID"
                      value={governmentData.beneficiaryId}
                      onChange={(e) => setGovernmentData({...governmentData, beneficiaryId: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Beneficiary Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={governmentData.beneficiaryName}
                      onChange={(e) => setGovernmentData({...governmentData, beneficiaryName: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reference Number (if applicable)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter reference number"
                      value={governmentData.referenceNumber}
                      onChange={(e) => setGovernmentData({...governmentData, referenceNumber: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleGovernmentFunding}
                    disabled={processing}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                      processing
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {processing ? 'Submitting...' : 'Submit Funding Request'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Receipt No.</span>
                  <span className="font-semibold text-gray-900">{billDetails.receiptNo}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bill ID</span>
                  <span className="font-semibold text-gray-900">{billDetails.billId}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">Rs. {billDetails.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure payment processing
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;