# Troubleshooting Guide

This guide covers common issues and solutions for setup, payments, and running the project.

---

## 1. Setup Issues

### Problem: Cannot connect to Supabase
- **Solution:**
  - Check your Supabase URL and Key in `.env`.
  - Ensure your Supabase project is running.

### Problem: Environment variables not loaded
- **Solution:**
  - Make sure you copied `.env.example` to `.env` and filled all values.
  - Restart your dev server after changes.

---

## 2. Payment Issues

### Problem: Payment link not generated
- **Solution:**
  - Check Cashfree API credentials in `.env`.
  - Ensure the project and contract exist.
  - Check server logs for errors.

### Problem: Payment status not updating after payment
- **Solution:**
  - Ensure Cashfree webhook is configured and reachable at `/api/webhooks/cashfree`.
  - Check webhook logs in Supabase (`payment_webhooks` table).
  - Check for errors in the webhook handler.

### Problem: Wallet not updated after payment
- **Solution:**
  - Confirm payment status is `paid` in the `payments` table.
  - Check `freelancer_wallets` table for updates.

---

## 3. General Issues

### Problem: App won't start
- **Solution:**
  - Run `npm install` to ensure all dependencies are installed.
  - Check for missing or invalid environment variables.
  - Check for TypeScript or linter errors.

### Problem: UI not updating after actions
- **Solution:**
  - Try refreshing the page.
  - Check browser console for errors.

---

If you encounter an issue not listed here, please file an issue or contact the dev team. 