# Project Setup Guide

Follow these steps to set up the project locally.

---

## 1. Prerequisites
- Node.js (v16+ recommended)
- npm (v8+ recommended)
- Supabase project (with credentials)
- Cashfree API credentials

---

## 2. Clone the Repository
```bash
git clone <your-repo-url>
cd <project-folder>
```

---

## 3. Install Dependencies
```bash
npm install
```

---

## 4. Configure Environment Variables
- Copy `.env.example` to `.env`:
  ```bash
  cp .env.example .env
  ```
- Fill in all required values:
  - Supabase URL and Key
  - Cashfree API Key, Secret, and API URL
  - Any other required variables

---

## 5. Database Setup
- Run Supabase migrations (if applicable)
- Seed the database with test data (optional)

---

## 6. Start the App
```bash
npm run dev
```
- The app will be available at [http://localhost:3000](http://localhost:3000)

---

## 7. Next Steps
- See `docs/TESTING.md` for testing instructions
- See `docs/PAYMENT_WORKFLOW_TESTING.md` for payment workflow testing 