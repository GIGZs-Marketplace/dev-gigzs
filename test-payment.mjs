import axios from 'axios';

// Cashfree API configuration
const CASHFREE_API_URL = 'https://sandbox.cashfree.com/pg';  // Using sandbox/test environment
const CASHFREE_APP_ID = 'TEST102744956523f3bc30ce34e40ed959447201';
const CASHFREE_SECRET_KEY = 'cfsk_ma_test_b36c50735bdc5bfe7ad07ceeb3fee0e5_4b774b07';

async function testPayment() {
    try {
        console.log('Testing Cashfree Payment Integration...');
        
        const response = await axios.post(
            `${CASHFREE_API_URL}/links`,
            {
                link_id: `TEST_${Date.now()}`,
                link_amount: 100,
                link_currency: 'INR',
                link_purpose: 'Test Payment',
                customer_details: {
                    customer_name: 'Test Customer',
                    customer_email: 'test@example.com',
                    customer_phone: '+919876543210'
                },
                link_auto_reminders: true,
                link_notify: {
                    send_sms: true,
                    send_email: true
                }
            },
            {
                headers: {
                    'x-api-version': '2022-09-01',
                    'x-client-id': CASHFREE_APP_ID,
                    'x-client-secret': CASHFREE_SECRET_KEY
                }
            }
        );

        console.log('Payment Link Created Successfully!');
        console.log('Payment Link:', response.data.link_url);
        console.log('Link ID:', response.data.link_id);
        console.log('Status:', response.data.link_status);
    } catch (error) {
        console.error('Error creating payment link:', error.response?.data || error.message);
    }
}

testPayment(); 