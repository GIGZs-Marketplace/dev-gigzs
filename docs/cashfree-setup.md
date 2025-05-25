# Cashfree Setup Guide

## Getting Started with Cashfree

### 1. Create a Cashfree Account
1. Visit [Cashfree Business](https://www.cashfree.com/business)
2. Click "Sign Up" and create a business account
3. Complete the business verification process
4. Wait for account approval

### 2. Access API Credentials

#### For Production Environment
1. Log in to your [Cashfree Dashboard](https://merchant.cashfree.com)
2. Navigate to "Settings" → "API Keys"
3. You'll see two types of API keys:
   - **Payment Gateway API Keys**
     - Used for payment processing
     - Click "Generate New API Key" under Payment Gateway
     - Save both the App ID and Secret Key securely
   - **Secure ID API Keys**
     - Used for additional security features
     - Click "Generate New API Key" under Secure ID
     - Save both the App ID and Secret Key securely

#### For Test Environment
1. Log in to your [Cashfree Dashboard](https://merchant.cashfree.com)
2. Switch to "Test Mode" using the toggle in the top right
3. Navigate to "Settings" → "API Keys"
4. Generate both types of API keys:
   - Payment Gateway test keys
   - Secure ID test keys
5. Save all test keys securely

### 3. Configure Webhook URL

#### For Local Development Testing
1. Install ngrok:
```bash
npm install -g ngrok
```

2. Start your local development server:
```bash
npm run dev
```

3. Start ngrok to create a public URL:
```bash
ngrok http 5173
```

4. Use the generated ngrok URL in Cashfree Dashboard:
   - Go to "Settings" → "Webhooks"
   - Add webhook URL: `https://your-ngrok-url/api/webhooks/cashfree`
   - Example: `https://abc123.ngrok.io/api/webhooks/cashfree`

#### For Production
1. Use your production domain:
   - Webhook URL: `https://your-domain.com/api/webhooks/cashfree`
   - Example: `https://app.gigzs.com/api/webhooks/cashfree`

#### Webhook Configuration
1. Select Webhook Version: "2022-09-01"
2. Select events to receive:
   - PAYMENT_SUCCESS
   - PAYMENT_FAILURE
   - REFUND_SUCCESS
   - REFUND_FAILURE

3. Test the webhook:
   - Use Cashfree's "Test" button
   - Verify webhook receipt in your server logs
   - Check database updates

### 4. Environment Variables Setup

#### Local Development
1. Create a `.env` file in your project root:
```env
# Cashfree Payment Gateway Configuration
VITE_CASHFREE_API_URL=https://api.cashfree.com
VITE_CASHFREE_APP_ID=your_payment_gateway_app_id
VITE_CASHFREE_SECRET_KEY=your_payment_gateway_secret_key

# Cashfree Secure ID Configuration
VITE_CASHFREE_SECURE_ID_APP_ID=your_secure_id_app_id
VITE_CASHFREE_SECURE_ID_SECRET_KEY=your_secure_id_secret_key

# For test environment
VITE_CASHFREE_API_URL=https://test-api.cashfree.com
VITE_CASHFREE_APP_ID=your_test_payment_gateway_app_id
VITE_CASHFREE_SECRET_KEY=your_test_payment_gateway_secret_key
VITE_CASHFREE_SECURE_ID_APP_ID=your_test_secure_id_app_id
VITE_CASHFREE_SECURE_ID_SECRET_KEY=your_test_secure_id_secret_key
```

#### Production Environment
1. Set up environment variables in your hosting platform:

For Vercel:
```bash
# Payment Gateway
vercel env add VITE_CASHFREE_API_URL
vercel env add VITE_CASHFREE_APP_ID
vercel env add VITE_CASHFREE_SECRET_KEY

# Secure ID
vercel env add VITE_CASHFREE_SECURE_ID_APP_ID
vercel env add VITE_CASHFREE_SECURE_ID_SECRET_KEY
```

For Netlify:
```bash
# Payment Gateway
netlify env:set VITE_CASHFREE_API_URL "https://api.cashfree.com"
netlify env:set VITE_CASHFREE_APP_ID "your_payment_gateway_app_id"
netlify env:set VITE_CASHFREE_SECRET_KEY "your_payment_gateway_secret_key"

# Secure ID
netlify env:set VITE_CASHFREE_SECURE_ID_APP_ID "your_secure_id_app_id"
netlify env:set VITE_CASHFREE_SECURE_ID_SECRET_KEY "your_secure_id_secret_key"
```

### 5. Verify Setup

#### Test Payment Link
1. Create a test payment link using the Payment Gateway API
2. Verify the link is generated correctly
3. Make a test payment
4. Check webhook receipt

#### Test Secure ID
1. Test Secure ID integration
2. Verify secure authentication
3. Check response handling

### 6. Security Best Practices

1. Never commit `.env` files to version control
2. Use different API keys for development and production
3. Regularly rotate both Payment Gateway and Secure ID API keys
4. Monitor webhook activity
5. Keep all API credentials secure
6. Use Secure ID for additional security where applicable

### 7. Troubleshooting

#### Common Issues

1. Invalid API Credentials
   - Verify you're using the correct environment (test/production)
   - Check for typos in App ID and Secret Key
   - Ensure the API key is active
   - Verify you're using the correct type of API key (Payment Gateway vs Secure ID)

2. Webhook Not Receiving
   - Verify webhook URL is correct
   - Check if the server is accessible
   - Ensure proper event selection

3. Payment Link Issues
   - Verify API endpoint URL
   - Check request payload format
   - Ensure proper error handling
   - Verify Payment Gateway API keys are being used

4. Secure ID Issues
   - Verify Secure ID API keys are being used
   - Check Secure ID integration
   - Ensure proper error handling

### 8. Support Resources

- [Cashfree API Documentation](https://docs.cashfree.com)
- [Payment Gateway API Reference](https://docs.cashfree.com/payment-gateway)
- [Secure ID API Reference](https://docs.cashfree.com/secure-id)
- [Webhook Documentation](https://docs.cashfree.com/webhooks)
- [Test Card Details](https://docs.cashfree.com/test-cards)

### 9. Contact Support

- Technical Support: api-support@cashfree.com
- Business Support: business@cashfree.com
- Emergency Support: +91-XXXXXXXXXX (24/7) 