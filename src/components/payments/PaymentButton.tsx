import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface PaymentButtonProps {
    projectId: string;
    amount: number;
    paymentType: 'milestone' | 'completion';
    className?: string;
    children?: React.ReactNode;
}

export default function PaymentButton({
    projectId,
    amount,
    paymentType,
    className = '',
    children
}: PaymentButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            await router.push(`/payments/${projectId}?amount=${amount}&type=${paymentType}`);
        } catch (error) {
            console.error('Error initiating payment:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
            } ${className}`}
        >
            {loading ? (
                <>
                    <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    Processing...
                </>
            ) : (
                children || `Pay $${amount.toFixed(2)}`
            )}
        </button>
    );
} 