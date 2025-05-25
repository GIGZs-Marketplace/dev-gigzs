-- Create enum types
CREATE TYPE payment_status AS ENUM ('pending', 'half_paid', 'paid', 'failed');
CREATE TYPE payment_type AS ENUM ('advance', 'completion');
CREATE TYPE payout_status AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- Create projects table if not exists
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    client_id UUID REFERENCES auth.users(id) NOT NULL,
    freelancer_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'created',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
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
CREATE TABLE freelancer_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freelancer_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    available_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    reserved_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payout_requests table
CREATE TABLE payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freelancer_id UUID REFERENCES auth.users(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status payout_status NOT NULL DEFAULT 'pending',
    bank_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_webhooks table
CREATE TABLE payment_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects"
    ON projects FOR SELECT
    USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

CREATE POLICY "Users can create projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = client_id);

-- Payments policies
CREATE POLICY "Users can view their own payments"
    ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = payments.project_id
            AND (projects.client_id = auth.uid() OR projects.freelancer_id = auth.uid())
        )
    );

-- Freelancer wallets policies
CREATE POLICY "Users can view their own wallet"
    ON freelancer_wallets FOR SELECT
    USING (auth.uid() = freelancer_id);

-- Payout requests policies
CREATE POLICY "Users can view their own payout requests"
    ON payout_requests FOR SELECT
    USING (auth.uid() = freelancer_id);

CREATE POLICY "Users can create their own payout requests"
    ON payout_requests FOR INSERT
    WITH CHECK (auth.uid() = freelancer_id);

-- Create functions
CREATE OR REPLACE FUNCTION update_project_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paid' THEN
        UPDATE projects
        SET status = CASE
            WHEN EXISTS (
                SELECT 1 FROM payments
                WHERE project_id = NEW.project_id
                AND payment_type = 'advance'
                AND status = 'paid'
            ) THEN 'half_paid'
            ELSE 'paid'
            END
        WHERE id = NEW.project_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_project_payment_status_trigger
    AFTER UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_project_payment_status(); 