# Alternative Nginx Configurations

## Option 1: Subdomain Routing (Recommended for Multiple Apps)

```nginx
# /etc/nginx/sites-available/crm-app
# For: crm.yourdomain.com

server {
    listen 80;
    listen [::]:80;
    server_name crm.yourdomain.com;
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name crm.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/crm.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.yourdomain.com/privkey.pem;
    
    # ... rest of config from nginx.conf.example
    
    location / {
        proxy_pass http://localhost:3000;
        # ... proxy headers from nginx.conf.example
    }
}
```

Setup multiple apps:
- crm.yourdomain.com → localhost:3000 (this app)
- app2.yourdomain.com → localhost:3001 (another app)
- app3.yourdomain.com → localhost:3002 (another app)

## Option 2: Subpath Routing

```nginx
# /etc/nginx/sites-available/apps
# For: yourdomain.com/crm, yourdomain.com/app2, etc.

server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com;
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # CRM App
    location /crm {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # For Next.js, also add:
        proxy_set_header X-Forwarded-Path /crm;
    }
    
    # Another app
    location /app2 {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Path /app2;
    }
    
    # Another app
    location /app3 {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Path /app3;
    }
}
```

**Note**: For subpath routing with Next.js, you may need to configure basePath in next.config.mjs:
```javascript
module.exports = {
  basePath: '/crm'
}
```

## Option 3: Multiple Nginx Server Blocks in One File

```nginx
# /etc/nginx/sites-available/all-apps

# CRM App - Subdomain
upstream crm_app {
    server localhost:3000;
}

server {
    listen 443 ssl http2;
    server_name crm.yourdomain.com;
    ssl_certificate /etc/letsencrypt/live/crm.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://crm_app;
        # ... proxy headers
    }
}

# App2 - Subdomain
upstream app2_backend {
    server localhost:3001;
}

server {
    listen 443 ssl http2;
    server_name app2.yourdomain.com;
    ssl_certificate /etc/letsencrypt/live/app2.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app2.yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://app2_backend;
        # ... proxy headers
    }
}

# Redirect HTTP to HTTPS for all
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    location / {
        return 301 https://$host$request_uri;
    }
}
```

## Load Balancing (Advanced)

If you need to run multiple instances of the same app:

```nginx
upstream crm_app_backend {
    least_conn;  # Load balancing method
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 443 ssl http2;
    server_name crm.yourdomain.com;
    
    location / {
        proxy_pass http://crm_app_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Session persistence (if needed)
        # proxy_cookie_flags ~ secure httponly samesite=lax;
    }
}
```

## Environment Variables for Subpath Routing

If using subpath routing, update your docker-compose.yml:

```yaml
crm-app:
  environment:
    # Add base path for Next.js
    NEXT_PUBLIC_BASE_PATH: /crm
    API_BASE_URL: https://yourdomain.com/crm
```

And update next.config.mjs:

```javascript
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

export default nextConfig;
```

## Certificate Generation for Multiple Domains

```bash
# Generate wildcard certificate (covers all subdomains)
sudo certbot certonly --standalone -d yourdomain.com -d '*.yourdomain.com'

# Or generate individual certificates
sudo certbot certonly --standalone -d crm.yourdomain.com -d app2.yourdomain.com

# List all certificates
sudo certbot certificates

# Renew all (automatic with timer)
sudo certbot renew --dry-run
```

## Performance Tips for Multiple Apps

1. **Use upstream blocks**: Define upstream servers, then reference them
2. **Connection pooling**: Nginx maintains connections to backends
3. **Caching**: Set appropriate cache headers for static assets
4. **Compression**: Enable gzip for all backends
5. **Rate limiting** (optional):
   ```nginx
   limit_req_zone $binary_remote_addr zone=crm_limit:10m rate=10r/s;
   
   location / {
       limit_req zone=crm_limit burst=20 nodelay;
       proxy_pass http://localhost:3000;
   }
   ```

## Monitoring SSL Certificates

```bash
# Check certificate expiry
sudo certbot certificates

# Check in days
echo "Your certificate expires in:"
sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem

# Set up renewal reminders (certbot.timer does this automatically)
sudo systemctl status certbot.timer
```

## Testing Configuration

```bash
# Validate nginx config syntax
sudo nginx -t

# Test specific server block (if using multiple)
sudo nginx -t -c /etc/nginx/nginx.conf

# Reload nginx without downtime
sudo systemctl reload nginx

# Test proxy connection
curl -v http://localhost:3000

# Test through nginx
curl -v https://yourdomain.com
curl -v https://crm.yourdomain.com
```

## Common Issues with Multiple Apps

| Issue | Solution |
|-------|----------|
| Port conflicts | Use different ports (3000, 3001, 3002) in docker-compose |
| Static files 404 | Check `basePath` in next.config.mjs |
| API calls fail | Verify `X-Forwarded-*` headers are set |
| SSL certificate errors | Check certificate path is correct in nginx config |
| CORS errors | Add proper CORS headers in app |
| Database connection timeout | Check docker network connectivity |

## Recommended Setup for Production

For a VPS with multiple apps, use:
1. **Subdomains** (crm.yourdomain.com) - Cleaner, Easier SSL
2. **Separate docker-compose files** per app - Better isolation
3. **Shared nginx config** - One reverse proxy for all
4. **Shared PostgreSQL** (optional) - Different schemas per app
5. **UFW firewall** - Allow 22, 80, 443 only
6. **Automated backups** - Daily database backups

See DOCKER_DEPLOYMENT.md for complete setup instructions.
