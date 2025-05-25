# Webhook Setup Guide

## Local Development Setup

### 1. Install ngrok
```bash
# Install ngrok globally
npm install -g ngrok

# Or using yarn
yarn global add ngrok
```

### 2. Start Webhook Server
```bash
# Start the webhook server
npm run webhook-server
```

### 3. Start ngrok
```bash
# Start ngrok on the same port as your webhook server (3000)
ngrok http 3000
```

### 4. Configure Cashfree Webhook

1. Log in to [Cashfree Dashboard](https://merchant.cashfree.com)
2. Switch to "Test Mode"
3. Go to "Settings" → "Webhooks"
4. Click "Add Webhook"
5. Enter the following details:
   - **Endpoint URL**: `https://[your-ngrok-url]/webhooks/cashfree`
     Example: `https://abcd-123-45-67-89.ngrok.io/webhooks/cashfree`
   - **Webhook Version**: Select the latest version
   - **Events to Receive**:
     - PAYMENT_SUCCESS
     - PAYMENT_FAILURE
     - REFUND_SUCCESS
     - REFUND_FAILURE

### 5. Test Webhook

1. In Cashfree Dashboard, click "Test" next to your webhook
2. Select an event type (e.g., PAYMENT_SUCCESS)
3. Click "Send Test Webhook"
4. Check your webhook server logs for the incoming request

## Production Setup

### 1. Deploy Webhook Server
Deploy your webhook server to your production environment.

### 2. Configure Production Webhook
1. Log in to [Cashfree Dashboard](https://merchant.cashfree.com)
2. Go to "Settings" → "Webhooks"
3. Click "Add Webhook"
4. Enter the following details:
   - **Endpoint URL**: `https://[your-domain]/webhooks/cashfree`
   - **Webhook Version**: Select the latest version
   - **Events to Receive**: Same as test environment

## Webhook Security

### 1. Signature Verification
The webhook server automatically verifies the signature:
```typescript
const signature = req.headers['x-webhook-signature'];
if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
}
```

### 2. Environment Variables
```env
# For local development with ngrok
VITE_WEBHOOK_URL=https://[your-ngrok-url]/webhooks/cashfree

# For production
VITE_WEBHOOK_URL=https://[your-domain]/webhooks/cashfree
```

## Troubleshooting

### Common Issues

1. **Webhook Not Receiving**
   - Verify ngrok is running
   - Check webhook URL is correct
   - Ensure server is running on port 3000
   - Check ngrok console for incoming requests

2. **Signature Verification Failed**
   - Verify you're using the correct API keys
   - Check webhook version matches
   - Ensure proper signature header

3. **Server Not Starting**
   - Check if port 3000 is available
   - Verify all dependencies are installed
   - Check server logs for errors

### Debug Steps

1. Check ngrok status:
```bash
# View ngrok status
ngrok status
```

2. Check webhook server logs:
```bash
# View server logs
npm run webhook-server
```

3. Test webhook locally:
```bash
# Using curl
curl -X POST http://localhost:3000/webhooks/cashfree \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: test-signature" \
  -d '{"test": true}'
```

## Monitoring

### 1. Logging
The webhook server logs:
- Incoming webhook requests
- Signature verification results
- Processing status
- Any errors

### 2. Response Codes
- 200: Success
- 401: Missing or invalid signature
- 500: Server error

## Support

- Cashfree Webhook Documentation: https://docs.cashfree.com/webhooks
- ngrok Documentation: https://ngrok.com/docs
- Technical Support: api-support@cashfree.com 