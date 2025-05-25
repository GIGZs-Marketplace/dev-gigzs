import { supabase } from '../lib/supabase';
import { notificationsService } from './notifications';
import { Payment } from '../types/database';

interface ContractWithClient {
  id: string;
  client_id: string;
  freelancer_id: string;
  title: string;
  client_profiles: Array<{
    email: string;
    phone: string | null;
  }>;
}

interface PaymentWithContract extends Payment {
  contract: ContractWithClient;
}

interface PaymentHistoryItem {
  id: string;
  amount: number;
  status: string;
  payment_type: string;
  created_at: string;
  contract: {
    title: string;
    client: {
      company_name: string;
    };
    freelancer: {
      full_name: string;
    };
  };
}

const paymentService = {
    // Create a new payment for a project
    async createPayment(contractId: string, amount: number, paymentType: 'milestone' | 'completion') {
        console.log('[paymentService] 1. Starting createPayment with:', { contractId, amount, paymentType });
        let paymentLink: string;
        
        try {
            const isDev = import.meta.env.DEV;
            console.log('[paymentService] 2. Environment check - isDev:', isDev);
            
            // Always use a relative URL to avoid CORS issues
            const apiUrl = '/api/payments';
            console.log('[paymentService] Using API URL:', apiUrl);
                
            console.log('[paymentService] 3. Preparing to make request to:', apiUrl);
            
            const requestBody = {
                contractId,
                amount: Number(amount),
                paymentType,
            };
            
            console.log('[paymentService] 4. Request payload:', JSON.stringify(requestBody, null, 2));
            
            const startTime = Date.now();
            console.log('[paymentService] 5. Making fetch request at:', new Date().toISOString());
            console.log('[paymentService] 5.1 Request URL:', apiUrl);
            
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    // Don't specify mode to let browser handle it
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        contractId,
                        amount: Number(amount),
                        paymentType,
                    }),
                    // Use same-origin for credentials to avoid CORS preflight issues
                    credentials: 'same-origin'
                });

                if (!response.ok) {
                    let errorMessage = `HTTP error! status: ${response.status}`;
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
                    } catch (e) {
                        // If we can't parse the error as JSON, use the status text
                        const text = await response.text();
                        errorMessage = text || response.statusText || `HTTP error! status: ${response.status}`;
                    }
                    console.error('[paymentService] Server responded with error:', {
                        status: response.status,
                        statusText: response.statusText,
                        url: response.url,
                        error: errorMessage
                    });
                    throw new Error(errorMessage);
                }

                const responseData = await response.json();
                
                if (!responseData.link && !responseData.payment_link && !responseData.paymentLink) {
                    throw new Error('No payment link received from server');
                }
                
                console.log('[paymentService] 5.2 Fetch completed, status:', response.status);
                console.log('[paymentService] 5.4 Payment created successfully:', responseData);
                
                const { payment_link, paymentLink } = responseData;
                const link = responseData.link || payment_link || paymentLink;
                if (!link) {
                    throw new Error('No payment link received from the server');
                }
                return link;
                
            } catch (error) {
                console.error('[paymentService] 5.5 Fetch error:', error);
                if (error instanceof TypeError) {
                    console.error('[paymentService] 5.6 This is likely a CORS or network issue. Check if the backend server is running and accessible.');
                    console.error('[paymentService] 5.7 Try accessing this URL directly in your browser:', apiUrl);
                } else if (error instanceof Error) {
                    // If it's an Error object, include the stack trace
                    console.error('[paymentService] Error stack:', error.stack);
                }
                // Re-throw with more context
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                throw new Error(`Payment creation failed: ${errorMessage}`);
            }
            
            // Get contract for notifications
            const { data: contract, error: contractError } = await supabase
                .from('contracts')
                .select('id, client_id, freelancer_id, title')
                .eq('id', contractId)
                .single();

            if (contractError) {
                console.error('Error fetching contract:', contractError);
                throw new Error('Failed to fetch contract details');
            }

            if (!contract) {
                throw new Error('Contract not found');
            }
            // Type assertion to ensure TypeScript knows contract is not null
            const validContract = contract as ContractWithClient;
            
            // Send notifications
            try {
                await notificationsService.sendNotification(
                    validContract.client_id,
                    `Payment request of $${amount} for contract "${validContract.title}"`,
                    'payment'
                );

                await notificationsService.sendNotification(
                    validContract.freelancer_id,
                    `Payment request of $${amount} has been sent to the client for contract "${validContract.title}"`,
                    'payment'
                );
            } catch (error) {
                console.error('Error sending notifications:', error);
                // Don't fail the payment if notifications fail
            }
            
            return paymentLink;
        } catch (error) {
            console.error('Error in createPayment:', error);
            throw error;
        }
    },

    // Handle payment success
    async handlePaymentSuccess(paymentId: string, cashfreePaymentId: string) {
        const { data: payment, error: fetchError } = await supabase
            .from('payments')
            .select('*, contract:contracts!inner(id, freelancer_id, client_id, title, status)')
            .eq('id', paymentId)
            .single();

        if (fetchError || !payment) {
            console.error('Error fetching payment:', fetchError);
            throw new Error('Payment not found or access denied');
        }

        // Update payment status
        const { error: updateError } = await supabase
            .from('payments')
            .update({
                status: 'paid',
                cashfree_payment_id: cashfreePaymentId,
                paid_at: new Date().toISOString()
            })
            .eq('id', paymentId);

        if (updateError) throw updateError;

        // Calculate platform fee and freelancer amount (10% platform fee)
        const platformFee = payment.amount * 0.1;
        const freelancerAmount = payment.amount - platformFee;

        // Update or create freelancer wallet
        const { data: wallet, error: walletFetchError } = await supabase
            .from('freelancer_wallets')
            .select('available_balance, total_earned')
            .eq('freelancer_id', payment.contract.freelancer_id)
            .single();

        if (walletFetchError && walletFetchError.code !== 'PGRST116') { // Ignore not found error
            console.error('Error fetching wallet:', walletFetchError);
            throw walletFetchError;
        }

        const newBalance = (wallet?.available_balance || 0) + freelancerAmount;
        const totalEarned = (wallet?.total_earned || 0) + freelancerAmount;

        const { error: walletUpdateError } = await supabase
            .from('freelancer_wallets')
            .upsert({
                freelancer_id: payment.contract.freelancer_id,
                available_balance: newBalance,
                total_earned: totalEarned
            }, {
                onConflict: 'freelancer_id'
            });

        if (walletUpdateError) {
            console.error('Error updating wallet:', walletUpdateError);
            throw walletUpdateError;
        }

        // Send notifications
        await notificationsService.sendNotification(
            payment.contract.freelancer_id,
            `Payment of $${payment.amount.toFixed(2)} received. Your wallet has been credited with $${freelancerAmount.toFixed(2)}.`,
            'payment'
        );

        await notificationsService.sendNotification(
            payment.contract.client_id,
            `Payment of $${payment.amount.toFixed(2)} has been processed successfully.`,
            'payment'
        );

        // Update contract status if it's a completion payment
        if (payment.payment_type === 'completion') {
            const { error: contractError } = await supabase
                .from('contracts')
                .update({ 
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', payment.contract_id);

            if (contractError) {
                console.error('Error updating contract status:', contractError);
                throw contractError;
            }
        }
    },

    // Request payout
    async requestPayout(userId: string, amount: number, bankDetails: { accountNumber: string; ifscCode: string }) {
        // Check if user has sufficient balance
        const { data: wallet, error: walletError } = await supabase
            .from('freelancer_wallets')
            .select('available_balance')
            .eq('freelancer_id', userId)
            .single();

        if (walletError) throw walletError;
        if (!wallet || wallet.available_balance < amount) {
            throw new Error('Insufficient balance for this payout request.');
        }

        // Create payout request
        const { data: payout, error: payoutError } = await supabase
            .from('payout_requests')
            .insert([
                {
                    freelancer_id: userId,
                    amount,
                    status: 'pending',
                    bank_account_number: bankDetails.accountNumber,
                    bank_ifsc_code: bankDetails.ifscCode
                }
            ])
            .select()
            .single();

        if (payoutError) throw payoutError;

        // Update wallet balance
        const newBalance = wallet.available_balance - amount;
        const { error: updateError } = await supabase
            .from('freelancer_wallets')
            .update({ available_balance: newBalance })
            .eq('freelancer_id', userId);

        if (updateError) {
            // If wallet update fails, delete the payout request
            await supabase
                .from('payout_requests')
                .delete()
                .eq('id', payout.id);
            throw updateError;
        }

        // Send notification
        await notificationsService.sendNotification(
            userId,
            `Payout request of $${amount.toFixed(2)} has been submitted and is being processed.`,
            'payout'
        );

        return payout;
    },

    // Get payment history
    async getPaymentHistory(userId: string) {
        const { data: user, error: userError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            throw new Error('User not found');
        }

        let query = supabase
            .from('payments')
            .select(`
                id,
                amount,
                status,
                payment_type,
                created_at,
                contract:contracts!inner(
                    title,
                    client:client_profiles!inner(
                        company_name
                    ),
                    freelancer:freelancer_profiles!inner(
                        full_name
                    )
                )
            `)
            .order('created_at', { ascending: false });

        // Filter based on user role
        if (user.role === 'freelancer') {
            query = query.eq('contract.freelancer_id', userId);
        } else if (user.role === 'client') {
            query = query.eq('contract.client_id', userId);
        }

        const { data: payments, error } = await query as { data: PaymentHistoryItem[] | null; error: any };

        if (error) {
            console.error('Error fetching payment history:', error);
            throw error;
        }

        return payments || [];
    }
}; 
// Add default export
export default paymentService;
