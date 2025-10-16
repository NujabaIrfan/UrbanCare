import React, { useState, useEffect } from "react";
import axios from "axios";
import ReceiptForm from "../components/recieptForm";
import { 
  Plus, 
  Receipt, 
  Search, 
  X, 
  DollarSign, 
  User, 
  FileText, 
  Edit, 
  Trash2, 
  CreditCard,
  Shield,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Lock,
  CreditCard as PaymentIcon
} from "lucide-react";

function AdminPayment() {
  const [showModal, setShowModal] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [insuranceClaims, setInsuranceClaims] = useState([]);
  const [governmentFunding, setGovernmentFunding] = useState([]);
  const [showPaymentDetails, setShowPaymentDetails] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReceiptForPayment, setSelectedReceiptForPayment] = useState(null);

  // 🟣 Fetch all data when component loads
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [receiptsRes, transactionsRes, claimsRes, fundingRes] = await Promise.all([
        axios.get("http://localhost:5000/api/receipts"),
        // UPDATED ENDPOINTS
        axios.get("http://localhost:5000/api/admin/transactions"),
        axios.get("http://localhost:5000/api/admin/insurance-claims"),
        axios.get("http://localhost:5000/api/admin/government-funding")
      ]);
      
      setReceipts(receiptsRes.data);
      setTransactions(transactionsRes.data);
      setInsuranceClaims(claimsRes.data);
      setGovernmentFunding(fundingRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // 🟢 Add a new receipt
  const handleAddReceipt = async (newReceipt) => {
    try {
      const res = await axios.post("http://localhost:5000/api/receipts", newReceipt);
      setReceipts([...receipts, res.data]);
      setShowModal(false);
      fetchAllData(); // Refresh all data
    } catch (err) {
      console.error("Error saving receipt:", err);
      alert("Failed to save receipt. Please check the backend connection.");
    }
  };

  // 🔵 Edit receipt - Only allow if not paid
  const handleEditReceipt = async (updatedReceipt) => {
    if (updatedReceipt.status === "Paid") {
      alert("Cannot edit a paid receipt. Please change the status to 'Pending' first.");
      return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/receipts/${editingReceipt._id}`, updatedReceipt);
      setReceipts(receipts.map((r) => (r._id === editingReceipt._id ? res.data : r)));
      setShowModal(false);
      setEditingReceipt(null);
      fetchAllData(); // Refresh all data
    } catch (err) {
      console.error("Error updating receipt:", err);
      alert("Failed to update receipt. Please check the backend connection.");
    }
  };

  // 🔴 Delete receipt - Only allow if not paid
  const handleDeleteReceipt = async (id) => {
    const receipt = receipts.find(r => r._id === id);
    
    if (receipt?.status === "Paid") {
      alert("Cannot delete a paid receipt. Please change the status to 'Pending' first.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this receipt?")) {
      try {
        await axios.delete(`http://localhost:5000/api/receipts/${id}`);
        setReceipts(receipts.filter((r) => r._id !== id));
        fetchAllData(); // Refresh all data
      } catch (err) {
        console.error("Error deleting receipt:", err);
        alert("Failed to delete receipt. Please check the backend connection.");
      }
    }
  };

  // Update payment status
  const updatePaymentStatus = async (receiptId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/receipts/${receiptId}`, { status });
      fetchAllData(); // Refresh all data
      setShowPaymentModal(false);
      setSelectedReceiptForPayment(null);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  // Update claim/funding status
  const updateClaimStatus = async (claimId, status, type = 'insurance') => {
    try {
      // UPDATED ENDPOINTS
      const endpoint = type === 'insurance' 
        ? `http://localhost:5000/api/insurance/insurance-claims/${claimId}`
        : `http://localhost:5000/api/government/government-funding/${claimId}`;
      
      await axios.put(endpoint, { status });
      fetchAllData(); // Refresh all data
    } catch (err) {
      console.error("Error updating claim status:", err);
      alert("Failed to update status.");
    }
  };

  const openEditModal = (receipt) => {
    if (receipt.status === "Paid") {
      alert("Cannot edit a paid receipt. Please change the status to 'Pending' first.");
      return;
    }
    setEditingReceipt(receipt);
    setShowModal(true);
  };

  const openPaymentModal = (receipt) => {
    setSelectedReceiptForPayment(receipt);
    setShowPaymentModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Paid': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Claim Pending': { color: 'bg-blue-100 text-blue-800', icon: Shield },
      'Funding Pending': { color: 'bg-purple-100 text-purple-800', icon: Building2 },
      'Overdue': { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: Clock };
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'insurance': return <Shield className="w-4 h-4" />;
      case 'government': return <Building2 className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch = 
      r.receiptNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.patientId?.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedTab === "all") return matchesSearch;
    if (selectedTab === "paid") return matchesSearch && r.status === "Paid";
    if (selectedTab === "pending") return matchesSearch && r.status === "Pending";
    if (selectedTab === "claims") return matchesSearch && r.status === "Claim Pending";
    if (selectedTab === "funding") return matchesSearch && r.status === "Funding Pending";
    
    return matchesSearch;
  });

  // Calculate statistics
  const stats = {
    totalReceipts: receipts.length,
    totalPatients: new Set(receipts.map((r) => r.patientId)).size,
    totalRevenue: receipts.reduce((sum, r) => sum + (r.total || 0), 0),
    paidAmount: receipts.filter(r => r.status === 'Paid').reduce((sum, r) => sum + (r.total || 0), 0),
    pendingAmount: receipts.filter(r => r.status === 'Pending').reduce((sum, r) => sum + (r.total || 0), 0),
    claimsAmount: receipts.filter(r => r.status === 'Claim Pending').reduce((sum, r) => sum + (r.total || 0), 0),
    fundingAmount: receipts.filter(r => r.status === 'Funding Pending').reduce((sum, r) => sum + (r.total || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Receipt className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Payment Management</h1>
                <p className="text-gray-500 text-sm mt-1">Manage receipts, payments, and claims</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingReceipt(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              New Receipt
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Receipts</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalReceipts}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Patients</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalPatients}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  Rs {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Paid Amount</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  Rs {stats.paidAmount.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: "all", label: "All Receipts", count: receipts.length },
              { id: "paid", label: "Paid", count: receipts.filter(r => r.status === "Paid").length },
              { id: "pending", label: "Pending Payment", count: receipts.filter(r => r.status === "Pending").length },
              { id: "claims", label: "Insurance Claims", count: receipts.filter(r => r.status === "Claim Pending").length },
              { id: "funding", label: "Government Funding", count: receipts.filter(r => r.status === "Funding Pending").length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedTab === tab.id
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedTab === tab.id ? "bg-emerald-500" : "bg-gray-300"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by receipt number, patient name, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Receipts Table */}
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No receipts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Receipt No</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Patient Details</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Services</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceipts.map((r) => {
                    const isPaid = r.status === "Paid";
                    return (
                      <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-sm font-medium text-emerald-600">{r.receiptNo}</span>
                            <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">{r.patientName}</span>
                            <span className="text-sm text-gray-600">{r.patientId}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {r.services?.slice(0, 2).map((s, i) => (
                              <span
                                key={i}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
                              >
                                {s.name}
                              </span>
                            ))}
                            {r.services?.length > 2 && (
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                                +{r.services.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-bold text-gray-800">Rs {r.total?.toLocaleString() || 0}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {getStatusBadge(r.status || 'Pending')}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setShowPaymentDetails(r)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                              title="View payment details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {/* Edit Button - Disabled when paid */}
                            <button
                              onClick={() => openEditModal(r)}
                              disabled={isPaid}
                              className={`p-2 rounded-lg transition-all ${
                                isPaid
                                  ? "text-gray-400 cursor-not-allowed bg-gray-100"
                                  : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                              }`}
                              title={isPaid ? "Cannot edit paid receipts" : "Edit receipt"}
                            >
                              {isPaid ? <Lock className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                            </button>
                            
                            {/* Mark Payment Button - Only show for non-paid receipts */}
                            {!isPaid && (
                              <button
                                onClick={() => openPaymentModal(r)}
                                className="text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded-lg transition-all"
                                title="Mark as paid"
                              >
                                <PaymentIcon className="w-4 h-4" />
                              </button>
                            )}
                            
                            {/* Delete Button - Disabled when paid */}
                            <button
                              onClick={() => handleDeleteReceipt(r._id)}
                              disabled={isPaid}
                              className={`p-2 rounded-lg transition-all ${
                                isPaid
                                  ? "text-gray-400 cursor-not-allowed bg-gray-100"
                                  : "text-red-600 hover:text-red-800 hover:bg-red-50"
                              }`}
                              title={isPaid ? "Cannot delete paid receipts" : "Delete receipt"}
                            >
                              {isPaid ? <Lock className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingReceipt ? "Edit Receipt" : "Create New Receipt"}
              </h2>
              <div className="flex items-center gap-3">
                {/* Mark Payment Button in Edit Modal */}
                {editingReceipt && editingReceipt.status !== "Paid" && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      openPaymentModal(editingReceipt);
                    }}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
                    title="Mark as paid"
                  >
                    <PaymentIcon className="w-4 h-4" />
                    Mark Payment
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingReceipt(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <ReceiptForm
                onSubmit={editingReceipt ? handleEditReceipt : handleAddReceipt}
                onCancel={() => {
                  setShowModal(false);
                  setEditingReceipt(null);
                }}
                initialData={editingReceipt}
                isEditing={!!editingReceipt}
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Marking Modal */}
      {showPaymentModal && selectedReceiptForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800">Mark Payment</h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedReceiptForPayment(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PaymentIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Confirm Payment</h3>
                  <p className="text-gray-600 mt-2">
                    Are you sure you want to mark this receipt as paid?
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Receipt No:</span>
                      <p className="text-gray-900">{selectedReceiptForPayment.receiptNo}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Patient:</span>
                      <p className="text-gray-900">{selectedReceiptForPayment.patientName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Amount:</span>
                      <p className="text-gray-900 font-bold">Rs {selectedReceiptForPayment.total?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Current Status:</span>
                      {getStatusBadge(selectedReceiptForPayment.status || 'Pending')}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => updatePaymentStatus(selectedReceiptForPayment._id, 'Paid')}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Paid
                  </button>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedReceiptForPayment(null);
                    }}
                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-xl hover:bg-gray-600 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                {/* Additional Payment Options */}
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-600 mb-3">Or mark as:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updatePaymentStatus(selectedReceiptForPayment._id, 'Claim Pending')}
                      className="bg-blue-100 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center justify-center gap-1"
                    >
                      <Shield className="w-4 h-4" />
                      Insurance Claim
                    </button>
                    <button
                      onClick={() => updatePaymentStatus(selectedReceiptForPayment._id, 'Funding Pending')}
                      className="bg-purple-100 text-purple-700 py-2 px-3 rounded-lg hover:bg-purple-200 transition-colors text-sm flex items-center justify-center gap-1"
                    >
                      <Building2 className="w-4 h-4" />
                      Gov Funding
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800">Payment Details</h2>
              <button
                onClick={() => setShowPaymentDetails(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Receipt No:</label>
                    <p className="text-gray-900">{showPaymentDetails.receiptNo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Patient:</label>
                    <p className="text-gray-900">{showPaymentDetails.patientName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Amount:</label>
                    <p className="text-gray-900 font-bold">Rs {showPaymentDetails.total?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Status:</label>
                    {getStatusBadge(showPaymentDetails.status || 'Pending')}
                  </div>
                </div>
                
                {/* Status Update Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => updatePaymentStatus(showPaymentDetails._id, 'Paid')}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark as Paid
                  </button>
                  <button
                    onClick={() => updatePaymentStatus(showPaymentDetails._id, 'Pending')}
                    className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Mark as Pending
                  </button>
                  <button
                    onClick={() => setShowPaymentDetails(null)}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPayment;