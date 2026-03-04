# CRM App Docker Deployment Guide

## Prerequisites

- Docker and Docker Compose installed on your VPS
- Nginx installed on the host system
- SSL certificates (Let's Encrypt recommended)
- A domain name

## Environment Variables

Create a `.env.production` file based on `.env.example`:

```bash
# Database Configuration
DB_USER=crm_user
DB_PASSWORD=your_very_secure_password_here
DB_NAME=crm_db
DATABASE_URL=postgresql://crm_user:your_very_secure_password_here@postgres:5432/crm_db

# Next.js Configuration
NODE_ENV=production

# Optional Authentication
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=https://crm.yourdomain.com
```

## Deployment Steps

### 1. Prepare the Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2. Clone and Setup the Project

```bash
# Create a directory for your app
mkdir -p /var/docker/apps/crm-app
cd /var/docker/apps/crm-app

# Clone your repository
git clone <your-repo-url> .

# Create .env.production with your values
nano .env.production
# Fill in the database credentials and URLs
```

### 3. Build and Start Docker Containers

```bash
# Build and start containers
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify services are running
docker-compose ps
```

### 4. Update Prisma Schema for PostgreSQL

The app now uses PostgreSQL in Docker. The schema is already configured.

To verify the database migration ran successfully:
```bash
docker-compose exec crm-app npm run prisma:migrate
```

### 5. Configure Nginx

```bash
# Copy the nginx config to sites-available
sudo cp nginx.conf.example /etc/nginx/sites-available/crm-app

# Edit the config with your domain
sudo nano /etc/nginx/sites-available/crm-app
# Replace:
# - crm.example.com with your actual domain
# - /etc/letsencrypt paths if using Let's Encrypt

# Create symlink to enable
sudo ln -s /etc/nginx/sites-available/crm-app /etc/nginx/sites-enabled/crm-app

# Remove default site if not needed
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 6. Set Up SSL with Let's Encrypt (Certbot)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot certonly --standalone -d crm.yourdomain.com

# Set auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Managing the Application

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f crm-app
docker-compose logs -f postgres
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose down
docker-compose up -d --build

# Run migrations if schema changed
docker-compose exec crm-app npm run prisma:migrate
```

### Database Backup

```bash
# Backup PostgreSQL database
docker-compose exec postgres pg_dump -U crm_user crm_db > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore from backup
docker-compose exec -T postgres psql -U crm_user crm_db < backup-20240305-120000.sql
```

### Stop and Reset

```bash
# Stop containers without removing data
docker-compose stop

# Remove containers and volumes (WARNING: deletes data!)
docker-compose down -v
```

## Monitoring and Maintenance

### Check Disk Usage
```bash
docker system df
```

### Prune Unused Images/Containers
```bash
docker system prune -a --volumes
```

### Monitor Container Health
```bash
docker stats
```

### Access Database Directly
```bash
docker-compose exec postgres psql -U crm_user -d crm_db
```

## Troubleshooting

### Containers won't start
```bash
# Check logs
docker-compose logs

# Verify .env.production exists and has correct values
cat .env.production
```

### Database connection error
```bash
# Check if postgres is healthy
docker-compose ps

# Verify DATABASE_URL in .env.production is correct
docker-compose exec crm-app echo $DATABASE_URL
```

### Port already in use
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

### Nginx not proxying correctly
```bash
# Test nginx config
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/crm-app-error.log
```

## Security Best Practices

1. **Change default database credentials** in `.env.production`
2. **Use strong NEXTAUTH_SECRET** (generate with: `openssl rand -base64 32`)
3. **Enable UFW firewall** on your VPS:
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
4. **Regular backups** of your database
5. **Keep Docker and system updated**
6. **Use SSL certificates** (Let's Encrypt)
7. **Restrict database access** to the app container only

## Performance Optimization

- Nginx handles static file caching (60 days for versioned assets)
- Gzip compression enabled for faster transfers
- Database connection pooling via PostgreSQL
- Next.js production optimizations

## Multiple Applications Setup

If hosting multiple apps, use different ports internally and subdomains:
- crm.yourdomain.com → localhost:3000 (this app)
- app2.yourdomain.com → localhost:3001 (another app)
- api.yourdomain.com → localhost:3002 (another app)

Edit docker-compose.yml ports section and nginx config accordingly.
