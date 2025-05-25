# Payment & Payout Testing Guide

## Prerequisites
- Ensure Cashfree test credentials are configured
- Have access to admin dashboard
- Have test client and freelancer accounts ready

## 1. Create a New Project
- Log in as a client and create a new project with a total amount (e.g., $1000)
- Verify in database:
  - Project record is created
  - Payment record is created with status 'pending'
  - Payment link is generated and stored
- Confirm that a payment link is generated and sent to the client

## 2. Simulate Advance Payment (Webhook)
- Find the payment record in the database and note its ID
- Simulate a successful payment by sending a webhook:

```bash
curl -X POST http://localhost:3000/api/webhooks/cashfree \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-signature: test-signature' \
  -d '{
    "signature": "test-signature",
    "data": {
      "event_type": "PAYMENT_SUCCESS",
      "order": { "order_id": "<PAYMENT_ID_FROM_DB>" },
      "payment": { "payment_id": "cf_test_payment_id" }
    }
  }'
```
- Replace `<PAYMENT_ID_FROM_DB>` with the actual payment ID
- Verify in database:
  - Payment status updated to 'paid'
  - Webhook event logged
  - Freelancer wallet credited (minus platform fee)
  - Notifications created for both parties

## 3. Check Wallet and Notifications
- Log in as the freelancer
- Go to the Wallet dashboard
- Verify:
  - Wallet shows correct balance (50% of project amount minus 10% fee)
  - $100 reserve is maintained
  - Payment notification is visible
  - Transaction history shows the payment

## 4. Mark Project as Completed
- As a client or admin, move the project to the "Ready for Delivery" or "Completed" stage
- Verify in database:
  - Project status updated
  - New payment record created for completion payment
  - Payment link generated and stored
- Confirm a second payment link is generated

## 5. Simulate Completion Payment (Webhook)
- Repeat step 2 for the second payment
- Verify all database updates and notifications

## 6. Request Payout
- As the freelancer, request a payout from the Wallet dashboard
- Verify:
  - $100 reserve rule is enforced
  - Payout request is created in database
  - Notification is sent to freelancer
  - Available balance is reduced by payout amount
  - Reserve balance remains at $100

## 7. Admin Approves Payout
- As admin, approve the payout request:

```bash
curl -X POST http://localhost:3000/api/admin/approve-payout \
  -H 'Content-Type: application/json' \
  -d '{ "payoutRequestId": "<PAYOUT_REQUEST_ID_FROM_DB>" }'
```
- Replace `<PAYOUT_REQUEST_ID_FROM_DB>` with the actual payout request ID
- Verify in database:
  - Payout request status updated to 'paid'
  - Freelancer wallet updated
  - Notification sent to freelancer

## 8. Final Checks
- Freelancer sees payout as "paid" and receives a notification
- All payment, payout, and notification records are visible in the database
- Verify audit trail is complete:
  - All webhook events logged
  - All wallet transactions recorded
  - All notifications sent
  - All status changes tracked

## Common Issues and Solutions
- If webhook fails: Check signature verification and payload format
- If wallet not updated: Verify webhook processing and database updates
- If notifications missing: Check notification service and database records
- If reserve balance incorrect: Verify wallet update logic 