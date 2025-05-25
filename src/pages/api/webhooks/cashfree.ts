import { NextApiRequest, NextApiResponse } from 'next';
import { paymentService } from '../../../services/paymentService';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const signature = req.headers['x-webhook-signature'];
        const payload = req.body;

        // Verify webhook signature
        if (!verifyWebhookSignature(payload, signature)) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Store webhook data
        const { error: logError } = await supabase
            .from('payment_webhooks')
            .insert({
                payment_id: payload.data.order.order_id,
                event_type: payload.data.event_type,
                payload: payload.data
            });

        if (logError) {
            console.error('Error logging webhook:', logError);
        }

        // Handle payment success
        if (payload.data.event_type === 'PAYMENT_SUCCESS') {
            await paymentService.handlePaymentSuccess(
                payload.data.order.order_id,
                payload.data.payment.payment_id
            );
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

function verifyWebhookSignature(payload: any, signature: string | string[] | undefined): boolean {
    if (!signature || !process.env.CASHFREE_WEBHOOK_SECRET) {
        return false;
    }

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.CASHFREE_WEBHOOK_SECRET);
    const calculatedSignature = hmac.update(JSON.stringify(payload)).digest('hex');

    return calculatedSignature === signature;
} 