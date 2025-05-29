# Cashfree Payment Integration Testing Guide

## Quick Start

1. **Setup Test Environment**
   ```bash
   # Install dependencies
   npm install axios
   
   # Create payment link
   node test-payment.mjs
   
   # Check payment status
   node test-payment-status.mjs <link_id>
   ```

2. **Test Credentials**
   - App ID: `TEST102744956523f3bc30ce34e40ed959447201`
   - Secret Key: `cfsk_ma_test_b36c50735bdc5bfe7ad07ceeb3fee0e5_4b774b07`
   - API URL: `https://sandbox.cashfree.com/pg`

## Test Card Details

### Success Scenarios
1. **Successful Payment**
   - Card: 4111 1111 1111 1111
   - Expiry: Any future date
   - CVV: Any 3 digits
   - OTP: 123456

2. **International Card**
   - Card: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVV: Any 3 digits
   - OTP: 123456

### Failure Scenarios
1. **Insufficient Funds**
   - Card: 4111 1111 1111 1111
   - Amount: 999999
   - OTP: 123456

2. **Invalid OTP**
   - Card: 4111 1111 1111 1111
   - OTP: 000000

3. **Card Declined**
   - Card: 4000 0000 0000 0002
   - OTP: 123456

## UI Testing Guide

### 1. Creating a Payment Link
1. Run the test payment script:
   ```bash
   node test-payment.mjs
   ```
2. You'll receive a payment link like: `https://payments-test.cashfree.com/links/xxxxx`

### 2. Testing Payment Flow
1. **Open the Payment Link**
   - Click on the generated payment link
   - You'll be redirected to Cashfree's test payment page

2. **Enter Card Details**
   - Select "Credit/Debit Card" as payment method
   - Enter test card details based on scenario:
     ```
     Card Number: 4111 1111 1111 1111
     Expiry: Any future date (e.g., 12/25)
     CVV: Any 3 digits (e.g., 123)
     ```

3. **Complete Payment**
   - Click "Pay Now"
   - Enter OTP: 123456
   - Click "Verify"

4. **Verify Payment Status**
   ```bash
   node test-payment-status.mjs <link_id>
   ```
   Expected status: `PAID`

### 3. Testing Different Scenarios

#### 3.1 Test Successful Payment
1. Use card: 4111 1111 1111 1111
2. Enter any future expiry date
3. Enter any 3-digit CVV
4. Use OTP: 123456
Expected Result: Payment successful

#### 3.2 Test International Card
1. Use card: 4242 4242 4242 4242
2. Enter any future expiry date
3. Enter any 3-digit CVV
4. Use OTP: 123456
Expected Result: Payment successful

#### 3.3 Test Insufficient Funds
1. Use card: 4111 1111 1111 1111
2. Set amount to 999999
3. Enter any future expiry date
4. Enter any 3-digit CVV
5. Use OTP: 123456
Expected Result: Payment failed with insufficient funds error

#### 3.4 Test Invalid OTP
1. Use card: 4111 1111 1111 1111
2. Enter any future expiry date
3. Enter any 3-digit CVV
4. Use OTP: 000000
Expected Result: Payment failed with invalid OTP error

#### 3.5 Test Card Declined
1. Use card: 4000 0000 0000 0002
2. Enter any future expiry date
3. Enter any 3-digit CVV
4. Use OTP: 123456
Expected Result: Payment failed with card declined error

## Command Line Testing

### 1. Create Payment Link
```bash
node test-payment.mjs
```
Expected output:
```json
{
    "link_id": "TEST_123456789",
    "link_url": "https://payments.cashfree.com/...",
    "link_status": "ACTIVE",
    "link_amount": 100,
    "link_currency": "INR"
}
```

### 2. Check Payment Status
```bash
node test-payment-status.mjs <link_id>
```
Possible status values:
- `ACTIVE`: Link is active and can accept payments
- `PAID`: Payment has been completed
- `EXPIRED`: Link has expired
- `CANCELLED`: Link has been cancelled

## Webhook Testing

1. **Setup ngrok**
   ```bash
   ngrok http 3000
   ```

2. **Update Webhook URL**
   - Go to Cashfree Dashboard
   - Settings → Webhooks
   - Add URL: `https://your-ngrok-url/webhook`

3. **Test Webhook Events**
   - `payment.success`: Payment completed successfully
   - `payment.failed`: Payment failed
   - `link.expired`: Payment link expired

## Common Issues & Solutions

### 1. Authentication Failed
```json
{
    "message": "Authentication failed",
    "code": "auth_failed"
}
```
**Solution:**
- Verify App ID and Secret Key
- Check if test mode is enabled
- Ensure Payment Gateway is activated

### 2. Payment Gateway Inactive
```json
{
    "message": "payment gateway product is not activated",
    "code": "payment_gateway_inactive"
}
```
**Solution:**
- Activate Payment Gateway in test mode
- Contact Cashfree support if issue persists

### 3. Invalid Request
```json
{
    "message": "Invalid request",
    "code": "invalid_request"
}
```
**Solution:**
- Check API version
- Verify request payload format
- Ensure all required fields are present

## Security Checklist

- [ ] Never commit credentials to version control
- [ ] Use environment variables for sensitive data
- [ ] Always use test mode for development
- [ ] Regularly rotate test credentials
- [ ] Validate webhook signatures
- [ ] Use HTTPS for all API calls
- [ ] Implement proper error handling
- [ ] Log all payment events

## Support Resources

- [API Documentation](https://docs.cashfree.com/docs)
- [Test Mode Guide](https://docs.cashfree.com/docs/test-mode)
- [API Status](https://status.cashfree.com)
- [Support Email](support@cashfree.com)
- [Developer Community](https://community.cashfree.com)

## Payment Flows

### Freelancer Payment Flow

1. **Project Completion**
   - Freelancer marks project as completed
   - System generates payment request
   - Client receives notification

2. **Payment Initiation**
   ```bash
   # Create payment link for freelancer
   node test-payment.mjs --type freelancer --amount <amount> --freelancer_id <id>
   ```
   Expected output:
   ```json
   {
       "link_id": "FREELANCER_123456789",
       "link_url": "https://payments-test.cashfree.com/links/...",
       "link_status": "ACTIVE",
       "link_amount": 1000,
       "link_currency": "INR",
       "freelancer_details": {
           "name": "John Doe",
           "email": "john@example.com",
           "account_id": "ACC123"
       }
   }
   ```

3. **Payment Processing**
   - Client receives payment link
   - Client completes payment using test cards
   - System updates project status
   - Freelancer receives payment confirmation

4. **Payment Status Check**
   ```bash
   # Check freelancer payment status
   node test-payment-status.mjs FREELANCER_123456789
   ```
   Possible statuses:
   - `PENDING`: Payment initiated but not completed
   - `PAID`: Payment successful
   - `FAILED`: Payment failed
   - `REFUNDED`: Payment refunded

### Client Payment Flow

1. **Project Initiation**
   - Client creates new project
   - System generates initial payment request
   - Freelancer receives project details

2. **Payment Initiation**
   ```bash
   # Create payment link for client
   node test-payment.mjs --type client --amount <amount> --project_id <id>
   ```
   Expected output:
   ```json
   {
       "link_id": "CLIENT_123456789",
       "link_url": "https://payments-test.cashfree.com/links/...",
       "link_status": "ACTIVE",
       "link_amount": 500,
       "link_currency": "INR",
       "project_details": {
           "project_id": "PROJ123",
           "title": "Website Development",
           "milestone": "Initial Payment"
       }
   }
   ```

3. **Payment Processing**
   - Client receives payment link
   - Client completes payment using test cards
   - System updates project status
   - Freelancer receives project initiation confirmation

4. **Payment Status Check**
   ```bash
   # Check client payment status
   node test-payment-status.mjs CLIENT_123456789
   ```
   Possible statuses:
   - `PENDING`: Payment initiated but not completed
   - `PAID`: Payment successful
   - `FAILED`: Payment failed
   - `REFUNDED`: Payment refunded

### Test Scenarios for Both Flows

1. **Successful Payment**
   ```
   Card: 4111 1111 1111 1111
   Expiry: Any future date
   CVV: Any 3 digits
   OTP: 123456
   ```
   Expected Result: Payment successful, status updates to `PAID`

2. **Payment Failure**
   ```
   Card: 4000 0000 0000 0002
   Expiry: Any future date
   CVV: Any 3 digits
   OTP: 123456
   ```
   Expected Result: Payment failed, status updates to `FAILED`

3. **Refund Process**
   ```bash
   # Initiate refund
   node test-refund.mjs <payment_id>
   ```
   Expected output:
   ```json
   {
       "refund_id": "REF_123456789",
       "status": "PROCESSING",
       "amount": 1000,
       "currency": "INR"
   }
   ```

### Webhook Events for Payment Flows

1. **Freelancer Payment Events**
   - `freelancer.payment.initiated`
   - `freelancer.payment.completed`
   - `freelancer.payment.failed`
   - `freelancer.payment.refunded`

2. **Client Payment Events**
   - `client.payment.initiated`
   - `client.payment.completed`
   - `client.payment.failed`
   - `client.payment.refunded`

### Security Considerations

1. **Payment Link Security**
   - Links expire after 24 hours
   - One-time use only
   - HTTPS encryption
   - IP-based restrictions

2. **Data Protection**
   - Encrypt sensitive payment data
   - Mask card details
   - Secure storage of payment records
   - Regular security audits

3. **Compliance**
   - PCI DSS compliance
   - GDPR compliance
   - Local payment regulations
   - Data retention policies 