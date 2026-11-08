# Staging Backup Security and Verification Checklist

This checklist supplements `RENDER_STAGING_BACKUP_ARCHITECTURE_REVIEW.md`. It is design guidance only. It does not authorize a Render job, secret change, backup run, migration, or production action.

## A. Observed gaps in the current implementation

These are confirmed from the current `main` versions of `scripts/staging-encrypted-backup.sh` and `.github/workflows/render-db-backup.yml`:

- The script verifies the database name after connecting, but does not validate the connection URL hostname before connecting. It must fail closed on any host other than the exact Render internal hostname confirmed from Render.
- The script creates a timestamp/PID-based object key when not running in GitHub Actions. That is not a cryptographically random uniqueness guarantee and is not sufficient for concurrent executions.
- The script does not calculate or publish a SHA-256 checksum.
- The script does not verify the uploaded object's remote size/metadata after `aws s3 cp`.
- The current GitHub workflow still receives `STAGING_DATABASE_URL`, connects to Render, and performs upload and restore in one job. It has not yet been split into the proposed Render-only backup and GitHub-only restore stages.
- The current workflow uses the same R2 access key for upload and download; separate least-privilege credentials are preferable.

These are implementation gaps, not evidence that a backup exists. No backup has been verified.

## B. Render-side target validation

The backup process must fail closed before invoking `pg_dump`.

1. Require the dedicated environment variable `STAGING_BACKUP_DATABASE_URL`; never read `DATABASE_URL`.
2. Parse the URL with a proper URI parser; do not print it or include it in errors.
3. Require the exact database name `chattbm_staging_isolated`.
4. Require the hostname to exactly match the canonical internal hostname copied from the current Render database connection details or verified through the Render API. Do not guess, derive, or accept a shortened database ID as a hostname.
5. Reject the external hostname, IP literals, unknown hosts, unexpected ports, alternate database names, and any URL that cannot be parsed.
6. Query `SELECT current_database()` and independently require the exact database name.
7. Never accept a user-supplied host/database override at run time.
8. Keep the staging database allowlist unchanged; do not add broad CIDR ranges.

The exact internal hostname must be re-confirmed from Render immediately before implementation. Do not infer an internal hostname from the external hostname by string replacement, and do not log the full connection URL.

## B. Dump and encryption

1. Use PostgreSQL 18 client tools compatible with the target server.
2. Use `pg_dump --format=custom --no-owner --no-privileges` and fail on any non-zero exit.
3. Do not run schema migrations, application startup, or DDL.
4. Create a private temporary directory with restrictive permissions and `umask 077`.
5. Stream the dump into GPG AES-256 encryption where feasible; otherwise protect the plaintext temporary file with restrictive permissions and guaranteed cleanup.
6. Keep the encryption passphrase out of command-line arguments, shell tracing, logs, and process listings; pass it through a protected file descriptor or equivalent secret-safe mechanism.
7. Generate a unique object key using UTC timestamp plus a cryptographically secure random identifier (for example, at least 128 random bits). Use conditional create/no-overwrite semantics where supported; a timestamp/PID suffix alone is insufficient.
8. Compute SHA-256 of the final encrypted artifact and record only the checksum, object key, byte size, and UTC timestamp. Export these as explicit machine-readable outputs for the restore workflow; never derive the expected checksum from the downloaded object itself.

## C. R2 upload verification

1. Upload only to bucket `chattbm-staging-backups`.
2. Use a dedicated upload credential scoped to the required bucket operations.
3. Verify remote object existence and byte size after upload using object metadata. Compare remote size to the local encrypted artifact size.
4. Do not assume an upload command's exit code alone proves the expected object was stored.
5. Retain the local encrypted artifact until remote existence and size verification succeed; then securely remove temporary files according to the approved retention policy. Preserve the current fail-safe behavior of not deleting the only local copy before verification.
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

The *restore-only* GitHub workflow must not define `STAGING_DATABASE_URL`, `STAGING_BACKUP_DATABASE_URL`, `DATABASE_URL`, or any production database URL. The existing combined workflow currently does define `STAGING_DATABASE_URL`; it must be replaced/split and then inspected to prove the database secret is absent from the restore job.

## E. Required tests before any live backup

- Unit tests for accepted/rejected database URLs and hostnames.
- Tests for wrong database name, wrong hostname, malformed URL, missing secret, and external-host rejection.
- Tests for unique object key generation and overwrite refusal.
- Tests for checksum mismatch, upload failure, missing remote object, and remote size mismatch.
- Workflow-level tests or static assertions proving the GitHub restore-only workflow has no database URL secrets in job/step environments, and no staging/production connection string references.
- A disposable end-to-end restore test using a non-production fixture before a live staging backup is separately approved.

## F. Approval sequence

1. Review the implementation diff and tests.
2. Confirm Render's current internal connection hostname and exact environment-variable names without displaying secret values.
3. Confirm separate R2 upload and read-only credentials, with bucket-scoped least privilege; do not reuse the current combined workflow's single credential pair.
4. Review the Render job command and environment boundary.
5. Obtain explicit approval before creating/deploying a Render job or changing any environment variable.
6. Obtain separate explicit approval before the first staging backup run.
7. Declare backup recoverable only after the encrypted artifact is downloaded, checksum-verified, decrypted, and restored successfully in disposable PostgreSQL.

No step in this checklist authorizes a production connection or production change.
