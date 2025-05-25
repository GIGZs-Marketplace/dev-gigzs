# Payment System Features

## 1. $100 Reserve Logic
- Freelancers can only request payouts if their available balance minus $100 is greater than or equal to the requested amount.
- This ensures a minimum balance is always held in the wallet for platform security.

---

## 2. Notification System
- In-app notifications are sent to freelancers and clients for:
  - Payment received (both parties)
  - Payout request submitted (freelancer)
  - Payout approved (freelancer)
- Notifications are displayed in the freelancer wallet dashboard.

---

## 3. Admin Payout Approval
- Admin can approve payout requests via a new API endpoint (`/api/admin/approve-payout`).
- When approved, the payout request is marked as "paid" and the freelancer is notified.

---

## 4. Testing the Full Flow
- **Create a new project** as a client.
- **Advance payment link** is generated and sent.
- **Simulate payment** by triggering the Cashfree webhook (or make a real payment in test mode).
- **Freelancer wallet** is credited, and both parties receive notifications.
- **Mark project as ready/completed** to trigger the second payment link.
- **Repeat payment simulation** for the completion payment.
- **Freelancer requests payout** (if balance minus $100 reserve is sufficient).
- **Admin approves payout** via the new endpoint.
- **Freelancer sees payout as "paid"** and receives a notification.

---

## 5. Running and Testing
- You can now run your project and test the full payment and payout flow.
- Use the testing guide (`docs/payment-testing.md`) for detailed steps and curl commands. 