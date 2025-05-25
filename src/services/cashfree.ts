import axios from 'axios';
import { supabase } from '../lib/supabase';
import { notificationsService } from './notifications';

export interface CreatePaymentLinkParams {
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    returnUrl: string;
}

export interface PaymentLinkResponse {
    order_id: string;
    payment_link: string;
}

class CashfreeService {
    private apiKey: string;
    private secretKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = process.env.CASHFREE_API_KEY || '';
        this.secretKey = process.env.CASHFREE_SECRET_KEY || '';
        this.baseUrl = process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg';
    }

    private getHeaders() {
        return {
            'x-api-version': '2022-09-01',
            'x-client-id': this.apiKey,
            'x-client-secret': this.secretKey,
            'Content-Type': 'application/json'
        };
    }

    async createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResponse> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/orders`,
                {
                    order_id: params.orderId,
                    order_amount: params.amount,
                    order_currency: 'USD',
                    customer_details: {
                        customer_id: params.orderId,
                        customer_name: params.customerName,
                        customer_email: params.customerEmail,
                        customer_phone: params.customerPhone
                    },
                    order_meta: {
                        return_url: params.returnUrl
                    }
                },
                {
                    headers: this.getHeaders()
                }
            );

            return {
                order_id: response.data.order_id,
                payment_link: response.data.payment_link
            };
        } catch (error) {
            console.error('Error creating payment link:', error);
            throw error;
        }
    }

    async verifyPayment(paymentId: string): Promise<boolean> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/orders/${paymentId}`,
                {
                    headers: this.getHeaders()
                }
            );

            return response.data.order_status === 'PAID';
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    }

    async handleWebhook(payload: any) {
        try {
            // Verify webhook signature
            const signature = payload.signature;
            const data = payload.data;

            // Store webhook data
            const { error } = await supabase
                .from('payment_webhooks')
                .insert({
                    payment_id: data.order.order_id,
                    event_type: data.event_type,
                    payload: data
                });

            if (error) throw error;

            // Update payment status
            if (data.event_type === 'PAYMENT_SUCCESS') {
                const { error: updateError } = await supabase
                    .from('payments')
                    .update({ status: 'paid', cashfree_payment_id: data.payment.payment_id })
                    .eq('cashfree_payment_link_id', data.order.order_id);

                if (updateError) throw updateError;

                // Update freelancer wallet
                const { data: payment } = await supabase
                    .from('payments')
                    .select('amount, project_id, project:projects(freelancer_id)')
                    .eq('cashfree_payment_link_id', data.order.order_id)
                    .single();

                if (payment) {
                    const platformFee = payment.amount * 0.1; // 10% platform fee
                    const freelancerAmount = payment.amount - platformFee;

                    // Update freelancer wallet
                    const { error: walletError } = await supabase
                        .from('freelancer_wallets')
                        .upsert({
                            freelancer_id: ((payment.project as unknown) as { freelancer_id: string }).freelancer_id,
                            available_balance: freelancerAmount,
                            total_earned: freelancerAmount
                        }, {
                            onConflict: 'freelancer_id'
                        });

                    if (walletError) throw walletError;

                    // Send notification to freelancer
                    await notificationsService.sendNotification(
                        ((payment.project as unknown) as { freelancer_id: string }).freelancer_id,
                        `Payment of $${payment.amount} received for project #${payment.project_id}. Your wallet has been credited with $${freelancerAmount}.`,
                        'payment'
                    );
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Error handling webhook:', error);
            throw error;
        }
    }
}

export const cashfreeService = new CashfreeService(); 