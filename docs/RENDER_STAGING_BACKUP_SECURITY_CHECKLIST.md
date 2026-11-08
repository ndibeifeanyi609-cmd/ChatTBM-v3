# Staging Backup Security and Verification Checklist

This checklist supplements `RENDER_STAGING_BACKUP_ARCHITECTURE_REVIEW.md`. It is design guidance only. It does not authorize a Render job, secret change, backup run, migration, or production action.

## A. Render-side target validation

The backup process must fail closed before invoking `pg_dump`.

1. Require the dedicated environment variable `STAGING_BACKUP_DATABASE_URL`; never read `DATABASE_URL`.
2. Parse the URL with a proper URI parser; do not print it or include it in errors.
3. Require the exact database name `chattbm_staging_isolated`.
4. Require the hostname to be the known Render internal hostname for the isolated staging database, `dpg-dbicflmc6qcc73d97u60-a` (or the exact internal DNS form confirmed from Render's current connection details).
5. Reject the external hostname, IP literals, unknown hosts, unexpected ports, alternate database names, and any URL that cannot be parsed.
6. Query `SELECT current_database()` and independently require the exact database name.
7. Never accept a user-supplied host/database override at run time.
8. Keep the staging database allowlist unchanged; do not add broad CIDR ranges.

The exact internal hostname must be re-confirmed from Render immediately before implementation. Do not infer an internal hostname from the external hostname by string replacement.

## B. Dump and encryption

1. Use PostgreSQL 18 client tools compatible with the target server.
2. Use `pg_dump --format=custom --no-owner --no-privileges` and fail on any non-zero exit.
3. Do not run schema migrations, application startup, or DDL.
4. Create a private temporary directory with restrictive permissions and `umask 077`.
5. Stream the dump into GPG AES-256 encryption where feasible; otherwise protect the plaintext temporary file with restrictive permissions and guaranteed cleanup.
6. Keep the encryption passphrase out of command-line arguments, shell tracing, logs, and process listings; pass it through a protected file descriptor or equivalent secret-safe mechanism.
7. Generate a unique object key using UTC timestamp plus a cryptographically random identifier. Refuse overwrite.
8. Compute SHA-256 of the final encrypted artifact and record only the checksum, object key, byte size, and UTC timestamp.

## C. R2 upload verification

1. Upload only to bucket `chattbm-staging-backups`.
2. Use a dedicated upload credential scoped to the required bucket operations.
3. Verify remote object existence and byte size after upload using object metadata.
4. Do not assume an upload command's exit code alone proves the expected object was stored.
5. Retain the local encrypted artifact until remote existence and size verification succeed; then securely remove temporary files according to the approved retention policy.
6. Do not print access keys, account secrets, signed URLs, or connection strings.

## D. GitHub restore-validation boundary

The restore-validation workflow must have no staging or production database credentials and no network route to either database.

It may receive only:
- An exact R2 object key, validated to be a simple expected filename (no path traversal).
- The expected SHA-256 checksum.
- R2 read-only credentials scoped to the staging backup bucket.
- The GPG decryption passphrase.

Validation steps:
1. Download the exact object from the approved bucket.
2. Calculate SHA-256 of the downloaded encrypted file and compare it to the expected checksum; stop on mismatch.
3. Decrypt into a private temporary directory; stop on GPG failure.
4. Restore into a fresh disposable PostgreSQL 18 instance only.
5. Verify expected core tables and key schema objects, not just a generic table count.
6. Ensure the disposable database is destroyed and temporary plaintext/encrypted files are removed even after failure.
7. Emit a clear pass/fail result without exposing secrets or user data.

The GitHub workflow must not define `STAGING_DATABASE_URL`, `STAGING_BACKUP_DATABASE_URL`, `DATABASE_URL`, or any production database URL.

## E. Required tests before any live backup

- Unit tests for accepted/rejected database URLs and hostnames.
- Tests for wrong database name, wrong hostname, malformed URL, missing secret, and external-host rejection.
- Tests for unique object key generation and overwrite refusal.
- Tests for checksum mismatch, upload failure, missing remote object, and remote size mismatch.
- Tests proving the GitHub restore workflow has no database URL secrets in its environment.
- A disposable end-to-end restore test using a non-production fixture before a live staging backup is separately approved.

## F. Approval sequence

1. Review the implementation diff and tests.
2. Confirm Render's current internal connection hostname and exact environment-variable names without displaying secret values.
3. Confirm separate R2 upload and read-only credentials.
4. Review the Render job command and environment boundary.
5. Obtain explicit approval before creating/deploying a Render job or changing any environment variable.
6. Obtain separate explicit approval before the first staging backup run.
7. Declare backup recoverable only after the encrypted artifact is downloaded, checksum-verified, decrypted, and restored successfully in disposable PostgreSQL.

No step in this checklist authorizes a production connection or production change.
