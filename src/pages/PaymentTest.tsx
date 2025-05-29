import React, { useState } from 'react';
import { PaymentFlow } from '../components/PaymentFlow';
import { PaymentProvider } from '../contexts/PaymentContext';

export const PaymentTest: React.FC = () => {
  const [orderDetails, setOrderDetails] = useState({
    orderId: 'TEST-' + Math.random().toString(36).substr(2, 9),
    totalAmount: 1000,
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '+1234567890',
  });

  const handlePaymentComplete = () => {
    console.log('Payment completed successfully!');
  };

  return (
    <PaymentProvider>
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Payment Flow Test</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Order ID:</p>
                <p className="font-medium">{orderDetails.orderId}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Amount:</p>
                <p className="font-medium">${orderDetails.totalAmount}</p>
              </div>
              <div>
                <p className="text-gray-600">Customer Name:</p>
                <p className="font-medium">{orderDetails.customerName}</p>
              </div>
              <div>
                <p className="text-gray-600">Customer Email:</p>
                <p className="font-medium">{orderDetails.customerEmail}</p>
              </div>
            </div>
          </div>

          <PaymentFlow
            orderId={orderDetails.orderId}
            totalAmount={orderDetails.totalAmount}
            customerName={orderDetails.customerName}
            customerEmail={orderDetails.customerEmail}
            customerPhone={orderDetails.customerPhone}
            onPaymentComplete={handlePaymentComplete}
          />
        </div>
      </div>
    </PaymentProvider>
  );
}; 