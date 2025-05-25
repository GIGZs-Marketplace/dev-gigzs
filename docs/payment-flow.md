# Payment Flow Explanation

## Overview
This document explains how the payment system works for projects on the platform, including payment splitting, payment link generation, webhook handling, wallet updates, reserve logic, and notifications.

---

## 1. Project Creation & Advance Payment
- When a client creates a new project, the total project cost is split into two equal parts:
  - **50% Advance Payment** (paid upfront)
  - **50% Completion Payment** (paid upon project delivery)
- The system automatically generates a secure payment link for the advance payment using the Cashfree Payment Link API and sends it to the client.
- Both client and freelancer are notified when the payment link is generated.

---

## 2. Payment Link Generation
- The backend calls Cashfree's API to create a payment link for the required amount.
- The link is associated with a payment record in the database and sent to the client.
- Payment links are secure and time-limited.
- Each payment link is tracked in the database with its status.

---

## 3. Payment Confirmation (Webhook)
- When the client pays via the link, Cashfree sends a webhook to the system.
- The webhook handler verifies the event and updates the payment record to "paid."
- The freelancer's wallet is credited with their share (after deducting a 10% platform fee).
- A $100 reserve is always held in the wallet and cannot be withdrawn.
- Both client and freelancer receive notifications about the payment.
- All webhook events are logged for auditing purposes.

---

## 4. Completion Payment
- When the project is marked as "Ready for Delivery" or "Completed," the system generates a second payment link for the remaining 50%.
- The same webhook and wallet update process applies.
- Both parties are notified when the completion payment link is generated.

---

## 5. Payout Requests
- Freelancers can request a payout if their available balance (minus the $100 reserve) meets the threshold.
- The request is visible to the admin for manual approval.
- Once approved, the wallet is updated and the freelancer is notified.
- The $100 reserve is always maintained in the wallet.

---

## 6. Notifications
- In-app notifications are sent for all major payment and payout events:
  - Payment link generated
  - Payment received
  - Payout request submitted
  - Payout approved
- Notifications are displayed in the freelancer wallet dashboard.
- Both clients and freelancers receive relevant notifications.

---

## 7. Security & Logging
- All payment and webhook events are logged in the database for transparency and auditing.
- Webhook signatures are verified for security.
- The $100 reserve ensures platform security.
- All sensitive operations require proper authentication.

---

## Diagram
```
Client → [Create Project] → System → [Generate Payment Link] → Client
Client → [Pay Link] → Cashfree → [Webhook] → System → [Update Wallet, Notify]
System → [Project Complete] → [Generate 2nd Link] → Client
Client → [Pay 2nd Link] → Cashfree → [Webhook] → System → [Update Wallet, Notify]
Freelancer → [Request Payout] → System → [Admin Approval] → [Wallet Update, Notify]
```

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