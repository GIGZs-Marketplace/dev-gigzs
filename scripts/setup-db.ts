import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
}

console.log('Initializing Supabase client...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
    try {
        console.log('Setting up database tables...');

        // Create payment_status enum type
        console.log('Creating payment_status enum...');
        await supabase.rpc('create_payment_status_enum', {
            sql: `
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
                        CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
                    END IF;
                END
                $$;
            `
        });

        // Create payments table
        console.log('Creating payments table...');
        await supabase.rpc('create_payments_table', {
            sql: `
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
            `
        });

        // Create freelancer_wallets table
        console.log('Creating freelancer_wallets table...');
        await supabase.rpc('create_freelancer_wallets_table', {
            sql: `
                CREATE TABLE IF NOT EXISTS freelancer_wallets (
                    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                    freelancer_id TEXT NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    project_id TEXT NOT NULL,
                    payment_id TEXT NOT NULL,
                    type TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        });

        // Create payment_webhooks table
        console.log('Creating payment_webhooks table...');
        await supabase.rpc('create_payment_webhooks_table', {
            sql: `
                CREATE TABLE IF NOT EXISTS payment_webhooks (
                    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                    order_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    payload JSONB NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        });

        console.log('Database setup completed successfully!');
    } catch (error) {
        console.error('Error setting up database:', error);
        if (error.message) console.error('Error message:', error.message);
        if (error.details) console.error('Error details:', error.details);
        if (error.hint) console.error('Error hint:', error.hint);
        process.exit(1);
    }
}

setupDatabase().catch(error => {
    console.error('Unhandled error:', error);
    if (error.message) console.error('Error message:', error.message);
    if (error.details) console.error('Error details:', error.details);
    if (error.hint) console.error('Error hint:', error.hint);
    process.exit(1); 