# Ubuntu VPS Deployment Guide

## Quick Start (with Docker)

The easiest way to deploy the CRM is with **Docker Compose**. It includes automatic daily backups.

```bash
# 1. SSH to VPS
ssh root@your-vps-ip

# 2. Go to project directory
cd /path/to/Basic-CRM/crm-app

# 3. Start with backups included
docker compose --profile production up -d

# 4. Check status
docker compose ps
```

That's it! The app runs on port **3092** (configured in docker-compose.yml).

See [BACKUP.md](./BACKUP.md) for backup & restore instructions.

---

## Manual Deployment (Linux/Ubuntu)

If you prefer not to use Docker:

```bash
# Log in to postgres
sudo -u postgres psql

# Create DB and user
CREATE DATABASE basiccrm;
CREATE USER crmuser WITH ENCRYPTED PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE basiccrm TO crmuser;
\q
```

---

## 2. Clone the Repository

```bash
cd /home/ubuntu
git clone https://github.com/your-username/Basic-CRM.git
cd Basic-CRM/crm-app
```

---

## 3. Configure Environment

```bash
cp .env.example .env
nano .env
```

Update the file:

```
DATABASE_URL="postgresql://crmuser:yourpassword@localhost:5432/basiccrm?schema=public"
```

---

## 4. Install Dependencies

```bash
npm install
```

---

## 5. Run Database Migrations

```bash
npx prisma migrate deploy
```

---

## 6. Build the Application

```bash
npm run build
```

---

## 7. Start the Application

```bash
npm start
```

The app runs on **port 3000** by default.

---

## 8. (Optional) Run as a Background Service with PM2

```bash
# Install PM2
npm install -g pm2

# Start the app
pm2 start npm --name "basic-crm" -- start

# Auto-restart on reboot
pm2 startup
pm2 save
```

---

## 9. (Optional) Nginx Reverse Proxy

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/basiccrm
```

Paste:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/basiccrm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Summary

| Step | Command |
|------|---------|
| Install deps | `npm install` |
| Run migrations | `npx prisma migrate deploy` |
| Build | `npm run build` |
| Start | `npm start` |

That's it. No Docker, no orchestration, no complexity.
