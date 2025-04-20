# Project Setup Guide – Gigzs Web App

## Prerequisites

Make sure you're on an Ubuntu-based system and logged in as a non-root user with sudo access.

---

## Step 1: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

---

## Step 2: Install Node.js (LTS version)

```bash
sudo apt install curl -y
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:

```bash
node -v
npm -v
```

---

## Step 3: Fix Folder Permissions (if needed)

Make sure you have write permissions in your project folder:

```bash
sudo chown -R $USER:$USER ~/dev/Gigzs
```

---

## Step 4: Install Project Dependencies

Go to your project directory:

```bash
cd ~/dev/Gigzs
npm install
```

---

## Step 5: Run the Project

```bash
npm run dev
```

It should start the Vite development server. Open the shown `http://localhost:5173` link in your browser.

---

## Troubleshooting

- If you see `vite: not found`, run `npm install` again.
- If permission issues occur, make sure to **not use sudo** unless really necessary.

---

## Done!

Your **Gigzs Web App** is now ready for development and testing.

