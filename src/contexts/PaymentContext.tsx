import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

interface PaymentContextType {
  createInitialPayment: (orderDetails: OrderDetails) => Promise<string>;
  createFinalPayment: (orderDetails: OrderDetails) => Promise<string>;
  paymentStatus: PaymentStatus;
  setPaymentStatus: (status: PaymentStatus) => void;
}

interface OrderDetails {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

type PaymentStatus = 'pending' | 'half_paid' | 'paid' | 'failed';

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');

  const createInitialPayment = useCallback(async (orderDetails: OrderDetails) => {
    try {
      const response = await axios.post('/api/payments/initial', orderDetails);
      return response.data.data.payment_link_url;
    } catch (error) {
      console.error('Error creating initial payment:', error);
      throw new Error('Failed to create initial payment');
    }
  }, []);

  const createFinalPayment = useCallback(async (orderDetails: OrderDetails) => {
    try {
      const response = await axios.post('/api/payments/final', orderDetails);
      return response.data.data.payment_link_url;
    } catch (error) {
      console.error('Error creating final payment:', error);
      throw new Error('Failed to create final payment');
    }
  }, []);

  return (
    <PaymentContext.Provider
      value={{
        createInitialPayment,
        createFinalPayment,
        paymentStatus,
        setPaymentStatus,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}; 