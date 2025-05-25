import React, { useState, useEffect } from 'react';
import { DollarSign, Wallet as WalletIcon, CreditCard, Plus, ExternalLink, Bell } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { projectPaymentsService } from '../../../services/projectPayments';

function Wallet() {
    const [wallet, setWallet] = useState<any>(null);
    const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        accountHolderName: '',
        bankName: '',
        ifscCode: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWalletAndPayouts();
        fetchNotifications();
    }, []);

    const fetchWalletAndPayouts = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not logged in');

            // Fetch wallet
            const { data: walletData, error: walletError } = await supabase
                .from('freelancer_wallets')
                .select('*')
                .eq('freelancer_id', user.id)
                .single();

            if (walletError) throw walletError;
            setWallet(walletData);

            // Fetch payout requests
            const { data: payoutData, error: payoutError } = await supabase
                .from('payout_requests')
                .select('*')
                .eq('freelancer_id', user.id)
                .order('created_at', { ascending: false });

            if (payoutError) throw payoutError;
            setPayoutRequests(payoutData);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            setError('Failed to load wallet data');
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not logged in');

            const { data: notificationData, error: notificationError } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (notificationError) throw notificationError;
            setNotifications(notificationData);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handlePayoutRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not logged in');

            const amount = parseFloat(payoutAmount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Invalid amount');
            }

            await projectPaymentsService.requestPayout(user.id, amount, bankDetails);
            setShowPayoutModal(false);
            setPayoutAmount('');
            setBankDetails({
                accountNumber: '',
                accountHolderName: '',
                bankName: '',
                ifscCode: ''
            });
            await fetchWalletAndPayouts();
        } catch (error) {
            console.error('Error requesting payout:', error);
            setError('Failed to request payout');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00704A]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Wallet Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Wallet Overview</h2>
                    <WalletIcon className="text-[#00704A]" size={24} />
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="text-gray-400" size={20} />
                            <span className="text-sm text-gray-600">Available Balance</span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                            ${wallet?.available_balance.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="text-gray-400" size={20} />
                            <span className="text-sm text-gray-600">Reserved Balance</span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                            ${wallet?.reserved_balance.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="text-gray-400" size={20} />
                            <span className="text-sm text-gray-600">Total Earned</span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                            ${wallet?.total_earned.toLocaleString()}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowPayoutModal(true)}
                    disabled={wallet?.available_balance <= 0}
                    className="mt-6 w-full bg-[#00704A] text-white py-2 px-4 rounded-lg hover:bg-[#005538] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Request Payout
                </button>
            </div>

            {/* Payout Requests */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800">Payout Requests</h3>
                </div>

                <div className="divide-y divide-gray-200">
                    {payoutRequests.map((request) => (
                        <div key={request.id} className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        ${request.amount.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    ))}

                    {payoutRequests.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                            No payout requests yet
                        </div>
                    )}
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800">Notifications</h3>
                </div>

                <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                        <div key={notification.id} className="p-6">
                            <div className="flex items-center space-x-2">
                                <Bell className="text-gray-400" size={20} />
                                <p className="text-gray-900">{notification.message}</p>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}

                    {notifications.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                            No notifications yet
                        </div>
                    )}
                </div>
            </div>

            {/* Payout Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Request Payout</h3>
                        <form onSubmit={handlePayoutRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount</label>
                                <input
                                    type="number"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00704A] focus:ring focus:ring-[#00704A] focus:ring-opacity-50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                                <input
                                    type="text"
                                    value={bankDetails.accountNumber}
                                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00704A] focus:ring focus:ring-[#00704A] focus:ring-opacity-50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                                <input
                                    type="text"
                                    value={bankDetails.accountHolderName}
                                    onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00704A] focus:ring focus:ring-[#00704A] focus:ring-opacity-50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                                <input
                                    type="text"
                                    value={bankDetails.bankName}
                                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00704A] focus:ring focus:ring-[#00704A] focus:ring-opacity-50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                                <input
                                    type="text"
                                    value={bankDetails.ifscCode}
                                    onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00704A] focus:ring focus:ring-[#00704A] focus:ring-opacity-50"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPayoutModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#00704A] rounded-md hover:bg-[#005538]"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Wallet; 