# Payment System Documentation

## Overview
The payment system implements a two-part payment structure for projects, where clients pay 50% upfront and 50% upon project completion. The system integrates with Cashfree Payment Gateway for secure payment processing and includes features for managing freelancer wallets and payouts.

## Architecture

### Database Schema

#### Projects Table
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    client_id UUID REFERENCES auth.users(id),
    freelancer_id UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'created'
);
```

#### Payments Table
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_type payment_type NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    cashfree_payment_link_id TEXT,
    cashfree_payment_id TEXT
);
```

#### Freelancer Wallets Table
```sql
CREATE TABLE freelancer_wallets (
    id UUID PRIMARY KEY,
    freelancer_id UUID REFERENCES auth.users(id),
    available_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    reserved_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_earned DECIMAL(10,2) NOT NULL DEFAULT 0
);
```

#### Payout Requests Table
```sql
CREATE TABLE payout_requests (
    id UUID PRIMARY KEY,
    freelancer_id UUID REFERENCES auth.users(id),
    amount DECIMAL(10,2) NOT NULL,
    status payout_status NOT NULL DEFAULT 'pending',
    bank_details JSONB
);
```

## Payment Flow

### 1. Project Creation
- System creates a payment record for advance payment (50% of total)
- Generates Cashfree payment link
- Updates project status to "created"

### 2. Advance Payment
- Client receives payment link
- Upon successful payment:
  - System updates payment status to "paid"
  - Updates project status to "half_paid"
  - Credits freelancer's wallet (minus platform fees)
  - Maintains $100 as reserved balance

### 3. Project Completion
- System creates payment record for completion payment (50%)
- Generates new Cashfree payment link
- Sends to client

### 4. Completion Payment
- Similar to advance payment
- Updates project status to "paid"
- Credits freelancer's wallet with remaining amount

## Freelancer Wallet

### Features
- View available balance
- View reserved balance
- View total earnings
- Request payouts
- Track payout request status

### Payout Process
1. Freelancer requests payout
2. System verifies available balance
3. Creates payout request record
4. Updates wallet balance
5. Admin processes payout
6. Updates payout request status

## Security

### Webhook Security
- Verifies Cashfree webhook signatures
- Stores webhook payloads for audit
- Implements rate limiting
- Uses HTTPS for all communications

### Data Protection
- Row Level Security (RLS) policies
- Encrypted bank details
- Secure API endpoints
- Environment variable configuration

## API Endpoints

### Payment Links
```typescript
POST /api/payments/create
{
    projectId: string,
    amount: number,
    type: 'advance' | 'completion'
}
```

### Webhooks
```typescript
POST /api/webhooks/cashfree
{
    signature: string,
    payload: object
}
```

### Payout Requests
```typescript
POST /api/payouts/request
{
    amount: number,
    bankDetails: {
        accountNumber: string,
        accountHolderName: string,
        bankName: string,
        ifscCode: string
    }
}
```

## Environment Variables

```env
VITE_CASHFREE_API_URL=https://api.cashfree.com
VITE_CASHFREE_APP_ID=your_app_id
VITE_CASHFREE_SECRET_KEY=your_secret_key
```

## Error Handling

### Common Errors
1. Insufficient Balance
2. Invalid Payment Link
3. Webhook Signature Mismatch
4. Database Transaction Failures

### Error Responses
```typescript
{
    error: string,
    code: string,
    details?: object
}
```

## Monitoring and Logging

### Logged Events
- Payment creation
- Payment status updates
- Webhook receipts
- Payout requests
- Wallet updates

### Monitoring Metrics
- Payment success rate
- Average processing time
- Failed payment rate
- Payout processing time

## Testing

### Test Cases
1. Payment link generation
2. Webhook handling
3. Wallet updates
4. Payout processing
5. Error scenarios

### Test Environment
- Use Cashfree test credentials
- Mock webhook calls
- Test database transactions
- Verify security measures 