#!/bin/bash
set -e

# Database backup script for CRM PostgreSQL
# Runs daily via the backup service in docker-compose

BACKUP_DIR="/backups"
DB_USER="${DB_USER:-crm_user}"
DB_NAME="${DB_NAME:-crm_db}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/crm_db_$TIMESTAMP.sql"
BACKUP_COMPRESSED="$BACKUP_FILE.gz"

# Wait for postgres to be ready (connect via docker network hostname)
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -U "$DB_USER" > /dev/null 2>&1; do
  sleep 2
done

echo "Creating database backup: $BACKUP_COMPRESSED"

# Create backup (explicitly connect to postgres service)
pg_dump -h postgres -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

# Log backup
echo "✓ Backup completed: $BACKUP_COMPRESSED ($(du -h "$BACKUP_COMPRESSED" | cut -f1))" >> "$BACKUP_DIR/backup.log"

# Keep only last 30 days of backups (optional but recommended)
echo "Cleaning up backups older than 30 days..."
find "$BACKUP_DIR" -name "crm_db_*.sql.gz" -mtime +30 -delete

echo "✓ Backup process complete"
