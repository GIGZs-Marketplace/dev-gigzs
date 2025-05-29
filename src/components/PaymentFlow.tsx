import React, { useState } from 'react';
import { usePayment } from '../contexts/PaymentContext';

interface PaymentFlowProps {
  orderId: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onPaymentComplete: () => void;
}

export const PaymentFlow: React.FC<PaymentFlowProps> = ({
  orderId,
  totalAmount,
  customerName,
  customerEmail,
  customerPhone,
  onPaymentComplete,
}) => {
  const { createInitialPayment, createFinalPayment, paymentStatus, setPaymentStatus } = usePayment();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitialPayment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const paymentUrl = await createInitialPayment({
        orderId,
        amount: totalAmount,
        customerName,
        customerEmail,
        customerPhone,
      });
      window.location.href = paymentUrl;
    } catch (err) {
      setError('Failed to create initial payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalPayment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const paymentUrl = await createFinalPayment({
        orderId,
        amount: totalAmount,
        customerName,
        customerEmail,
        customerPhone,
      });
      window.location.href = paymentUrl;
    } catch (err) {
      setError('Failed to create final payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
      
      <div className="mb-4">
        <p className="text-gray-600">Order ID: {orderId}</p>
        <p className="text-gray-600">Total Amount: ${totalAmount}</p>
        <p className="text-gray-600">Status: {paymentStatus}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {paymentStatus === 'pending' && (
          <button
            onClick={handleInitialPayment}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Pay 50% Upfront'}
          </button>
        )}

        {paymentStatus === 'half_paid' && (
          <button
            onClick={handleFinalPayment}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Pay Remaining 50%'}
          </button>
        )}

        {paymentStatus === 'paid' && (
          <div className="text-center text-green-600 font-semibold">
            Payment Completed Successfully!
          </div>
        )}
      </div>
    </div>
  );
}; 