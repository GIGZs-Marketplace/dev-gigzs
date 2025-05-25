# Payment System API Documentation

## API Endpoints

### 1. Payment Link Generation
```http
POST /api/payments/create-link
Content-Type: application/json

{
  "projectId": "string",
  "amount": number,
  "type": "advance" | "completion"
}
```

**Response:**
```json
{
  "success": true,
  "paymentLink": "string",
  "paymentId": "string"
}
```

### 2. Webhook Handler
```http
POST /api/webhooks/cashfree
Content-Type: application/json
x-webhook-signature: string

{
  "signature": "string",
  "data": {
    "event_type": "PAYMENT_SUCCESS",
    "order": {
      "order_id": "string"
    },
    "payment": {
      "payment_id": "string"
    }
  }
}
```

**Response:**
```json
{
  "success": true
}
```

### 3. Payout Request
```http
POST /api/payouts/request
Content-Type: application/json

{
  "amount": number,
  "bankDetails": {
    "accountNumber": "string",
    "accountHolderName": "string",
    "bankName": "string",
    "ifscCode": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "payoutRequestId": "string"
}
```

### 4. Admin Payout Approval
```http
POST /api/admin/approve-payout
Content-Type: application/json

{
  "payoutRequestId": "string"
}
```

**Response:**
```json
{
  "success": true
}
```

## Integration Guidelines

### 1. Authentication
- All API requests require authentication
- Use JWT tokens for authentication
- Include token in Authorization header
- Token expiration: 24 hours

### 2. Error Handling
- HTTP status codes
- Error response format
- Rate limiting
- Retry policies

### 3. Webhook Integration
- Webhook URL configuration
- Signature verification
- Retry mechanism
- Error handling

### 4. Testing
- Test environment setup
- Test credentials
- Mock webhook testing
- Integration testing

## API Best Practices

### 1. Request Format
- Use JSON for request/response
- Include proper headers
- Validate input data
- Handle timeouts

### 2. Response Format
- Consistent response structure
- Error message format
- Status codes
- Pagination

### 3. Security
- HTTPS only
- API key rotation
- Rate limiting
- Input validation

### 4. Monitoring
- API usage metrics
- Error tracking
- Performance monitoring
- Usage limits

## Example Implementations

### 1. Payment Link Generation
```javascript
const response = await fetch('/api/payments/create-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    projectId: '123',
    amount: 1000,
    type: 'advance'
  })
});
```

### 2. Webhook Handler
```javascript
app.post('/api/webhooks/cashfree', async (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  // Verify signature
  // Process webhook
  res.json({ success: true });
});
```

### 3. Payout Request
```javascript
const response = await fetch('/api/payouts/request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: 500,
    bankDetails: {
      accountNumber: '1234567890',
      accountHolderName: 'John Doe',
      bankName: 'Example Bank',
      ifscCode: 'EXBK0001234'
    }
  })
});
``` 