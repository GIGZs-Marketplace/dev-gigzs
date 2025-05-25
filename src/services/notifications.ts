import { supabase } from '../lib/supabase';

export const notificationsService = {
    async sendNotification(userId: string, message: string, type: 'payment' | 'payout') {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    message,
                    type,
                    read: false
                });
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }
}; 