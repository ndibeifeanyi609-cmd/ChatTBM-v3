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
        STAGING_MIGRATION_APPROVAL: "APPLY_TO_ISOLATED_STAGING_ONLY"
      }
    });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout);
    return result.stdout;
  }

  const pool = new pg.Pool({ connectionString });
  try {
    const before = await pool.query("SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'chattbm_%'");
    assert.equal(before.rows[0].count, 0, "integration database must start empty");

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
  } finally {
    await pool.end();
  }
});
