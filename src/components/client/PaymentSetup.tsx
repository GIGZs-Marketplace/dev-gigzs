import React from 'react'
import { CreditCard, Building2, Shield, Clock } from 'lucide-react'

interface PaymentSetupProps {
  onNext: () => void
  onBack: () => void
}

function PaymentSetup({ onNext }: PaymentSetupProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Payment Setup</h2>
        <p className="mt-2 text-gray-600">Set up your payment method for hiring freelancers</p>
      </div>

      <div className="space-y-6">
        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Payment Method</h3>
          <div className="grid grid-cols-1 gap-4">
            {[
              {
                title: 'Credit Card',
                icon: CreditCard,
                description: 'Pay with Visa, Mastercard, or American Express'
              },
              {
                title: 'Bank Account',
                icon: Building2,
                description: 'Direct bank transfer (ACH)'
              }
            ].map((method, index) => (
              <label key={index} className="relative flex p-4 border rounded-lg cursor-pointer hover:border-[#00704A]">
                <input
                  type="radio"
                  name="paymentMethod"
                  className="h-4 w-4 text-[#00704A] border-gray-300 focus:ring-[#00704A]"
                />
                <div className="ml-4">
                  <div className="flex items-center">
                    <method.icon size={20} className="text-[#00704A]" />
                    <span className="ml-2 font-medium text-gray-700">{method.title}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{method.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Credit Card Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Card Details</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Card Number</label>
              <div className="mt-1">
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CVC</label>
                <input
                  type="text"
                  placeholder="123"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Billing Address</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Street Address</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <select className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none">
                <option>United States</option>
                <option>Canada</option>
                <option>United Kingdom</option>
                <option>Australia</option>
                {/* Add more countries as needed */}
              </select>
            </div>
          </div>
        </div>

        {/* Security Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-[#00704A]" />
            <div>
              <h4 className="font-medium text-gray-700">Secure Payment Processing</h4>
              <p className="text-sm text-gray-500">Your payment information is encrypted and secure</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Instant Processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Bank-level Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSetup