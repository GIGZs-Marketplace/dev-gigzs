# SSH Setup for Cursor

To connect your Gigzs VM in **Cursor**, add the following SSH configuration to your local SSH config file:

## Step 1: Open SSH Config File

Open (or create) the SSH config file:

```bash
nano ~/.ssh/config
```

## Step 2: Add the Following Entry

```ssh
Host dev-gigzs
    HostName 4.227.178.56
    IdentityFile ~/.ssh/dev-gigzs-vm_key.pem
    User gigzsadmin
```

## Step 3: Set Correct Permissions for the Private Key

```bash
chmod 400 ~/.ssh/dev-gigzs-vm_key.pem
```

## Step 4: Connect Using Cursor

In Cursor, open the SSH tab and connect using:

```
Host: dev-gigzs
```

You’re all set! This will let you SSH into your VM from Cursor using the friendly name `dev-gigzs`.

---

**Note:** Make sure the private key is located in `~/.ssh/` and matches the name `dev-gigzs-vm_key.pem`.

