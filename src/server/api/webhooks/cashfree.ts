import type { Request, Response } from 'vite';
import { cashfreeService } from '../../services/cashfree';

export default async function handler(req: Request, res: Response) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify webhook signature
        const signature = req.headers['x-webhook-signature'];
        if (!signature) {
            return res.status(401).json({ error: 'Missing signature' });
        }

        // Handle webhook
        await cashfreeService.handleWebhook(req.body);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error handling webhook:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 