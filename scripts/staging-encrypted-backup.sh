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

# Cloudflare account IDs are exactly 32 hexadecimal characters.
if [[ ! "$R2_ACCOUNT_ID" =~ ^[[:xdigit:]]{32}$ ]]; then
  echo "ERROR: Refusing backup: Cloudflare R2 account ID must be 32 hexadecimal characters." >&2
  exit 1
fi

for command_name in python3 psql pg_dump gpg aws sha256sum wc; do
  command -v "$command_name" >/dev/null || {
    echo "ERROR: Required command not found: $command_name" >&2
    exit 1
  }
done

# Keep the database password in a mode-600 libpq password file.
# Only a password-free URI is passed to psql/pg_dump.
credential_dir=$(mktemp -d)
chmod 700 "$credential_dir"
upload_verified=false
cleanup() {
  rm -rf "$credential_dir"
  if [[ -n "${output:-}" && "$upload_verified" == "true" && "${BACKUP_KEEP_LOCAL:-false}" != "true" ]]; then
    rm -f "$output"
  fi
}
trap cleanup EXIT

safe_database_url=$(python3 - "$credential_dir/pgpass" <<'PY'
import os
import sys
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit, urlunsplit

expected_host = "dpg-dbicflmc6qcc73d97u60-a"
expected_database = "chattbm_staging_isolated"
raw_url = os.environ.get("STAGING_BACKUP_DATABASE_URL", "")

try:
    parsed = urlsplit(raw_url)
    username = unquote(parsed.username or "")
    password = unquote(parsed.password or "")
    port = parsed.port or 5432
    valid = (
        parsed.scheme in ("postgres", "postgresql")
        and parsed.hostname == expected_host
        and port == 5432
        and parsed.path == "/" + expected_database
        and bool(username)
        and bool(password)
        and not parsed.query
        and not parsed.fragment
    )
except (ValueError, TypeError):
    valid = False

if not valid:
    print("ERROR: Refusing backup: connection URL is not the approved isolated staging target.", file=sys.stderr)
    sys.exit(1)

def pgpass_escape(value):
    return value.replace("\\", "\\\\").replace(":", "\\:")

pgpass = ":".join(map(pgpass_escape, [
    expected_host, str(port), expected_database, username, password
])) + "\n"
path = Path(sys.argv[1])
path.write_text(pgpass, encoding="utf-8")
path.chmod(0o600)

netloc = quote(username, safe="") + "@" + expected_host
if parsed.port is not None:
    netloc += ":" + str(port)
print(urlunsplit((parsed.scheme, netloc, parsed.path, "", "")))
PY
)

export PGPASSFILE="$credential_dir/pgpass"
export PGOPTIONS="-c default_transaction_read_only=on"
database_name=$(psql "$safe_database_url" -X -A -t -v ON_ERROR_STOP=1 -c 'SELECT current_database()')
if [[ "$database_name" != "chattbm_staging_isolated" ]]; then
  echo "ERROR: Refusing backup: target is not isolated staging." >&2
  exit 1
fi

output_dir="${BACKUP_OUTPUT_DIR:-/tmp}"
mkdir -p "$output_dir"
umask 077
# Use 128 bits from the OS cryptographic random source to avoid key collisions.
random_suffix=$(python3 -c 'import secrets; print(secrets.token_hex(16))')
filename="chattbm-staging-$(date -u +%Y%m%dT%H%M%SZ)-${random_suffix}.dump.gpg"
output="$output_dir/$filename"
if [[ -e "$output" ]]; then
  echo "ERROR: Backup file already exists." >&2
  exit 1
fi

# Store the passphrase only in the private credential directory (mode 700).
# GPG reads the mode-600 file; the secret is not placed in its argument list.
passphrase_file="$credential_dir/gpg-passphrase"
printf '%s' "$BACKUP_ENCRYPTION_PASSPHRASE" > "$passphrase_file"
chmod 600 "$passphrase_file"

pg_dump --dbname="$safe_database_url" --format=custom --no-owner --no-privileges |
  gpg --batch --yes --symmetric --cipher-algo AES256 --passphrase-file "$passphrase_file" -o "$output"
test -s "$output"
backup_sha256=$(sha256sum "$output" | awk '{print $1}')
backup_size_bytes=$(wc -c < "$output" | tr -d '[:space:]')
if [[ ! "$backup_sha256" =~ ^[0-9a-f]{64}$ || ! "$backup_size_bytes" =~ ^[0-9]+$ || "$backup_size_bytes" -le 0 ]]; then
  echo "ERROR: Could not calculate encrypted backup integrity metadata." >&2
  exit 1
fi


export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="auto"
endpoint="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
aws s3 cp "$output" "s3://${R2_BUCKET_NAME}/${filename}" \
  --endpoint-url "$endpoint" --only-show-errors

remote_size=$(aws s3api head-object --bucket "$R2_BUCKET_NAME" --key "$filename" \
  --endpoint-url "$endpoint" --query 'ContentLength' --output text)
if [[ ! "$remote_size" =~ ^[0-9]+$ || "$remote_size" != "$backup_size_bytes" ]]; then
  echo "ERROR: Uploaded backup verification failed: remote object size does not match." >&2
  exit 1
fi

upload_verified=true

# Publish handoff metadata only after the remote object has been size-verified.
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    printf 'backup_file=%s\n' "$output"
    printf 'backup_object_key=%s\n' "$filename"
    printf 'backup_sha256=%s\n' "$backup_sha256"
    printf 'backup_size_bytes=%s\n' "$backup_size_bytes"
  } >> "$GITHUB_OUTPUT"
fi

# Non-secret values for the operator to enter in restore validation.
printf 'BACKUP_OBJECT_KEY=%s\n' "$filename"
printf 'BACKUP_SHA256=%s\n' "$backup_sha256"
printf 'BACKUP_SIZE_BYTES=%s\n' "$backup_size_bytes"
echo "Encrypted isolated staging backup uploaded and size-verified in private R2 bucket: $R2_BUCKET_NAME/$filename"
