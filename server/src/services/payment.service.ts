import axios from 'axios';
import { config } from '../config';

interface PaymentLinkResponse {
  payment_link_id: string;
  payment_link_url: string;
}

interface PaymentDetails {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export class PaymentService {
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = config.cashfree.apiKey;
    this.secretKey = config.cashfree.secretKey;
    this.baseUrl = config.cashfree.baseUrl;
  }

  private getAuthHeaders() {
    return {
      'x-api-version': '2022-09-01',
      'x-client-id': this.apiKey,
      'x-client-secret': this.secretKey,
    };
  }

  async createPaymentLink(details: PaymentDetails): Promise<PaymentLinkResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payment-links`,
        {
          link_amount: details.amount,
          link_currency: 'INR',
          link_purpose: `Payment for order ${details.orderId}`,
          customer_details: {
            customer_name: details.customerName,
            customer_email: details.customerEmail,
            customer_phone: details.customerPhone,
          },
          link_meta: {
            order_id: details.orderId,
          },
          link_auto_reminders: true,
          link_notify: {
            send_sms: true,
            send_email: true,
          },
        },
        {
          headers: this.getAuthHeaders(),
        }
      );

      return {
        payment_link_id: response.data.payment_link_id,
        payment_link_url: response.data.payment_link_url,
      };
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw new Error('Failed to create payment link');
    }
  }

  async verifyPayment(paymentLinkId: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payment-links/${paymentLinkId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data.link_status === 'PAID';
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error('Failed to verify payment');
    }
  }
} 