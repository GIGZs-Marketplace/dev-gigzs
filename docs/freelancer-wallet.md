# Freelancer Wallet System

## Overview
The freelancer wallet system manages earnings, payouts, and financial transactions for freelancers on the platform. It includes features for tracking available balance, reserved balance, and total earnings, as well as processing payout requests.

## Database Schema

### Freelancer Wallets Table
```sql
CREATE TABLE freelancer_wallets (
    id UUID PRIMARY KEY,
    freelancer_id UUID REFERENCES auth.users(id),
    available_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    reserved_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_earned DECIMAL(10,2) NOT NULL DEFAULT 0
);
```

### Payout Requests Table
```sql
CREATE TABLE payout_requests (
    id UUID PRIMARY KEY,
    freelancer_id UUID REFERENCES auth.users(id),
    amount DECIMAL(10,2) NOT NULL,
    status payout_status NOT NULL DEFAULT 'pending',
    bank_details JSONB
);
```

## Features

### Balance Management
1. Available Balance
   - Funds ready for withdrawal
   - Updated after project completion
   - Used for payout requests

2. Reserved Balance
   - Minimum $100 maintained
   - Ensures platform security
   - Released after project completion

3. Total Earnings
   - Cumulative earnings
   - Includes all completed projects
   - Excludes platform fees

### Payout System

#### Request Process
1. Freelancer initiates payout
2. System verifies available balance
3. Creates payout request record
4. Updates wallet balance
5. Admin processes payout
6. Updates request status

#### Bank Details
```typescript
interface BankDetails {
    accountNumber: string;
    accountHolderName: string;
    bankName: string;
    ifscCode: string;
}
```

## API Endpoints

### Wallet Operations
```typescript
// Get wallet balance
GET /api/wallet/balance

// Request payout
POST /api/wallet/payout
{
    amount: number,
    bankDetails: BankDetails
}

// Get payout history
GET /api/wallet/payouts
```

## Security

### Data Protection
1. Encrypted bank details
2. Row Level Security (RLS)
3. Secure API endpoints
4. Audit logging

### Access Control
1. Freelancer can only access their wallet
2. Admin access for payout processing
3. Read-only access for clients

## User Interface

### Wallet Dashboard
1. Available Balance Display
2. Reserved Balance Display
3. Total Earnings Display
4. Payout Request Form
5. Transaction History

### Payout Request Form
1. Amount Input
2. Bank Details Form
3. Validation Rules
4. Confirmation Dialog

## Error Handling

### Common Errors
1. Insufficient Balance
2. Invalid Bank Details
3. Payout Limit Exceeded
4. Processing Failure

### Error Messages
```typescript
interface WalletError {
    code: string;
    message: string;
    details?: object;
}
```

## Monitoring

### Key Metrics
1. Payout success rate
2. Average processing time
3. Failed payout rate
4. Wallet balance trends

### Logging
1. Balance updates
2. Payout requests
3. Bank detail changes
4. Error events

## Testing

### Test Cases
1. Balance calculations
2. Payout processing
3. Bank detail validation
4. Error handling
5. Security measures

### Test Environment
1. Test database
2. Mock payment system
3. Test bank accounts
4. Error simulation

## Maintenance

### Regular Tasks
1. Balance reconciliation
2. Transaction verification
3. Security audit
4. Performance monitoring

### Backup Procedures
1. Daily wallet backups
2. Transaction logs
3. Bank detail encryption
4. Recovery procedures

## Support

### User Support
1. Balance inquiries
2. Payout issues
3. Bank detail updates
4. Transaction disputes

### Technical Support
1. System maintenance
2. Security updates
3. Performance optimization
4. Bug fixes 