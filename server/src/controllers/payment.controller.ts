import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service.js';
import { config } from '../config/index.js';

const paymentService = new PaymentService();

export class PaymentController {
  async createInitialPayment(req: Request, res: Response) {
    try {
      const { orderId, amount, customerName, customerEmail, customerPhone } = req.body;

      const paymentLink = await paymentService.createPaymentLink({
        orderId,
        amount: amount / 2, // 50% upfront payment
        customerName,
        customerEmail,
        customerPhone,
      });

      res.json({
        success: true,
        data: paymentLink,
      });
    } catch (error) {
      console.error('Error creating initial payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment link',
      });
    }
  }

  async createFinalPayment(req: Request, res: Response) {
    try {
      const { orderId, amount, customerName, customerEmail, customerPhone } = req.body;

      const paymentLink = await paymentService.createPaymentLink({
        orderId,
        amount: amount / 2, // Remaining 50%
        customerName,
        customerEmail,
        customerPhone,
      });

      res.json({
        success: true,
        data: paymentLink,
      });
    } catch (error) {
      console.error('Error creating final payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment link',
      });
    }
  }

  async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-webhook-signature'];
      if (signature !== config.webhook.secret) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const { 
        event_type,
        payment_link_id,
        link_status,
        link_meta,
        payment_details
      } = req.body;

      console.log('Received webhook event:', event_type);

      switch (event_type) {
        case 'payment_link.paid':
          // Update order status and freelancer wallet
          if (link_meta?.order_id) {
            // TODO: Update order status in database
            console.log('Payment successful for order:', link_meta.order_id);
            
            // Calculate freelancer share (after platform fee)
            const amount = payment_details?.amount || 0;
            const platformFee = (amount * config.platform.feePercentage) / 100;
            const freelancerShare = amount - platformFee;
            
            // TODO: Update freelancer wallet
            console.log('Freelancer share:', freelancerShare);
          }
          break;

        case 'payment_link.expired':
          console.log('Payment link expired:', payment_link_id);
          // TODO: Update order status to expired
          break;

        case 'payment_link.cancelled':
          console.log('Payment cancelled:', payment_link_id);
          // TODO: Update order status to cancelled
          break;

        default:
          console.log('Unhandled event type:', event_type);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
} 