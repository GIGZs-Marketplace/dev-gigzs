# Payment Integration Testing Guide

## Prerequisites

1. Environment Variables
```env
VITE_SUPABASE_URL=https://fjbmwwenrqnjewtqwrsy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqYm13d2VucnFuamV3dHF3cnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyOTYzNzMsImV4cCI6MjA2MTg3MjM3M30.j2ecDXfBYEVDUi6nL-UjEUUiKO_kj1sajzk91mPPLi4
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

VITE_CASHFREE_API_URL=https://api.cashfree.com
VITE_CASHFREE_APP_ID=TEST102744956523f3bc30ce34e40ed959447201
VITE_CASHFREE_SECRET_KEY=cfsk_ma_test_b36c50735bdc5bfe7ad07ceeb3fee0e5_4b774b07

VITE_CASHFREE_SECURE_ID_APP_ID=CF10274495D0F3J1GJ2JFC73CVLGQG
VITE_CASHFREE_SECURE_ID_SECRET_KEY=cfsk_ma_test_435028927e884d4e44c5669a0cc7da45_0344b8b0

# Webhook Configuration
VITE_WEBHOOK_SECRET=33d370431641ec052b5feb71da2656c129a2f0a74bf09c224ac6912e2f175f40
VITE_WEBHOOK_URL=https://c077-4-227-178-56.ngrok-free.app/api/payments/webhook

# App Configuration
VITE_APP_URL=http://localhost:3000
```

## Setup Steps

1. Start the Development Server
```bash
npm run dev:full
```

2. Start ngrok in a new terminal
```bash
ngrok http 3000
```

3. Configure Cashfree Webhook
   - Go to Cashfree Dashboard
   - Navigate to Webhook Settings
   - Add New Webhook with these details:
     - Endpoint URL: `https://c077-4-227-178-56.ngrok-free.app/api/payments/webhook`
     - Webhook Version: 2022-09-01
     - Events to Subscribe:
       - `payment_link.paid`
       - `payment_link.expired`
       - `payment_link.cancelled`
     - Secret: `33d370431641ec052b5feb71da2656c129a2f0a74bf09c224ac6912e2f175f40`

## Test Cases

### 1. Initial Payment (50% Upfront)

1. Navigate to Payment Test Page
   ```
   http://localhost:3000/payment-test
   ```

2. Create Test Payment
   - Click "Pay 50% Upfront"
   - You'll be redirected to Cashfree payment page

3. Use Test Card Details
   - Card Number: 4111 1111 1111 1111
   - Expiry: Any future date
   - CVV: Any 3 digits
   - OTP: 123456

4. Expected Results
   - Payment status should update to "half_paid"
   - Webhook should receive `payment_link.paid` event
   - Freelancer wallet should be credited with 50% amount (minus platform fee)

### 2. Final Payment (Remaining 50%)

1. Wait for project completion
2. Click "Pay Remaining 50%"
3. Use same test card details
4. Expected Results
   - Payment status should update to "paid"
   - Webhook should receive `payment_link.paid` event
   - Freelancer wallet should be credited with remaining amount

### 3. Payment Expiry Test

1. Create a new payment
2. Don't complete the payment
3. Wait for payment link to expire
4. Expected Results
   - Webhook should receive `payment_link.expired` event
   - Payment status should update to "expired"

### 4. Payment Cancellation Test

1. Create a new payment
2. Start payment process
3. Cancel the payment
4. Expected Results
   - Webhook should receive `payment_link.cancelled` event
   - Payment status should update to "cancelled"

## Monitoring

1. Watch ngrok Web Interface
   ```
   http://127.0.0.1:4040
   ```
   - Shows all incoming webhook requests
   - Allows inspection of request/response data

2. Check Server Logs
   - Payment creation
   - Webhook events
   - Database updates
   - Error messages

3. Verify Database Updates
   - Payment status changes
   - Wallet balance updates
   - Webhook event logs

## Troubleshooting

1. Webhook Not Receiving Events
   - Verify ngrok URL is correct
   - Check webhook secret matches
   - Ensure server is running
   - Check CORS settings

2. Payment Status Not Updating
   - Check webhook logs
   - Verify database connection
   - Check payment ID mapping

3. Wallet Not Updating
   - Verify payment amount calculation
   - Check platform fee calculation
   - Ensure freelancer ID is correct

## Test Data

### Sample Contract
```json
{
  "id": "test-contract-1",
  "amount": 1000,
  "client": {
    "email": "test@example.com",
    "phone": "+919876543210"
  }
}
```

### Expected Wallet Updates
- Initial Payment (50%): ₹500 - Platform Fee (10%) = ₹450
- Final Payment (50%): ₹500 - Platform Fee (10%) = ₹450
- Total Credit: ₹900

## Notes

1. All transactions are in test mode
2. No real money is involved
3. Test card details work only in sandbox environment
4. Webhook events may take a few seconds to process
5. Keep ngrok running during testing 