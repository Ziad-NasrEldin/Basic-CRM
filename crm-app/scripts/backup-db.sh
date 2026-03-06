#!/bin/sh
set -e

# Database backup script for CRM SQLite
# Runs daily via the backup service in docker-compose

BACKUP_DIR="/backups"
DB_FILE="/data/crm.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/crm_${TIMESTAMP}.db"

if [ ! -f "$DB_FILE" ]; then
  echo "Database file not found at $DB_FILE, skipping backup."
  exit 0
fi

echo "Creating database backup: $BACKUP_FILE"
cp "$DB_FILE" "$BACKUP_FILE"

echo "✓ Backup completed: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))" >> "$BACKUP_DIR/backup.log"

# Keep only last 30 days of backups
echo "Cleaning up backups older than 30 days..."
find "$BACKUP_DIR" -name "crm_*.db" -mtime +30 -delete

echo "✓ Backup process complete"
