import { supabase } from '../lib/supabase';
import { cashfreeService } from './cashfree';
import { notificationsService } from './notifications';

export const projectPaymentsService = {
    async createProjectPayment(projectId: string) {
        try {
            // Get project details
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('*, client:client_profiles(*), freelancer:freelancer_profiles(*)')
                .eq('id', projectId)
                .single();

            if (projectError) throw projectError;

            // Calculate advance payment amount (50% of total)
            const advanceAmount = project.total_amount / 2;

            // Create payment record
            const { data: payment, error: paymentError } = await supabase
                .from('payments')
                .insert({
                    project_id: projectId,
                    amount: advanceAmount,
                    payment_type: 'advance',
                    status: 'pending'
                })
                .select()
                .single();

            if (paymentError) throw paymentError;

            // Generate payment link
            const paymentLink = await cashfreeService.createPaymentLink({
                amount: advanceAmount,
                orderId: payment.id,
                customerName: project.client.full_name,
                customerEmail: project.client.email,
                customerPhone: project.client.phone,
                returnUrl: `${window.location.origin}/payment/success?payment_id=${payment.id}`
            });

            // Update payment with Cashfree link ID
            const { error: updateError } = await supabase
                .from('payments')
                .update({ cashfree_payment_link_id: paymentLink })
                .eq('id', payment.id);

            if (updateError) throw updateError;

            return paymentLink;
        } catch (error) {
            console.error('Error creating project payment:', error);
            throw error;
        }
    },

    async createCompletionPayment(projectId: string) {
        try {
            // Get project details
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('*, client:client_profiles(*), freelancer:freelancer_profiles(*)')
                .eq('id', projectId)
                .single();

            if (projectError) throw projectError;

            // Calculate completion payment amount (remaining 50%)
            const completionAmount = project.total_amount / 2;

            // Create payment record
            const { data: payment, error: paymentError } = await supabase
                .from('payments')
                .insert({
                    project_id: projectId,
                    amount: completionAmount,
                    payment_type: 'completion',
                    status: 'pending'
                })
                .select()
                .single();

            if (paymentError) throw paymentError;

            // Generate payment link
            const paymentLink = await cashfreeService.createPaymentLink({
                amount: completionAmount,
                orderId: payment.id,
                customerName: project.client.full_name,
                customerEmail: project.client.email,
                customerPhone: project.client.phone,
                returnUrl: `${window.location.origin}/payment/success?payment_id=${payment.id}`
            });

            // Update payment with Cashfree link ID
            const { error: updateError } = await supabase
                .from('payments')
                .update({ cashfree_payment_link_id: paymentLink })
                .eq('id', payment.id);

            if (updateError) throw updateError;

            return paymentLink;
        } catch (error) {
            console.error('Error creating completion payment:', error);
            throw error;
        }
    },

    async requestPayout(freelancerId: string, amount: number, bankDetails: any) {
        try {
            // Get freelancer wallet
            const { data: wallet, error: walletError } = await supabase
                .from('freelancer_wallets')
                .select('available_balance')
                .eq('freelancer_id', freelancerId)
                .single();

            if (walletError) throw walletError;

            // Check if amount is available and above threshold, enforcing $100 reserve
            if (wallet.available_balance - 100 < amount) {
                throw new Error('Insufficient balance. Remember that $100 is reserved.');
            }

            // Create payout request
            const { error: payoutError } = await supabase
                .from('payout_requests')
                .insert({
                    freelancer_id: freelancerId,
                    amount,
                    status: 'pending',
                    bank_details: bankDetails
                });

            if (payoutError) throw payoutError;

            // Update wallet balance
            const { error: updateError } = await supabase
                .from('freelancer_wallets')
                .update({
                    available_balance: wallet.available_balance - amount
                })
                .eq('freelancer_id', freelancerId);

            if (updateError) throw updateError;

            // Send notification to freelancer
            await notificationsService.sendNotification(
                freelancerId,
                `Payout request of $${amount} has been submitted and is pending approval.`,
                'payout'
            );

            return { success: true };
        } catch (error) {
            console.error('Error requesting payout:', error);
            throw error;
        }
    }
}; 