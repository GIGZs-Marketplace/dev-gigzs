import axios from 'axios';

// Cashfree API configuration
const CASHFREE_API_URL = 'https://api.cashfree.com';
const CASHFREE_APP_ID = 'TEST102744956523f3bc30ce34e40ed959447201';
const CASHFREE_SECRET_KEY = 'cfsk_ma_test_b36c50735bdc5bfe7ad07ceeb3fee0e5_4b774b07';

interface CashfreeResponse {
    link_id: string;
    link_url: string;
    link_status: string;
    link_amount: number;
    link_currency: string;
    link_purpose: string;
    link_created_at: string;
    link_expiry_time: string;
}

async function testPayment() {
    try {
        console.log('Testing Cashfree Payment Integration...');
        
        const response = await axios.post<CashfreeResponse>(
            `${CASHFREE_API_URL}/pg/links`,
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
    } catch (error: any) {
        console.error('Error creating payment link:', error.response?.data || error.message);
    }
}

testPayment();