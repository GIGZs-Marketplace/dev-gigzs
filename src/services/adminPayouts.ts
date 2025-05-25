import { supabase } from '../lib/supabase';
import { notificationsService } from './notifications';

export const adminPayoutsService = {
    async approvePayout(payoutRequestId: string) {
        try {
            // Get payout request details
            const { data: payoutRequest, error: payoutError } = await supabase
                .from('payout_requests')
                .select('freelancer_id, amount')
                .eq('id', payoutRequestId)
                .single();

            if (payoutError) throw payoutError;

            // Update payout request status to 'paid'
            const { error: updateError } = await supabase
                .from('payout_requests')
                .update({ status: 'paid' })
                .eq('id', payoutRequestId);

            if (updateError) throw updateError;

            // Update freelancer wallet (mark as paid)
            const { error: walletError } = await supabase
                .from('freelancer_wallets')
                .update({ paid_balance: payoutRequest.amount })
                .eq('freelancer_id', payoutRequest.freelancer_id);

            if (walletError) throw walletError;

            // Send notification to freelancer
            await notificationsService.sendNotification(
                payoutRequest.freelancer_id,
                `Your payout request of $${payoutRequest.amount} has been approved and processed.`,
                'payout'
            );

            return { success: true };
        } catch (error) {
            console.error('Error approving payout:', error);
            throw error;
        }
    }
}; 