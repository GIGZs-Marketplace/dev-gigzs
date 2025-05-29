import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';

const router = Router();
const paymentController = new PaymentController();

// Payment routes
router.post('/initial', paymentController.createInitialPayment);
router.post('/final', paymentController.createFinalPayment);

// Webhook endpoint
router.post('/webhook', paymentController.handleWebhook);

export default router; 