# Payment System Database Documentation

## Database Schema

### 1. Projects Table
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    client_id UUID REFERENCES auth.users(id),
    freelancer_id UUID REFERENCES auth.users(id),
    total_amount DECIMAL(10,2),
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Payments Table
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    amount DECIMAL(10,2),
    payment_type VARCHAR(50),
    status VARCHAR(50),
    cashfree_payment_link_id VARCHAR(255),
    cashfree_payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Freelancer Wallets Table
```sql
CREATE TABLE freelancer_wallets (
    id UUID PRIMARY KEY,
    freelancer_id UUID REFERENCES auth.users(id),
    available_balance DECIMAL(10,2),
    reserved_balance DECIMAL(10,2),
    total_earned DECIMAL(10,2),
    paid_balance DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Payout Requests Table
```sql
CREATE TABLE payout_requests (
    id UUID PRIMARY KEY,
    freelancer_id UUID REFERENCES auth.users(id),
    amount DECIMAL(10,2),
    status VARCHAR(50),
    bank_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    message TEXT,
    type VARCHAR(50),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. Payment Webhooks Table
```sql
CREATE TABLE payment_webhooks (
    id UUID PRIMARY KEY,
    payment_id UUID REFERENCES payments(id),
    event_type VARCHAR(50),
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Relationships

### 1. Project Relationships
- Projects → Client (One-to-One)
- Projects → Freelancer (One-to-One)
- Projects → Payments (One-to-Many)

### 2. Payment Relationships
- Payments → Project (Many-to-One)
- Payments → Webhooks (One-to-Many)

### 3. Wallet Relationships
- Wallets → Freelancer (One-to-One)
- Wallets → Payout Requests (One-to-Many)

### 4. Notification Relationships
- Notifications → User (Many-to-One)

## Data Management

### 1. Indexes
```sql
-- Projects
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_freelancer_id ON projects(freelancer_id);

-- Payments
CREATE INDEX idx_payments_project_id ON payments(project_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Wallets
CREATE INDEX idx_wallets_freelancer_id ON freelancer_wallets(freelancer_id);

-- Payout Requests
CREATE INDEX idx_payout_requests_freelancer_id ON payout_requests(freelancer_id);
CREATE INDEX idx_payout_requests_status ON payout_requests(status);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

### 2. Constraints
- Foreign key constraints for referential integrity
- Check constraints for amount validation
- Unique constraints for payment IDs
- Not null constraints for required fields

### 3. Triggers
- Update timestamps on record modification
- Maintain $100 reserve balance
- Log payment status changes
- Track wallet balance changes

## Data Operations

### 1. Common Queries
```sql
-- Get freelancer wallet balance
SELECT available_balance, reserved_balance 
FROM freelancer_wallets 
WHERE freelancer_id = :id;

-- Get pending payout requests
SELECT * FROM payout_requests 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- Get payment history
SELECT p.*, pr.title as project_title 
FROM payments p 
JOIN projects pr ON p.project_id = pr.id 
WHERE pr.freelancer_id = :id;
```

### 2. Data Maintenance
- Regular backup procedures
- Data archival strategy
- Cleanup of old records
- Data integrity checks

### 3. Performance Optimization
- Query optimization
- Index maintenance
- Connection pooling
- Caching strategy 