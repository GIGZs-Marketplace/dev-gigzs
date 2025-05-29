import express, { Request, Response, NextFunction } from 'express';
import { ParsedQs } from 'qs';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS
app.use((req, res, next) => {
    // Allow requests from both localhost and 127.0.0.1 on port 3000
    const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
    const origin = req.headers.origin;
    
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Import cashfree service
import { cashfreeService } from '../src/services/cashfree';

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Payment routes
interface PaymentRequest {
    contractId: string;
    amount: number;
    paymentType: string;
}

app.post<{}, any, PaymentRequest>('/api/payments', (async (req: Request<{}, any, PaymentRequest>, res: Response, next: NextFunction) => {
    try {
        const { contractId, amount, paymentType } = req.body;

        // Validate request
        if (!contractId || amount === undefined || !paymentType) {
            return res.status(400).json({
                error: 'Missing required fields: contractId, amount, or paymentType'
            });
        }

        // Get contract details
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .select('*, client:client_id(*)')
            .eq('id', contractId)
            .single();

        if (contractError || !contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        // Create payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert([{
                contract_id: contractId,
                amount: Number(amount),
                payment_type: paymentType,
                status: 'pending'
            }])
            .select()
            .single();

        if (paymentError || !payment) {
            console.error('Error creating payment:', paymentError);
            return res.status(500).json({ error: 'Failed to create payment' });
        }

        // Create Cashfree payment link
        const paymentLink = await cashfreeService.createPaymentLink({
            orderId: payment.id,
            amount: Number(amount),
            customerName: contract.client?.email?.split('@')[0] || 'Customer',
            customerEmail: contract.client?.email || '',
            customerPhone: contract.client?.phone || '',
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_APP_URL}/payments/success`,
        });

        // Update payment with Cashfree link ID
        await supabase
            .from('payments')
            .update({ cashfree_payment_link_id: paymentLink.order_id })
            .eq('id', payment.id);

        res.json({ paymentLink });
    } catch (error) {
        next(error);
    }
}) as express.RequestHandler);

// Handle webhook
app.post('/api/payments/webhook', async (req, res) => {
    try {
        const signature = req.headers['x-webhook-signature'];
        const payload = JSON.stringify(req.body);

        if (!signature || typeof signature !== 'string') {
            console.error('Missing or invalid webhook signature');
            return res.status(400).json({ error: 'Invalid signature' });
        }

        // Verify webhook signature
        const webhookSecret = process.env.VITE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new Error('Missing webhook secret');
        }

        const hmac = crypto.createHmac('sha256', webhookSecret);
        const calculatedSignature = hmac.update(payload).digest('hex');

        if (!crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(calculatedSignature)
        )) {
            console.error('Invalid webhook signature');
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const { event_type, payment_link_id, link_status, link_meta } = req.body;
        console.log('Received webhook event:', event_type);

        // Handle different event types
        switch (event_type) {
            case 'payment_link.paid':
                if (link_meta?.order_id) {
                    // Update payment status
        const { error: updateError } = await supabase
            .from('payments')
                        .update({ 
                            status: 'paid',
                            payment_link_id: payment_link_id
                        })
                        .eq('id', link_meta.order_id);

        if (updateError) {
            console.error('Error updating payment status:', updateError);
            return res.status(500).json({ error: 'Failed to update payment status' });
        }

                    // Create wallet entry
            const { data: payment, error: paymentError } = await supabase
                .from('payments')
                        .select('contract_id, amount, freelancer_id')
                        .eq('id', link_meta.order_id)
                .single();

            if (paymentError || !payment) {
                console.error('Error fetching payment details:', paymentError);
                return res.status(500).json({ error: 'Failed to fetch payment details' });
            }

            const { error: walletError } = await supabase
                .from('freelancer_wallets')
                .insert({
                    freelancer_id: payment.freelancer_id,
                    amount: payment.amount,
                            contract_id: payment.contract_id,
                            payment_id: payment_link_id,
                    type: 'CREDIT'
                });

            if (walletError) {
                console.error('Error creating wallet entry:', walletError);
                return res.status(500).json({ error: 'Failed to create wallet entry' });
            }
                }
                break;

            case 'payment_link.expired':
                if (link_meta?.order_id) {
                    await supabase
                        .from('payments')
                        .update({ status: 'expired' })
                        .eq('id', link_meta.order_id);
                }
                break;

            case 'payment_link.cancelled':
                if (link_meta?.order_id) {
                    await supabase
                        .from('payments')
                        .update({ status: 'cancelled' })
                        .eq('id', link_meta.order_id);
                }
                break;
        }

        // Log webhook event
        const { error: logError } = await supabase
            .from('payment_webhooks')
            .insert({
                payment_link_id,
                event_type,
                status: link_status,
                payload: req.body
            });

        if (logError) {
            console.error('Error logging webhook:', logError);
        }

        res.json({ status: 'success' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Webhook server listening on port ${PORT}`);
}); 