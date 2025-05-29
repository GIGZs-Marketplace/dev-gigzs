import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { cashfreeService } from '../services/cashfree.js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY;

console.log('Supabase Configuration:', {
    url: supabaseUrl,
    key: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : undefined
});

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testPaymentIntegration() {
    try {
        console.log('Starting payment integration test...');

        // 1. Create a test contract
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .insert({
                name: 'Test Contract',
                total_amount: 1000,
                client_id: 'test-client-id',
                freelancer_id: 'test-freelancer-id',
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (contractError) {
            throw new Error(`Failed to create test contract: ${contractError.message}`);
        }

        console.log('Test contract created:', contract);

        // 2. Create payment link
        const paymentLink = await cashfreeService.createPaymentLink({
            orderId: contract.id,
            amount: 500, // 50% upfront
            customerName: 'Test Customer',
            customerEmail: 'test@example.com',
            customerPhone: '+919876543210',
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_APP_URL}/payments/success`,
        });

        console.log('Payment link created:', paymentLink);

        // 3. Create payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
                contract_id: contract.id,
                amount: 500,
                type: 'upfront',
                status: 'pending',
                payment_link_id: paymentLink.link_id,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (paymentError) {
            throw new Error(`Failed to create payment record: ${paymentError.message}`);
        }

        console.log('Payment record created:', payment);

        // 4. Check payment status
        const paymentStatus = await cashfreeService.checkPaymentStatus(paymentLink.link_id);
        console.log('Payment status:', paymentStatus);

        // 5. Clean up test data
        await supabase
            .from('payments')
            .delete()
            .eq('contract_id', contract.id);

        await supabase
            .from('contracts')
            .delete()
            .eq('id', contract.id);

        console.log('Test completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testPaymentIntegration(); 