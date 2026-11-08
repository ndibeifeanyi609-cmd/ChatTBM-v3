#!/usr/bin/env bash
# Create an encrypted backup of isolated staging and upload it to private Cloudflare R2.
set -euo pipefail
set +x

: "${STAGING_BACKUP_DATABASE_URL:?Set staging-only internal database URL}"
: "${BACKUP_ENCRYPTION_PASSPHRASE:?Set backup encryption passphrase}"
: "${R2_ACCESS_KEY_ID:?Set R2 access key ID}"
: "${R2_SECRET_ACCESS_KEY:?Set R2 secret access key}"
: "${R2_ACCOUNT_ID:?Set Cloudflare account ID}"
: "${R2_BUCKET_NAME:?Set destination bucket name}"

if [[ "$R2_BUCKET_NAME" != "chattbm-staging-backups" ]]; then
  echo "ERROR: Refusing upload: destination is not the approved staging backup bucket." >&2
  exit 1
fi

for command_name in psql pg_dump gpg aws; do
  command -v "$command_name" >/dev/null || {
    echo "ERROR: Required command not found: $command_name" >&2
    exit 1
  }
done

export PGOPTIONS="-c default_transaction_read_only=on"
database_name=$(psql "$STAGING_BACKUP_DATABASE_URL" -X -A -t -v ON_ERROR_STOP=1 -c 'SELECT current_database()')
if [[ "$database_name" != "chattbm_staging_isolated" ]]; then
  echo "ERROR: Refusing backup: target is not isolated staging." >&2
  exit 1
fi

output_dir="${BACKUP_OUTPUT_DIR:-/tmp}"
mkdir -p "$output_dir"
umask 077
if [[ -n "${GITHUB_RUN_ID:-}" ]]; then
  run_suffix="${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT:-1}"
else
  run_suffix="$(date -u +%Y%m%dT%H%M%SZ)-${BASHPID}"
fi
filename="chattbm-staging-$(date -u +%Y%m%dT%H%M%SZ)-${run_suffix}.dump.gpg"
output="$output_dir/$filename"
if [[ -e "$output" ]]; then
  echo "ERROR: Backup file already exists." >&2
  exit 1
fi
trap 'if [[ "${BACKUP_KEEP_LOCAL:-false}" != "true" ]]; then rm -f "$output"; fi' EXIT

pg_dump --dbname="$STAGING_BACKUP_DATABASE_URL" --format=custom --no-owner --no-privileges |
  gpg --batch --yes --symmetric --cipher-algo AES256 --passphrase-fd 3 -o "$output" 3<<<"$BACKUP_ENCRYPTION_PASSPHRASE"
test -s "$output"

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  printf 'backup_file=%s\n' "$output" >> "$GITHUB_OUTPUT"
  printf 'backup_object_key=%s\n' "$filename" >> "$GITHUB_OUTPUT"
fi

export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="auto"
endpoint="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
aws s3 cp "$output" "s3://${R2_BUCKET_NAME}/${filename}" \
  --endpoint-url "$endpoint" --only-show-errors

echo "Encrypted isolated staging backup uploaded to private R2 bucket: $R2_BUCKET_NAME/$filename"
