import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
}

console.log('Initializing Supabase client...');
console.log('Using Supabase URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false
    }
});

async function checkTables() {
    console.log('Checking if required tables exist...');
    
    try {
        // Check payments table
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('count')
            .limit(1);
        
        if (paymentsError) {
            console.error('Error accessing payments table:', paymentsError);
            throw new Error(`Payments table not accessible: ${paymentsError.message}`);
        }
        console.log('✓ Payments table exists');

        // Check freelancer_wallets table
        const { data: wallets, error: walletsError } = await supabase
            .from('freelancer_wallets')
            .select('count')
            .limit(1);
        
        if (walletsError) {
            console.error('Error accessing freelancer_wallets table:', walletsError);
            throw new Error(`Freelancer wallets table not accessible: ${walletsError.message}`);
        }
        console.log('✓ Freelancer wallets table exists');
    } catch (error) {
        console.error('Error checking tables:', error);
        throw error;
    }
}

async function createTestPayment() {
    try {
        console.log('\nCreating test payment...');
        const testPayment = {
            project_id: 'test-project-1',
            freelancer_id: 'test-freelancer-1',
            amount: 1000,
            type: 'UPFRONT',
            status: 'PENDING',
            order_id: `TEST_${Date.now()}`
        };
        console.log('Payment data:', testPayment);

        const { data: payment, error } = await supabase
            .from('payments')
            .insert(testPayment)
            .select()
            .single();

        if (error) {
            console.error('Supabase error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }

        console.log('Test payment created successfully:', payment);
        return payment;
    } catch (error) {
        console.error('Error creating test payment:', error);
        throw error;
    }
}

async function simulatePaymentSuccess(paymentId: string) {
    try {
        console.log('\nSimulating payment success...');
        console.log('Updating payment ID:', paymentId);
        
        // Update payment status
        const { data: updatedPayment, error: updateError } = await supabase
            .from('payments')
            .update({ status: 'PAID' })
            .eq('id', paymentId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating payment:', updateError);
            throw updateError;
        }

        console.log('Payment status updated successfully');

        // Create wallet entry
        console.log('Creating wallet entry...');
        const walletData = {
            freelancer_id: updatedPayment.freelancer_id,
            amount: updatedPayment.amount,
            project_id: updatedPayment.project_id,
            payment_id: updatedPayment.order_id,
            type: 'CREDIT'
        };
        console.log('Wallet entry data:', walletData);

        const { data: walletEntry, error: walletError } = await supabase
            .from('freelancer_wallets')
            .insert(walletData)
            .select()
            .single();

        if (walletError) {
            console.error('Error creating wallet entry:', walletError);
            throw walletError;
        }

        console.log('Payment process completed successfully');
        console.log('Updated payment:', updatedPayment);
        console.log('Wallet entry created:', walletEntry);
    } catch (error) {
        console.error('Error simulating payment success:', error);
        throw error;
    }
}

// Run the test
async function runTest() {
    try {
        console.log('Starting payment test...');
        await checkTables();
        const payment = await createTestPayment();
        console.log('\nWaiting 5 seconds before simulating payment success...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await simulatePaymentSuccess(payment.id);
        console.log('\nTest completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
        if (error.message) console.error('Error message:', error.message);
        if (error.details) console.error('Error details:', error.details);
        if (error.hint) console.error('Error hint:', error.hint);
        process.exit(1);
    }
}

runTest().catch(error => {
    console.error('Unhandled error:', error);
    if (error.message) console.error('Error message:', error.message);
    if (error.details) console.error('Error details:', error.details);
    if (error.hint) console.error('Error hint:', error.hint);
    process.exit(1); 
}

runTest().catch(error => {
    console.error('Unhandled error:', error);
    if (error.message) console.error('Error message:', error.message);
    if (error.details) console.error('Error details:', error.details);
    if (error.hint) console.error('Error hint:', error.hint);
    process.exit(1); 