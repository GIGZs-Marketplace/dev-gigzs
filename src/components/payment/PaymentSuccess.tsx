import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const paymentId = searchParams.get('payment_id');
        if (!paymentId) {
            setStatus('error');
            setMessage('Invalid payment ID');
            return;
        }

        const checkPaymentStatus = async () => {
            try {
                const { data: payment, error } = await supabase
                    .from('payments')
                    .select('status, project:projects(title)')
                    .eq('id', paymentId)
                    .single();

                if (error) throw error;

                if (payment.status === 'paid') {
                    setStatus('success');
                    setMessage(`Payment for project "${payment.project.title}" was successful!`);
                } else {
                    setStatus('error');
                    setMessage('Payment is still processing. Please wait a moment and refresh the page.');
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
                setStatus('error');
                setMessage('Failed to verify payment status. Please contact support.');
            }
        };

        checkPaymentStatus();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">Verifying Payment</h2>
                            <p className="mt-2 text-gray-600">Please wait while we verify your payment status...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">Payment Successful!</h2>
                            <p className="mt-2 text-gray-600">{message}</p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-lg hover:opacity-90 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="mx-auto h-12 w-12 text-red-500" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">Payment Verification Failed</h2>
                            <p className="mt-2 text-gray-600">{message}</p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-lg hover:opacity-90 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PaymentSuccess; 