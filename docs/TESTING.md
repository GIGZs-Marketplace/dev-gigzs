# Project Testing Guide

This document provides a comprehensive checklist and step-by-step instructions to test the entire project, including authentication, dashboard features, contracts, chat, and payment workflows.

---

## 1. Prerequisites
- Node.js and npm installed
- Supabase project and environment variables configured
- Cashfree API credentials set in `.env`
- All dependencies installed (`npm install`)
- Database migrated and seeded with test data

---

## 2. Setup
1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in all required values (Supabase, Cashfree, etc.)
4. **Run database migrations and seed data** (if applicable)
5. **Start the development server:**
   ```bash
   npm run dev
   ```
6. **Access the app** at [http://localhost:3000](http://localhost:3000)

---

## 3. Authentication
- [ ] Sign up as a client and as a freelancer
- [ ] Log in and log out
- [ ] Password reset flow
- [ ] Profile completion and editing

---

## 4. Dashboard & Navigation
- [ ] Client dashboard loads and displays stats
- [ ] Freelancer dashboard loads and displays stats
- [ ] Navigation between tabs (Jobs, Contracts, Payments, etc.)
- [ ] Responsive layout on desktop and mobile

---

## 5. Job Posting & Proposals
- [ ] Client can post a new job with all required fields
- [ ] Freelancer can view jobs and submit proposals
- [ ] Client can view, accept, or reject proposals
- [ ] Accepted proposals create contracts/projects

---

## 6. Contracts & Project Management
- [ ] Contracts are visible to both client and freelancer
- [ ] Contract details (budget, dates, parties) are correct
- [ ] Contract signing flow works for both parties
- [ ] Status updates (signed, completed, etc.) are reflected

---

## 7. Chat & Messaging
- [ ] Freelancer and client can initiate and continue chats
- [ ] Company name and Bitmoji avatar are displayed correctly
- [ ] Messages are sent, received, and displayed in real time

---

## 8. Profile & Avatars
- [ ] Profile photo/Bitmoji displays correctly
- [ ] Editing profile updates avatar and info

---

## 9. Payment Workflow
- [ ] Client can initiate payment for a project/milestone
- [ ] Redirect to Cashfree payment gateway works
- [ ] Payment success updates contract and wallet
- [ ] Payment history is visible to both parties
- [ ] Freelancer can request payout (with bank details)
- [ ] Wallet balance updates after payout request
- [ ] Webhook from Cashfree updates payment status

---

## 10. Error Handling & Edge Cases
- [ ] Invalid logins show error messages
- [ ] Insufficient wallet balance blocks payout
- [ ] Double payment attempts are prevented
- [ ] All forms validate required fields

---

## 11. Admin/Backoffice (if applicable)
- [ ] Admin can view/manage users, jobs, payments
- [ ] Manual status overrides work

---

## 12. Final Checks
- [ ] No console errors in browser or server
- [ ] All navigation links work
- [ ] All user roles tested
- [ ] Mobile and desktop tested

---

## 13. Useful Commands
- Run tests (if available):
  ```bash
  npm test
  ```
- Lint code:
  ```bash
  npm run lint
  ```
- Format code:
  ```bash
  npm run format
  ```

---

## 14. Reporting Issues
- Note the steps to reproduce
- Include screenshots or logs
- File issues in the repository or send to the dev team

---

Happy Testing! 