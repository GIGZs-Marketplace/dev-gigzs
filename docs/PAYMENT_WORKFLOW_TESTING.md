# Payment Workflow Testing Guide

This document provides a step-by-step checklist to test the payment workflow, including Cashfree integration, wallet updates, and payout requests.

---

## 1. Prerequisites
- Cashfree API credentials set in `.env`
- Supabase database running and seeded
- At least one client and one freelancer account
- Project and contract created between client and freelancer

---

## 2. Payment Initiation
- [ ] Log in as a client
- [ ] Go to a project/contract that requires payment
- [ ] Click the **Pay** button (should open payment page)
- [ ] Confirm payment amount and details
- [ ] Click **Proceed to Payment** (redirects to Cashfree)
- [ ] Complete payment using test card (if in sandbox)

---

## 3. Payment Success & Webhook
- [ ] After payment, you are redirected to the payment success page
- [ ] Payment status updates to **paid** in the contract/project
- [ ] Wallet balance for freelancer is updated (minus platform fee)
- [ ] Notification is sent to both client and freelancer
- [ ] Check Supabase `payments` and `freelancer_wallets` tables for correct updates
- [ ] Cashfree webhook endpoint (`/api/webhooks/cashfree`) receives and processes the event

---

## 4. Payment History
- [ ] Client and freelancer can view payment history in their dashboards
- [ ] Payment record shows correct amount, status, and project

---

## 5. Payout Request (Freelancer)
- [ ] Log in as a freelancer
- [ ] Go to **Request Payout** section
- [ ] Enter valid amount and bank details
- [ ] Submit payout request
- [ ] Wallet balance decreases by payout amount
- [ ] Payout request appears in admin/backoffice (if applicable)
- [ ] Notification is sent to freelancer

---

## 6. Error & Edge Cases
- [ ] Attempt payout with insufficient balance (should show error)
- [ ] Attempt double payment for same milestone (should be prevented)
- [ ] Payment fails or is cancelled (status remains pending, no wallet update)
- [ ] Webhook receives invalid signature (should be rejected)

---

## 7. Manual Checks
- [ ] Review logs for errors during payment and payout
- [ ] Confirm no Stripe or other payment provider is used
- [ ] All payment-related UI is clear and user-friendly

---

## 8. Useful SQL Queries (Supabase)
- List all payments:
  ```sql
  select * from payments order by created_at desc;
  ```
- List all payout requests:
  ```sql
  select * from payout_requests order by created_at desc;
  ```
- Check wallet balances:
  ```sql
  select * from freelancer_wallets;
  ```

---

Happy Payment Testing! 