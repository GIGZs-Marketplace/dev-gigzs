import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { paymentService } from '../../services/paymentService';

export default function PaymentPage() {
    const router = useRouter();
    const { id } = router.query;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentLink, setPaymentLink] = useState('');

    useEffect(() => {
        const initiatePayment = async () => {
            try {
                if (!id) return;

                const link = await paymentService.createPayment(id as string, 0, 'milestone');
                setPaymentLink(link.payment_link);
            } catch (error: any) {
                setError(error.message || 'Failed to initiate payment');
            } finally {
                setLoading(false);
            }
        };

        if (router.isReady) {
            initiatePayment();
        }
    }, [router.isReady, id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                            <h2 className="mt-4 text-lg font-medium text-gray-900">Preparing payment...</h2>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
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
                            <h2 className="mt-4 text-lg font-medium text-gray-900">Payment Error</h2>
                            <p className="mt-2 text-sm text-gray-500">{error}</p>
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center">
                        <h2 className="text-lg font-medium text-gray-900">Complete Your Payment</h2>
                        <p className="mt-2 text-sm text-gray-500">
                            You will be redirected to our secure payment gateway to complete your payment.
                        </p>
                        <div className="mt-6">
                            <a
                                href={paymentLink}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Proceed to Payment
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 