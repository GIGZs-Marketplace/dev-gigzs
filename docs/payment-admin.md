# Admin Guide: Payment & Payout Management

## Reviewing and Approving Payout Requests
- Go to the admin dashboard or use the database to view pending payout requests in the `payout_requests` table.
- To approve a payout, use the API endpoint:

```bash
curl -X POST http://localhost:3000/api/admin/approve-payout \
  -H 'Content-Type: application/json' \
  -d '{ "payoutRequestId": "<PAYOUT_REQUEST_ID_FROM_DB>" }'
```
- This marks the payout as "paid" and notifies the freelancer.
- Verify that the $100 reserve is maintained after payout.

---

## Monitoring Payment Logs
- All payment and webhook events are logged in the `payment_webhooks` table for auditing.
- Payment statuses are tracked in the `payments` table.
- Freelancer wallet balances and payout history are in `freelancer_wallets` and `payout_requests`.
- Check the `notifications` table for user communications.

---

## Handling Payment Issues
- If a payment or payout fails, check the relevant tables for error logs.
- Use the `notifications` table to verify if users were notified.
- For Cashfree integration issues, check webhook delivery and API credentials.
- Common issues and solutions:
  - Webhook failures: Verify signature and payload
  - Payment link issues: Check Cashfree API status
  - Wallet update failures: Verify database transactions
  - Notification delays: Check notification service

---

## Security and Compliance
- Verify webhook signatures for all incoming requests
- Ensure $100 reserve is maintained for all freelancers
- Monitor for suspicious activity in payment patterns
- Keep API credentials secure and rotate regularly
- Maintain audit logs for all financial transactions

---

## Best Practices
- Always verify payout requests before approval
- Keep API credentials secure
- Regularly audit payment and payout logs for discrepancies
- Respond promptly to user queries about payments
- Monitor system health and performance
- Regular backup of payment and wallet data
- Document all manual interventions

---

## Reporting
- Track payment success rates
- Monitor platform fee collection
- Review payout request patterns
- Analyze user payment behavior
- Generate financial reports as needed

---

## Emergency Procedures
- How to handle failed payments
- Process for manual payment verification
- Steps for payout request investigation
- Protocol for system downtime
- Contact information for critical issues 