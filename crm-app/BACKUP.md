# Database Backup & Recovery Guide

## Overview
The CRM app now includes **automatic daily backups** of your PostgreSQL database. Backups are stored separately from the main database volume to protect against accidental deletion.

---

## How It Works

### Automatic Backups
- **Backup service runs daily** at 2 AM (server time) via the `backup` container
- **Backed up to** `/var/lib/crm-app/backups` on the VPS host
- **Retention**: Automatic cleanup keeps only the last **30 days** of backups
- **Compression**: Backups are gzip-compressed to save space

### Backup Files
Format: `crm_db_YYYYMMDD_HHMMSS.sql.gz`

Example:
```
crm_db_20260306_020000.sql.gz  (March 6, 2026 @ 2:00 AM)
```

### Backup Log
View when backups ran:
```bash
docker compose exec backup tail -f /backups/backup.log
```

---

## Starting Backups

The backup service runs in **production profile**. Start it with:

```bash
# Start full stack WITH backups
docker compose --profile production up -d

# Or just the backup service
docker compose --profile production up -d backup
```

Without the profile flag, the backup service won't start:
```bash
# This will NOT include backups
docker compose up -d
```

---

## Restore from Backup

### List available backups
```bash
cd /var/lib/crm-app/backups
ls -lh crm_db_*.sql.gz
```

### Restore a backup
```bash
# 1. Decompress the backup
gunzip -k crm_db_20260306_020000.sql.gz

# 2. Restore to database (from VPS host)
docker compose exec -T postgres psql -U crm_user -d crm_db < /backups/crm_db_20260306_020000.sql

# 3. Verify (check client count increased)
docker compose exec postgres psql -U crm_user -d crm_db -c "SELECT COUNT(*) FROM \"Client\";"
```

### Restore with full recreation (safest method)
```bash
# 1. Stop app
docker compose down --remove-orphans

# 2. Stop postgres container
docker stop crm-app-db

# 3. Delete only the postgres volume (NOT backups)
docker volume rm crm-app_postgres_data

# 4. Start postgres alone
docker compose up -d postgres

# 5. Wait for it to be ready (20-30 seconds)
sleep 30

# 6. Restore backup
docker compose exec -T postgres psql -U crm_user -d crm_db < /backups/crm_db_20260306_020000.sql

# 7. Restart app
docker compose --profile production up -d
```

---

## ⚠️ Data Protection Warnings

### ❌ DON'T do this:
```bash
# DANGEROUS - WILL DELETE ALL DATA
docker compose down -v

# DANGEROUS - WILL DELETE ALL DATA
docker volume rm crm-app_postgres_data
```

### ✅ SAFE ways to restart:
```bash
# Safe restart (no data loss)
docker compose restart

# Safe update and restart (includes migrations)
docker compose up -d --pull always

# Safe full restart (keeps volumes)
docker compose down
docker compose up -d
```

---

## Backup Best Practices

1. **Enable production profile** for automatic daily backups
   ```bash
   docker compose --profile production up -d
   ```

2. **Monitor backup logs** weekly
   ```bash
   docker compose exec backup cat /backups/backup.log
   ```

3. **Test restore** monthly
   - Take a backup, try restoring to verify it works

4. **Copy backups off-server** monthly (optional but recommended)
   ```bash
   # From local machine
   scp -r root@your-vps:/var/lib/crm-app/backups ~/local-backup-archive/
   ```

5. **Set disk space alerts** - backups use ~5-50 MB each depending on data size

---

## Troubleshooting

### Backup service not running
```bash
# Check if backup service started
docker compose --profile production ps

# Check logs
docker compose --profile production logs backup

# Restart backup service
docker compose --profile production restart backup
```

### Backup file is 0 bytes / backup.log shows errors
- Ensure postgres is healthy: `docker compose ps postgres`
- Check postgres logs: `docker compose logs postgres`
- Manually run backup: `docker compose --profile production exec backup /usr/local/bin/backup-db.sh`

### Restore is slow / hangs
- Large databases take time. Don't interrupt.
- For safety, restore in background with `nohup`:
  ```bash
  nohup docker compose exec -T postgres psql -U crm_user -d crm_db < /backups/crm_db_20260306_020000.sql &
  ```

---

## Summary

| Task | Command |
|------|---------|
| Start with backups | `docker compose --profile production up -d` |
| View backup logs | `docker compose --profile production logs backup` |
| List backups | `ls -lh /var/lib/crm-app/backups/` |
| Restore backup | `docker compose exec -T postgres psql -U crm_user -d crm_db < /backups/crm_db_YYYYMMDD_HHMMSS.sql` |
| Manual backup now | `docker compose --profile production exec backup /usr/local/bin/backup-db.sh` |

Your data is now safe. ✅
