import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import pg from "pg";

const connectionString = process.env.STAGING_MIGRATION_DATABASE_URL;

test("isolated PostgreSQL migrations apply once, record checksums, and rerun safely", {
  skip: !connectionString && "Requires the disposable PostgreSQL service in the isolated migration workflow."
}, async () => {
  const parsed = new URL(connectionString);
  assert.equal(decodeURIComponent(parsed.pathname.slice(1)), "chattbm_staging_isolated");

  function run(args = []) {
    const result = spawnSync(process.execPath, ["scripts/runStagingMigrations.js", ...args], {
      encoding: "utf8",
      env: {
        ...process.env,
        STAGING_MIGRATION_APPROVAL: "APPLY_TO_ISOLATED_STAGING_ONLY",
        STAGING_MIGRATION_ALLOWED_HOSTS: "localhost"
      }
    });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout);
    return result.stdout;
  }

  const pool = new pg.Pool({ connectionString });
  try {
    const before = await pool.query("SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'chattbm_%'");
    assert.equal(before.rows[0].count, 0, "integration database must start empty");

    // An existing application schema without a ledger must never be silently baselined.
    await pool.query(`
      CREATE TABLE public.chattbm_users (
        id TEXT PRIMARY KEY,
        email_normalized TEXT NOT NULL UNIQUE
      )
    `);
    await pool.query(
      "INSERT INTO public.chattbm_users (id, email_normalized) VALUES ($1, $2)",
      ["preserved-user", "preserved@example.test"]
    );
    const baselineRefusal = spawnSync(process.execPath, ["scripts/runStagingMigrations.js", "--apply"], {
      encoding: "utf8",
      env: {
        ...process.env,
        STAGING_MIGRATION_APPROVAL: "APPLY_TO_ISOLATED_STAGING_ONLY",
        STAGING_MIGRATION_ALLOWED_HOSTS: "localhost"
      }
    });
    assert.notEqual(baselineRefusal.status, 0);
    assert.match(baselineRefusal.stderr, /Existing ChatTBM tables found without a migration ledger/);
    const ledgerAfterRefusal = await pool.query(
      "SELECT to_regclass('public.chattbm_schema_migrations') IS NOT NULL AS present"
    );
    assert.equal(ledgerAfterRefusal.rows[0].present, false);
    const preserved = await pool.query(
      "SELECT id, email_normalized FROM public.chattbm_users WHERE id = $1",
      ["preserved-user"]
    );
    assert.deepEqual(preserved.rows, [{
      id: "preserved-user",
      email_normalized: "preserved@example.test"
    }]);
    await pool.query("DROP TABLE public.chattbm_users");

    const first = run(["--apply"]);
    assert.match(first, /MIGRATION_RUN_COMPLETE/);
    const ledger = await pool.query("SELECT migration_id, checksum_sha256 FROM public.chattbm_schema_migrations ORDER BY migration_id");
    assert.equal(ledger.rows.length, 7);
    assert.ok(ledger.rows.every(row => /^[a-f0-9]{64}$/.test(row.checksum_sha256)));

    const second = run(["--apply"]);
    assert.match(second, /ALREADY APPLIED 004_password_reset_tokens\.sql/);
    assert.match(second, /ALREADY APPLIED 005_auth_rate_limits\.sql/);
    const again = await pool.query("SELECT count(*)::int AS count FROM public.chattbm_schema_migrations");
    assert.equal(again.rows[0].count, 7);
    const required = await pool.query("SELECT to_regclass('public.chattbm_password_reset_tokens') IS NOT NULL AND to_regclass('public.chattbm_auth_rate_limits') IS NOT NULL AS present");
    assert.equal(required.rows[0].present, true);

    const noApproval = spawnSync(process.execPath, ["scripts/runStagingMigrations.js", "--apply"], {
      encoding: "utf8",
      env: { ...process.env, STAGING_MIGRATION_APPROVAL: "", STAGING_MIGRATION_ALLOWED_HOSTS: "localhost" }
    });
    assert.notEqual(noApproval.status, 0);
    assert.match(noApproval.stderr, /Apply refused/);

    const wrongHost = spawnSync(process.execPath, ["scripts/runStagingMigrations.js", "--apply"], {
      encoding: "utf8",
      env: { ...process.env, STAGING_MIGRATION_APPROVAL: "APPLY_TO_ISOLATED_STAGING_ONLY", STAGING_MIGRATION_ALLOWED_HOSTS: "not-localhost" }
    });
    assert.notEqual(wrongHost.status, 0);
    assert.match(wrongHost.stderr, /host is not in STAGING_MIGRATION_ALLOWED_HOSTS/);

    await pool.query("INSERT INTO public.chattbm_schema_migrations (migration_id, checksum_sha256) VALUES ('999_unknown.sql', $1)", ["0".repeat(64)]);
    const unknownResult = spawnSync(process.execPath, ["scripts/runStagingMigrations.js", "--apply"], {
      encoding: "utf8", env: { ...process.env, STAGING_MIGRATION_APPROVAL: "APPLY_TO_ISOLATED_STAGING_ONLY", STAGING_MIGRATION_ALLOWED_HOSTS: "localhost" }
    });
    assert.notEqual(unknownResult.status, 0);
    assert.match(unknownResult.stderr, /IDs absent from the manifest/);
    await pool.query("DELETE FROM public.chattbm_schema_migrations WHERE migration_id = '999_unknown.sql'");

    const original = ledger.rows.find(row => row.migration_id === "001_auth_accounts_sessions.sql");
    await pool.query("UPDATE public.chattbm_schema_migrations SET checksum_sha256 = $1 WHERE migration_id = $2", ["f".repeat(64), original.migration_id]);
    const mismatch = spawnSync(process.execPath, ["scripts/runStagingMigrations.js", "--apply"], {
      encoding: "utf8", env: { ...process.env, STAGING_MIGRATION_APPROVAL: "APPLY_TO_ISOLATED_STAGING_ONLY", STAGING_MIGRATION_ALLOWED_HOSTS: "localhost" }
    });
    assert.notEqual(mismatch.status, 0);
    assert.match(mismatch.stderr, /Checksum mismatch/);
    await pool.query("UPDATE public.chattbm_schema_migrations SET checksum_sha256 = $1 WHERE migration_id = $2", [original.checksum_sha256, original.migration_id]);
  } finally {
    await pool.end();
  }
});
