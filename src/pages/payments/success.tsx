import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { paymentService } from '../../services/paymentService';

export default function PaymentSuccess() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handlePaymentSuccess = async () => {
            try {
                const { payment_id, order_id } = router.query;
                if (!payment_id || !order_id) {
                    throw new Error('Missing payment information');
                }

                await paymentService.handlePaymentSuccess(payment_id as string, order_id as string);
                setStatus('success');
                setMessage('Payment processed successfully!');
            } catch (error) {
                console.error('Error processing payment:', error);
                setStatus('error');
                setMessage('Failed to process payment. Please contact support.');
            }
        };

        if (router.isReady) {
            handlePaymentSuccess();
        }
    }, [router.isReady, router.query]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center">
                        {status === 'loading' && (
                            <>
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                                <h2 className="mt-4 text-lg font-medium text-gray-900">Processing payment...</h2>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                    <svg
                                        className="h-6 w-6 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h2 className="mt-4 text-lg font-medium text-gray-900">Payment Successful!</h2>
                                <p className="mt-2 text-sm text-gray-500">{message}</p>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                    <svg
                                        className="h-6 w-6 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                                <h2 className="mt-4 text-lg font-medium text-gray-900">Payment Failed</h2>
                                <p className="mt-2 text-sm text-gray-500">{message}</p>
                            </>
                        )}

                        <div className="mt-6">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 