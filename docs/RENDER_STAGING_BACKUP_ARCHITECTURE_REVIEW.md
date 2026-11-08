# Render-Hosted Staging Backup Architecture Review

**Status:** Proposal for review only. No Render resource, workflow, secret, or database setting has been changed.  
**Scope:** Backup of the isolated staging database only: `chattbm_staging_isolated`.  
**Production:** Explicitly excluded.

## 1. Why the current backup attempt failed

The existing encrypted backup workflow runs on a GitHub-hosted Ubuntu runner. The staging PostgreSQL database is protected by an IP allowlist containing only `102.92.22.33/32`. The failed attempt reached the external Render PostgreSQL hostname and ended with:

```text
SSL connection has been closed unexpectedly
```

The attempt failed before a verified dump, upload/download round trip, or restore completed. The failure is consistent with the GitHub-hosted runner not being able to use Render's private network and not being in the database allowlist. This is the leading explanation, not a proven root cause.

Do not widen the database allowlist to `0.0.0.0/0`.

## 2. Proposed two-stage design

Use a Render-hosted one-off/cron execution for the database read and encrypted upload, then use GitHub Actions only for retrieval and restore validation.

### Stage A — Render-hosted backup job

- Run in the same Render region as the staging database (Ohio).
- Use the Render **internal** PostgreSQL connection URL for `chattbm_staging_isolated`.
- Use a dedicated staging-only job/service identity and environment.
- Install/use PostgreSQL 18 client, GnuPG, and AWS CLI v2.
- Verify `SELECT current_database()` equals exactly `chattbm_staging_isolated` before dumping.
- Set libpq read-only transaction options for the backup connection; use `pg_dump` custom format.
- Encrypt the dump with GPG AES-256 before upload.
- Upload only to the exact bucket `chattbm-staging-backups` and a unique object key.
- Record the object key and SHA-256 checksum as non-secret output.
- Never print connection URLs, passphrases, access keys, or secret environment values.

The backup job must not use `DATABASE_URL` as an application database setting, run application startup, or execute migrations. It must not connect to any production database.

### Stage B — GitHub restore validation

- A separate manually dispatched validation workflow receives the exact object key and expected SHA-256 checksum from Stage A.
- It downloads that object from the exact approved R2 bucket.
- It verifies the downloaded ciphertext checksum against the expected checksum.
- It decrypts using the backup passphrase.
- It restores into a fresh disposable PostgreSQL 18 instance, never into Render.
- It verifies core ChatTBM tables and reports success/failure.
- It removes local backup/decrypted files even on failure.

The validation workflow must not receive or define any staging or production database URL. It needs only R2 read access and the decryption passphrase. Prefer a separate read-only R2 credential for validation if the bucket supports it.

## 3. Required configuration and isolation

Before implementation, confirm these items without revealing values:

- Render job has the staging **internal** database URL, not the external URL.
- Render job has the approved R2 bucket name `chattbm-staging-backups`.
- Render job has its own R2 upload credential scoped to that bucket.
- Encryption passphrase is present only as a protected secret.
- GitHub validation has R2 read access and the same decryption passphrase.
- No production URL or production credential is present in either job.
- Staging database allowlist remains unchanged.
- Job command is limited to the backup script; no server startup or migration command.

Do not reuse the current GitHub secret `STAGING_DATABASE_URL` in the GitHub-hosted job. The private internal URL belongs only in the Render-hosted backup environment.

## 4. Implementation changes required

The current `scripts/staging-encrypted-backup.sh` expects GitHub run identifiers when available and otherwise creates a timestamp/PID suffix. Before using it from Render, review and test:

1. Strict validation of the internal Render host and exact database name.
2. Unique object-key generation that is safe under concurrent job starts.
3. Explicit output of object key and ciphertext SHA-256.
4. Upload success followed by a remote object metadata/size check.
5. No deletion of the only local copy until upload verification succeeds.
6. No secret values in logs or error output.

The existing `.github/workflows/render-db-backup.yml` combines database access, upload, download, and restore on GitHub-hosted infrastructure. It should be split so the GitHub workflow never opens a PostgreSQL connection to Render.

## 5. Test sequence

1. Review proposed code and environment-variable names.
2. Validate the Render job build/command without executing a backup.
3. Separately approve one manual staging backup run.
4. Confirm the encrypted object exists in the approved R2 bucket and its checksum/size match.
5. Separately dispatch restore validation using that exact object key and checksum.
6. Confirm restore succeeds in disposable PostgreSQL 18 and expected core tables exist.
7. Record backup timestamp, object key, checksum, restore result, and retention policy without recording secrets.

A successful Render deploy or job start is not proof of a backup. A successful upload alone is not proof of recoverability. The gate is a completed restore test.

## 6. Approval boundaries

This proposal does not authorize:

- Creating or deploying a Render Cron Job.
- Updating Render environment variables or secrets.
- Changing database IP allowlists.
- Running a staging backup.
- Running migrations or index repairs.
- Accessing or modifying production.

Each of those actions requires its own review and explicit approval. Production remains out of scope.

## 7. Current decision

The safer direction is a Render-private-network backup stage plus a separate GitHub restore-validation stage. Do not implement or execute it until the repository changes, secret boundaries, and Render job configuration have been reviewed.
