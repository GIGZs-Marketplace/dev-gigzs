import React, { useState } from 'react';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../contexts/AuthContext';

export default function PayoutRequest() {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const amountNum = parseFloat(amount);
            if (isNaN(amountNum) || amountNum <= 0) {
                throw new Error('Please enter a valid amount');
            }

            await paymentService.requestPayout(user?.id || '', amountNum);
            setSuccess('Payout request submitted successfully');
            setAmount('');
        } catch (error: any) {
            setError(error.message || 'Failed to submit payout request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Request Payout</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Amount ($)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            name="amount"
                            id="amount"
                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-4 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 text-sm text-green-600">
                        {success}
                    </div>
                )}

                <div className="text-sm text-gray-500 mb-4">
                    <p>Note: A minimum balance of $100 must be maintained in your wallet.</p>
                    <p>Payout requests are typically processed within 2-3 business days.</p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? 'Processing...' : 'Request Payout'}
                </button>
            </form>
        </div>
    );
} 