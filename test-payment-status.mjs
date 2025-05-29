import axios from 'axios';

// Cashfree API configuration
const CASHFREE_API_URL = 'https://sandbox.cashfree.com/pg';
const CASHFREE_APP_ID = 'TEST102744956523f3bc30ce34e40ed959447201';
const CASHFREE_SECRET_KEY = 'cfsk_ma_test_b36c50735bdc5bfe7ad07ceeb3fee0e5_4b774b07';

async function checkPaymentStatus(linkId) {
    try {
        console.log('Checking Payment Status...');
        console.log('Link ID:', linkId);
        
        const response = await axios.get(
            `${CASHFREE_API_URL}/links/${linkId}`,
            {
                headers: {
                    'x-api-version': '2022-09-01',
                    'x-client-id': CASHFREE_APP_ID,
                    'x-client-secret': CASHFREE_SECRET_KEY
                }
            }
        );

        console.log('\nPayment Status Details:');
        console.log('------------------------');
        console.log('Link ID:', response.data.link_id);
        console.log('Status:', response.data.link_status);
        console.log('Amount:', response.data.link_amount);
        console.log('Currency:', response.data.link_currency);
        console.log('Created At:', response.data.link_created_at);
        console.log('Expiry Time:', response.data.link_expiry_time);
        
        if (response.data.link_payments) {
            console.log('\nPayment Details:');
            console.log('----------------');
            response.data.link_payments.forEach(payment => {
                console.log('\nPayment ID:', payment.payment_id);
                console.log('Payment Status:', payment.payment_status);
                console.log('Payment Amount:', payment.payment_amount);
                console.log('Payment Time:', payment.payment_time);
            });
        }
    } catch (error) {
        console.error('Error checking payment status:', error.response?.data || error.message);
    }
}

// Get link ID from command line arguments
const linkId = process.argv[2];
if (!linkId) {
    console.error('Please provide a link ID as an argument');
    console.error('Usage: node test-payment-status.mjs <link_id>');
    process.exit(1);
}

checkPaymentStatus(linkId); 