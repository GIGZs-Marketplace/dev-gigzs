-- Create payment_status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
    END IF;
END
$$;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id TEXT NOT NULL,
    freelancer_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL,
    status payment_status DEFAULT 'PENDING',
    order_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create freelancer_wallets table
CREATE TABLE IF NOT EXISTS freelancer_wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    freelancer_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    project_id TEXT NOT NULL,
    payment_id TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_webhooks table
CREATE TABLE IF NOT EXISTS payment_webhooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id TEXT NOT NULL,
    status TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Enable read access for authenticated users" ON payments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON payments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON payments
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Freelancer wallets policies
CREATE POLICY "Enable read access for authenticated users" ON freelancer_wallets
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON freelancer_wallets
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Payment webhooks policies
CREATE POLICY "Enable read access for authenticated users" ON payment_webhooks
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON payment_webhooks
    FOR INSERT
    TO authenticated
    WITH CHECK (true); 