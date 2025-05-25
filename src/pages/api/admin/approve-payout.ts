import { Request, Response } from 'express';
import { adminPayoutsService } from '../../../services/adminPayouts';

export default async function handler(req: Request, res: Response) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { payoutRequestId } = req.body;
        if (!payoutRequestId) {
            return res.status(400).json({ error: 'Payout request ID is required' });
        }

        await adminPayoutsService.approvePayout(payoutRequestId);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error approving payout:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 