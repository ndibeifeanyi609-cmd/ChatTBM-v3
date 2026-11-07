#!/usr/bin/env bash
# Staging-only backup preparation. Run manually in a trusted Render environment.
set -euo pipefail
set +x
: "${STAGING_BACKUP_DATABASE_URL:?Set staging-only internal database URL}"
: "${BACKUP_ENCRYPTION_PASSPHRASE:?Set backup encryption passphrase}"
command -v psql >/dev/null
command -v pg_dump >/dev/null
command -v gpg >/dev/null
export PGOPTIONS="-c default_transaction_read_only=on"
database_name=$(psql "$STAGING_BACKUP_DATABASE_URL" -X -A -t -v ON_ERROR_STOP=1 -c 'SELECT current_database()')
if [[ "$database_name" != "chattbm_staging_isolated" ]]; then
  echo "ERROR: Refusing backup: target is not isolated staging." >&2
  exit 1
fi
# Write only an encrypted archive; never leave an unencrypted dump on disk.
output_dir="${BACKUP_OUTPUT_DIR:-/tmp}"
mkdir -p "$output_dir"
umask 077
output="$output_dir/chattbm-staging-$(date -u +%Y%m%dT%H%M%SZ).dump.gpg"
if [[ -e "$output" ]]; then
  echo "ERROR: Backup file already exists." >&2
  exit 1
fi
trap 'rm -f "$output"' ERR
pg_dump --dbname="$STAGING_BACKUP_DATABASE_URL" --format=custom --no-owner --no-privileges |
  gpg --batch --yes --symmetric --cipher-algo AES256 --passphrase-fd 3 -o "$output" 3<<<"$BACKUP_ENCRYPTION_PASSPHRASE"
test -s "$output"
echo "Encrypted isolated staging backup created. Retain securely; ephemeral job storage is not durable."
