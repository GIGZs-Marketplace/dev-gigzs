import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import axios from 'axios';

interface PaymentLinkParams {
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    returnUrl: string;
}

interface PaymentLinkResponse {
    link_id: string;
    link_url: string;
    link_status: string;
    link_amount: number;
    link_currency: string;
    link_purpose: string;
    link_created_at: string;
    link_expiry_time: string;
    link_meta: {
        order_id: string;
    };
}

interface PaymentStatusResponse {
    order_id: string;
    order_amount: number;
    order_status: string;
    payment_link: {
        link_id: string;
        link_status: string;
    };
}

class CashfreeService {
    private apiUrl: string;
    private appId: string;
    private secretKey: string;

    constructor() {
        console.log('Loading Cashfree credentials...');
        console.log('Environment variables:', {
            apiUrl: process.env.CASHFREE_API_URL,
            appId: process.env.CASHFREE_APP_ID,
            secretKey: process.env.CASHFREE_SECRET_KEY
        });

        this.apiUrl = process.env.CASHFREE_API_URL || 'https://api.cashfree.com';
        this.appId = process.env.CASHFREE_APP_ID || '';
        this.secretKey = process.env.CASHFREE_SECRET_KEY || '';

        if (!this.appId || !this.secretKey) {
            throw new Error('Missing Cashfree credentials');
        }

        console.log('Cashfree credentials loaded successfully');
    }

    private getHeaders() {
        return {
            'x-api-version': '2022-09-01',
            'x-client-id': this.appId,
            'x-client-secret': this.secretKey,
            'Content-Type': 'application/json'
        };
    }

    async createPaymentLink(params: PaymentLinkParams): Promise<PaymentLinkResponse> {
        try {
            const response = await axios.post<PaymentLinkResponse>(
                `${this.apiUrl}/pg/links`,
                {
                    link_id: params.orderId,
                    link_amount: params.amount,
                    link_currency: 'INR',
                    link_purpose: 'Project Payment',
                    customer_details: {
                        customer_name: params.customerName,
                        customer_email: params.customerEmail,
                        customer_phone: params.customerPhone
                    },
                    link_auto_reminders: true,
                    link_notify: {
                        send_sms: true,
                        send_email: true
                    },
                    link_meta: {
                        order_id: params.orderId
                    },
                    link_url: params.returnUrl
                },
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Error creating payment link:', error);
            throw error;
        }
    }

    async checkPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
        try {
            const response = await axios.get<PaymentStatusResponse>(
                `${this.apiUrl}/pg/orders/${orderId}`,
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Error checking payment status:', error);
            throw error;
        }
    }
}

export const cashfreeService = new CashfreeService(); 