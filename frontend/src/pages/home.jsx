import React from 'react';
import { Heart, Calendar, Pill, FileText, Clock, Shield, Users, Award, CreditCard, CheckCircle } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-bold mb-6">Your Health, Our Priority</h2>
            <p className="text-xl mb-8 text-blue-100">
              Modern healthcare management made simple. Book appointments, manage prescriptions, and access your medical records all in one place.
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
                Get Started
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive healthcare solutions designed to make your medical journey seamless and stress-free
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Doctor Scheduling</h4>
              <p className="text-gray-600">
                Book appointments with top specialists at your convenience. Real-time availability and instant confirmation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Pill className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Medicine Management</h4>
              <p className="text-gray-600">
                Order prescriptions online, track medication history, and get reminders for refills and doses.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Lab Reports</h4>
              <p className="text-gray-600">
                Access all your test results and medical reports securely in one place, anytime you need them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Why Choose UrbanCare?</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">24/7 Availability</h4>
                    <p className="text-gray-600">Access your health information and services anytime, anywhere.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Secure & Private</h4>
                    <p className="text-gray-600">Your medical data is encrypted and protected with industry-leading security.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Expert Healthcare Professionals</h4>
                    <p className="text-gray-600">Connect with certified doctors and specialists across various fields.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Quality Care</h4>
                    <p className="text-gray-600">Commitment to excellence in healthcare delivery and patient satisfaction.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <Heart className="w-32 h-32 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Healthcare illustration placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Secure & Easy Payment</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Multiple payment options to make your healthcare payments simple and secure
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Credit/Debit Cards</h4>
              <p className="text-gray-600">
                Pay securely with Visa, Mastercard, American Express, and other major cards.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Online Banking</h4>
              <p className="text-gray-600">
                Direct bank transfers with instant confirmation and secure authentication.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Digital Wallets</h4>
              <p className="text-gray-600">
                PayPal, Google Pay, Apple Pay and other digital payment methods supported.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-2xl font-bold mb-6 text-gray-900">Payment Features</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold mb-1">Instant Processing</h5>
                      <p className="text-gray-600 text-sm">Your payments are processed immediately with real-time confirmation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold mb-1">Encrypted Transactions</h5>
                      <p className="text-gray-600 text-sm">Bank-level encryption ensures your payment data is always protected</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold mb-1">Digital Receipts</h5>
                      <p className="text-gray-600 text-sm">Automatic email receipts and transaction history for easy record-keeping</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold mb-1">Refund Protection</h5>
                      <p className="text-gray-600 text-sm">Easy refund process with full buyer protection on all payments</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <CreditCard className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium">Secure Payment Gateway</p>
                  <p className="text-sm text-gray-600 mt-2">PCI DSS Compliant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Happy Patients</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-blue-100">Expert Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-blue-100">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
          <p className="text-gray-600 mb-8 text-lg">
            Join thousands of patients who trust UrbanCare for their healthcare needs
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 text-lg">
            Create Free Account
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;