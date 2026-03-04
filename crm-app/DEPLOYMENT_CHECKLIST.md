# Docker Deployment Checklist

## Pre-Deployment

- [ ] Update version in `package.json` if needed
- [ ] Test locally with `npm run dev`
- [ ] Run `npm run build && npm start` to test production build locally
- [ ] Commit all changes to git
- [ ] Verify `.gitignore` includes `.env.production`, `.env.local`, etc.
- [ ] Create backups of any important data

## On VPS Setup

- [ ] Install Docker and Docker Compose
- [ ] Install Nginx (if not already installed)
- [ ] Create `/var/docker/apps/crm-app` directory
- [ ] Clone repository into the directory
- [ ] Copy `.env.example` to `.env.production` and update values
- [ ] Change file permissions: `chmod 600 .env.production`

## Environment Variables Configuration

In `.env.production`, ensure you have:
- [ ] `DB_USER` - Set to strong value (not `crm_user`)
- [ ] `DB_PASSWORD` - Strong, random password (use `openssl rand -base64 32`)
- [ ] `DB_NAME` - Database name
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NODE_ENV=production`
- [ ] `NEXTAUTH_SECRET` - Random secret key (if using auth)
- [ ] `NEXTAUTH_URL` - Your actual domain URL with https

## Docker Deployment

- [ ] Build containers: `docker-compose up -d`
- [ ] Verify all services running: `docker-compose ps`
- [ ] Check logs for errors: `docker-compose logs`
- [ ] Test app is running: `curl http://localhost:3000`

## Nginx Setup

- [ ] Copy `nginx.conf.example` to `/etc/nginx/sites-available/crm-app`
- [ ] Edit domain name: Replace `crm.example.com` with your domain
- [ ] Enable site: `sudo ln -s /etc/nginx/sites-available/crm-app /etc/nginx/sites-enabled/crm-app`
- [ ] Test nginx config: `sudo nginx -t`
- [ ] Restart nginx: `sudo systemctl restart nginx`

## SSL Certificate Setup

- [ ] Install certbot: `sudo apt install certbot python3-certbot-nginx -y`
- [ ] Get certificate: `sudo certbot certonly --standalone -d yourdomain.com`
- [ ] Verify certificate paths in nginx config match certbot paths
- [ ] Enable auto-renewal: `sudo systemctl enable certbot.timer`
- [ ] Verify certificate renews: `sudo certbot renew --dry-run`

## Post-Deployment Testing

- [ ] Verify app loads: `https://yourdomain.com`
- [ ] Test client creation form
- [ ] Test product creation form
- [ ] Test API endpoints: `https://yourdomain.com/api/clients`
- [ ] Check browser console for errors (F12)
- [ ] Test on mobile device
- [ ] Verify SSL certificate is valid

## Security Verification

- [ ] UFW firewall enabled: `sudo ufw status`
- [ ] Only ports 22, 80, 443 are open
- [ ] .env.production is NOT in git repository
- [ ] Database has strong password
- [ ] Nginx headers are restrictive (X-Frame-Options, etc.)
- [ ] SSL enforced (HTTP redirects to HTTPS)

## Monitoring Setup

- [ ] Set up log rotation (optional, for production)
- [ ] Configure notifications for container restarts (optional)
- [ ] Create database backup schedule
- [ ] Document the app location and access procedures

## Backup & Recovery

- [ ] Create initial database backup: `docker-compose exec postgres pg_dump -U crm_user crm_db > backup.sql`
- [ ] Create backup directory: `mkdir -p /var/backups/crm-app`
- [ ] Set up automated backups (cron job recommended)
- [ ] Document recovery procedure

## Deployment Complete

- [ ] All checklist items completed
- [ ] App is running and accessible
- [ ] SSL certificates are valid
- [ ] Database is connected and working
- [ ] Team has access documentation
- [ ] Backups are scheduled

## Ongoing Maintenance

- [ ] Weekly: Check logs for errors
- [ ] Monthly: Update Docker images (`docker-compose pull && docker-compose up -d`)
- [ ] Monthly: Review disk usage (`docker system df`)
- [ ] Quarterly: Review security settings
- [ ] Quarterly: Test database restore from backup

## Scaling Multiple Apps

When adding more applications to the same VPS:

1. Use different internal Docker ports for each app
2. Use different nginx server blocks for each domain
3. Use different databases or PostgreSQL schemas for each app
4. Update docker-compose.yml subnet if needed
5. Ensure ports don't conflict (3000, 3001, 3002, etc.)

Example structure:
```
/var/docker/apps/crm-app/      (port 3000)
/var/docker/apps/app2/         (port 3001)
/var/docker/apps/app3/         (port 3002)

nginx configs:
/etc/nginx/sites-available/crm-app
/etc/nginx/sites-available/app2
/etc/nginx/sites-available/app3
```

## Emergency Procedures

**If app crashes:**
```bash
cd /var/docker/apps/crm-app
docker-compose restart
docker-compose logs -f
```

**If database is corrupted:**
```bash
# Restore from backup
docker-compose exec -T postgres psql -U crm_user crm_db < backup-20240305.sql
```

**If port 3000 is blocked:**
```bash
# Find what's using it
sudo lsof -i :3000
# Kill the process
sudo kill -9 <PID>
# Restart docker
docker-compose restart
```

**If SSL certificate expires:**
```bash
# Manual renewal
sudo certbot renew --force-renewal
# Restart nginx
sudo systemctl restart nginx
```
