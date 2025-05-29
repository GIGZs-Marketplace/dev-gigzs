export const config = {
  cashfree: {
    apiKey: process.env.VITE_CASHFREE_APP_ID || '',
    secretKey: process.env.VITE_CASHFREE_SECRET_KEY || '',
    baseUrl: process.env.VITE_CASHFREE_API_URL || 'https://sandbox.cashfree.com/pg',
  },
  platform: {
    feePercentage: 10, // 10% platform fee
    minimumReserve: 100, // $100 minimum reserve
    minimumPayout: 50, // Minimum amount for payout request
  },
  webhook: {
    secret: process.env.WEBHOOK_SECRET || 'your_webhook_secret_key_here',
  },
}; 