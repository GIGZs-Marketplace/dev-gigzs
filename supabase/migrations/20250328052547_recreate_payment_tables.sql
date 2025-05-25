/*
  # Recreate payment tables

  This migration recreates the payment-related tables after the projects table
  has been consolidated.
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type payment_type NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    cashfree_payment_link_id TEXT,
    cashfree_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create freelancer_wallets table
CREATE TABLE IF NOT EXISTS freelancer_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freelancer_id UUID REFERENCES freelancer_profiles(id) NOT NULL UNIQUE,
    available_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    reserved_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payout_requests table
CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freelancer_id UUID REFERENCES freelancer_profiles(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status payout_status NOT NULL DEFAULT 'pending',
    bank_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_webhooks table
CREATE TABLE IF NOT EXISTS payment_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
    DROP POLICY IF EXISTS "Users can view their own wallet" ON freelancer_wallets;
    DROP POLICY IF EXISTS "Users can view their own payout requests" ON payout_requests;
    DROP POLICY IF EXISTS "Users can create their own payout requests" ON payout_requests;
END $$;

-- Payments policies
CREATE POLICY "Users can view their own payments"
    ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = payments.project_id
            AND (
                EXISTS (
                    SELECT 1 FROM client_profiles
                    WHERE id = projects.client_id
                    AND user_id = auth.uid()
                )
                OR
                EXISTS (
                    SELECT 1 FROM freelancer_profiles
                    WHERE id = projects.freelancer_id
                    AND user_id = auth.uid()
                )
            )
        )
    );

-- Freelancer wallets policies
CREATE POLICY "Users can view their own wallet"
    ON freelancer_wallets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM freelancer_profiles
            WHERE id = freelancer_wallets.freelancer_id
            AND user_id = auth.uid()
        )
    );

-- Payout requests policies
CREATE POLICY "Users can view their own payout requests"
    ON payout_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM freelancer_profiles
            WHERE id = payout_requests.freelancer_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own payout requests"
    ON payout_requests FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM freelancer_profiles
            WHERE id = payout_requests.freelancer_id
            AND user_id = auth.uid()
        )
    ); 