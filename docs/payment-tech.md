# Payment System Technical Documentation

## Architecture Overview
- **Frontend**: React/TypeScript, interacts with backend for project creation, payment, wallet, and payout flows.
- **Backend/API**: Node.js/Express API routes (in `src/pages/api`), handles payment link creation, webhook processing, and admin actions.
- **Database**: Supabase (Postgres) with tables for projects, payments, wallets, payout requests, notifications, and webhook logs.
- **Payment Provider**: Cashfree Payment Link API for payment link generation and webhook notifications.

---

## Key Modules
- `src/services/cashfree.ts`: Cashfree API integration and webhook handler.
- `src/services/projectPayments.ts`: Project payment logic, splitting, and payout request logic.
- `src/services/adminPayouts.ts`: Admin payout approval logic.
- `src/services/notifications.ts`: In-app notification logic.
- `src/components/freelancer/dashboard/Wallet.tsx`: Wallet UI and notification display.

---

## API Endpoints
- `POST /api/webhooks/cashfree`: Handles Cashfree payment webhooks.
- `POST /api/admin/approve-payout`: Admin endpoint to approve payout requests.

---

## Database Tables
- `projects`: Project details, client, freelancer, total amount, status.
- `payments`: Payment records, type (advance/completion), status, Cashfree link IDs.
- `freelancer_wallets`: Wallet balances, reserved balance, total earned, paid balance.
- `payout_requests`: Payout requests, status, amount, bank details.
- `notifications`: In-app notifications for users.
- `payment_webhooks`: Logs of all webhook events for auditing.

---

## Integration Points
- **Cashfree**: Used for payment link generation and webhook notifications.
- **Supabase**: Used for all data storage and querying.

---

## Key Features Implementation

### 1. $100 Reserve Logic
- Implemented in `projectPayments.ts`
- Enforced during payout requests
- Maintained in `freelancer_wallets` table
- Prevents withdrawals below reserve amount

### 2. Notification System
- Implemented in `notifications.ts`
- Real-time notifications for:
  - Payment received
  - Payout requests
  - Payout approvals
- Displayed in Wallet dashboard

### 3. Admin Payout Approval
- Implemented in `adminPayouts.ts`
- Secure endpoint for approval
- Updates wallet and sends notifications
- Maintains audit trail

---

## Security Measures
- Webhook signature verification
- Admin-only payout approval
- $100 reserve enforcement
- Secure API endpoints
- Audit logging
- Database transaction safety

---

## Extensibility
- The payment logic is modular and can be extended to support other payment providers or payout automation.
- Notification logic can be extended to support email/SMS.
- Admin actions can be expanded for bulk payouts or advanced reporting.

---

## Current Implementation Status
- ✅ Payment splitting (50/50)
- ✅ Payment link generation
- ✅ Webhook handling
- ✅ Wallet updates
- ✅ $100 reserve logic
- ✅ Notification system
- ✅ Admin payout approval
- ✅ Security measures
- ✅ Audit logging

---

## Future Enhancements
- Automated payout processing
- Enhanced reporting
- Multiple payment provider support
- Advanced notification channels
- Bulk payout processing 