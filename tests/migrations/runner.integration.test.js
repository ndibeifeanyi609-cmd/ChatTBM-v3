import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import pg from "pg";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const connectionString = process.env.STAGING_MIGRATION_DATABASE_URL;
const testOptions = {
  skip: !connectionString && "Requires the disposable PostgreSQL service in the isolated migration workflow."
};

function run(args = [], overrides = {}) {
  return spawnSync(process.execPath, ["scripts/runStagingMigrations.js", ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      STAGING_MIGRATION_APPROVAL: "APPLY_TO_ISOLATED_STAGING_ONLY",
      STAGING_MIGRATION_ALLOWED_HOSTS: "localhost",
      ...overrides
    }
  });
}

async function withDatabase(callback) {
  const parsed = new URL(connectionString);
  assert.equal(decodeURIComponent(parsed.pathname.slice(1)), "chattbm_staging_isolated");
  const pool = new pg.Pool({ connectionString });
  try {
    const before = await pool.query(
      "SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'chattbm_%'"
    );
    assert.equal(before.rows[0].count, 0, "each integration scenario must start with a clean disposable database");
    await callback(pool);
  } finally {
    await pool.query("DROP SCHEMA public CASCADE");
    await pool.query("CREATE SCHEMA public");
    await pool.end();
  }
}

test("refuses a malformed migration ledger", testOptions, async () => {
  await withDatabase(async pool => {
    await pool.query("CREATE TABLE public.chattbm_schema_migrations (migration_id TEXT PRIMARY KEY)");
    const result = run(["--apply"]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Migration ledger has an invalid structure/);
  });
});

test("refuses an empty ledger beside existing ChatTBM tables and preserves user data", testOptions, async () => {
  await withDatabase(async pool => {
    await pool.query(`
      CREATE TABLE public.chattbm_schema_migrations (
        migration_id TEXT PRIMARY KEY,
        checksum_sha256 TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
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

    const result = run(["--apply"]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Empty migration ledger found beside existing ChatTBM tables/);

    const ledger = await pool.query("SELECT count(*)::int AS count FROM public.chattbm_schema_migrations");
    assert.equal(ledger.rows[0].count, 0);
    const preserved = await pool.query(
      "SELECT id, email_normalized FROM public.chattbm_users WHERE id = $1",
      ["preserved-user"]
    );
    assert.deepEqual(preserved.rows, [{
      id: "preserved-user",
      email_normalized: "preserved@example.test"
    }]);
    const untouched = await pool.query(
      "SELECT to_regclass('public.chattbm_password_reset_tokens') IS NULL AND to_regclass('public.chattbm_auth_rate_limits') IS NULL AS clean"
    );
    assert.equal(untouched.rows[0].clean, true);
  });
});

test("refuses a recorded migration whose required table is missing", testOptions, async () => {
  await withDatabase(async pool => {
    await pool.query(`
      CREATE TABLE public.chattbm_schema_migrations (
        migration_id TEXT PRIMARY KEY,
        checksum_sha256 TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const sql = await readFile(new URL("../../database/migrations/001_auth_accounts_sessions.sql", import.meta.url), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    await pool.query(
      "INSERT INTO public.chattbm_schema_migrations (migration_id, checksum_sha256) VALUES ($1, $2)",
      ["001_auth_accounts_sessions.sql", checksum]
    );

    const result = run(["--apply"]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Recorded migrations are missing declared schema objects/);
    const ledger = await pool.query("SELECT count(*)::int AS count FROM public.chattbm_schema_migrations");
    assert.equal(ledger.rows[0].count, 1);
    const noUsers = await pool.query(
      "SELECT to_regclass('public.chattbm_users') IS NULL AS missing"
    );
    assert.equal(noUsers.rows[0].missing, true);
  });
});

test("refuses a recorded migration when a required column is missing", testOptions, async () => {
  await withDatabase(async pool => {
    const sql = await readFile(new URL("../../database/migrations/001_auth_accounts_sessions.sql", import.meta.url), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    await pool.query(sql);
    await pool.query("ALTER TABLE public.chattbm_users DROP COLUMN password_hash");
    await pool.query(`
      CREATE TABLE public.chattbm_schema_migrations (
        migration_id TEXT PRIMARY KEY,
        checksum_sha256 TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query(
      "INSERT INTO public.chattbm_schema_migrations (migration_id, checksum_sha256) VALUES ($1, $2)",
      ["001_auth_accounts_sessions.sql", checksum]
    );

    const result = run(["--apply"]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Recorded migration schema mismatch/);
    assert.match(result.stderr, /chattbm_users columns differ/);
    const preserved = await pool.query(
      "SELECT to_regclass('public.chattbm_users') IS NOT NULL AS present"
    );
    assert.equal(preserved.rows[0].present, true);
    const stillMissing = await pool.query(`
      SELECT NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'chattbm_users'
          AND column_name = 'password_hash'
      ) AS missing
    `);
    assert.equal(stillMissing.rows[0].missing, true);
  });
});

test("refuses a recorded migration when its cascading user foreign key is missing", testOptions, async () => {
  await withDatabase(async pool => {
    const sql = await readFile(new URL("../../database/migrations/001_auth_accounts_sessions.sql", import.meta.url), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    await pool.query(sql);
    const fk = await pool.query(`
      SELECT constraint_row.conname
      FROM pg_constraint AS constraint_row
      JOIN pg_class AS table_row ON table_row.oid = constraint_row.conrelid
      WHERE table_row.relname = 'chattbm_auth_sessions'
        AND constraint_row.contype = 'f'
    `);
    assert.equal(fk.rows.length, 1);
    await pool.query("ALTER TABLE public.chattbm_auth_sessions DROP CONSTRAINT " + '"' + fk.rows[0].conname.replaceAll('"', '""') + '"');
    await pool.query(`
      CREATE TABLE public.chattbm_schema_migrations (
        migration_id TEXT PRIMARY KEY,
        checksum_sha256 TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query(
      "INSERT INTO public.chattbm_schema_migrations (migration_id, checksum_sha256) VALUES ($1, $2)",
      ["001_auth_accounts_sessions.sql", checksum]
    );

    const result = run(["--apply"]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Recorded migration schema mismatch/);
    assert.match(result.stderr, /primary\/unique\/foreign-key constraints differ/);
    const remaining = await pool.query(`
      SELECT count(*)::int AS count
      FROM pg_constraint AS constraint_row
      JOIN pg_class AS table_row ON table_row.oid = constraint_row.conrelid
      WHERE table_row.relname = 'chattbm_auth_sessions'
        AND constraint_row.contype = 'f'
    `);
    assert.equal(remaining.rows[0].count, 0);
    const ledger = await pool.query("SELECT count(*)::int AS count FROM public.chattbm_schema_migrations");
    assert.equal(ledger.rows[0].count, 1);
  });
});

test("refuses a recorded migration when the user email unique constraint is missing", testOptions, async () => {
  await withDatabase(async pool => {
    const sql = await readFile(new URL("../../database/migrations/001_auth_accounts_sessions.sql", import.meta.url), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    await pool.query(sql);
    const unique = await pool.query(`
      SELECT constraint_row.conname
      FROM pg_constraint AS constraint_row
      JOIN pg_class AS table_row ON table_row.oid = constraint_row.conrelid
      WHERE table_row.relname = 'chattbm_users'
        AND constraint_row.contype = 'u'
    `);
    assert.equal(unique.rows.length, 1);
    const quotedName = '"' + unique.rows[0].conname.replaceAll('"', '""') + '"';
    await pool.query("ALTER TABLE public.chattbm_users DROP CONSTRAINT " + quotedName);
    await pool.query(`
      CREATE TABLE public.chattbm_schema_migrations (
        migration_id TEXT PRIMARY KEY,
        checksum_sha256 TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query(
      "INSERT INTO public.chattbm_schema_migrations (migration_id, checksum_sha256) VALUES ($1, $2)",
      ["001_auth_accounts_sessions.sql", checksum]
    );

    const result = run(["--apply"]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Recorded migration schema mismatch/);
    assert.match(result.stderr, /primary\/unique\/foreign-key constraints differ/);
    const remaining = await pool.query(`
      SELECT count(*)::int AS count
      FROM pg_constraint AS constraint_row
      JOIN pg_class AS table_row ON table_row.oid = constraint_row.conrelid
      WHERE table_row.relname = 'chattbm_users' AND constraint_row.contype = 'u'
    `);
    assert.equal(remaining.rows[0].count, 0);
    const ledger = await pool.query("SELECT count(*)::int AS count FROM public.chattbm_schema_migrations");
    assert.equal(ledger.rows[0].count, 1);
  });
});

test("refuses a recorded migration when a required session index is missing", testOptions, async () => {
  await withDatabase(async pool => {
    const sql = await readFile(new URL("../../database/migrations/001_auth_accounts_sessions.sql", import.meta.url), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    await pool.query(sql);
    await pool.query("DROP INDEX public.chattbm_auth_sessions_expires_at_idx");
    await pool.query(`
      CREATE TABLE public.chattbm_schema_migrations (
        migration_id TEXT PRIMARY KEY,
        checksum_sha256 TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query(
      "INSERT INTO public.chattbm_schema_migrations (migration_id, checksum_sha256) VALUES ($1, $2)",
      ["001_auth_accounts_sessions.sql", checksum]
    );

    const result = run(["--apply"]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Recorded migrations are missing declared schema objects/);
    assert.match(result.stderr, /chattbm_auth_sessions_expires_at_idx/);
    const remaining = await pool.query(
      "SELECT to_regclass('public.chattbm_auth_sessions_expires_at_idx') IS NULL AS missing"
    );
    assert.equal(remaining.rows[0].missing, true);
    const ledger = await pool.query("SELECT count(*)::int AS count FROM public.chattbm_schema_migrations");
    assert.equal(ledger.rows[0].count, 1);
  });
});

test("refuses a ledger that skips an earlier manifest migration", testOptions, async () => {
  await withDatabase(async pool => {
    await pool.query(`
      CREATE TABLE public.chattbm_schema_migrations (
        migration_id TEXT PRIMARY KEY,
        checksum_sha256 TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query(
      "INSERT INTO public.chattbm_schema_migrations (migration_id, checksum_sha256) VALUES ($1, $2)",
      ["002_chat_history.sql", "0".repeat(64)]
    );
    const result = run(["--apply"]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Recorded migrations are missing declared schema objects/);
  });
});

test("refuses to baseline an existing schema and preserves its user row", testOptions, async () => {
  await withDatabase(async pool => {
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
    const result = run(["--apply"]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Existing ChatTBM tables found without a migration ledger/);
    const ledger = await pool.query(
      "SELECT to_regclass('public.chattbm_schema_migrations') IS NOT NULL AS present"
    );
    assert.equal(ledger.rows[0].present, false);
    const preserved = await pool.query(
      "SELECT id, email_normalized FROM public.chattbm_users WHERE id = $1",
      ["preserved-user"]
    );
    assert.deepEqual(preserved.rows, [{
      id: "preserved-user",
      email_normalized: "preserved@example.test"
    }]);
  });
});

test("applies all migrations once and safely reruns without duplicates", testOptions, async () => {
  await withDatabase(async pool => {
    const first = run(["--apply"]);
    assert.equal(first.status, 0, first.stderr || first.stdout);
    assert.match(first.stdout, /MIGRATION_RUN_COMPLETE/);
    const ledger = await pool.query(
      "SELECT migration_id, checksum_sha256 FROM public.chattbm_schema_migrations ORDER BY migration_id"
    );
    assert.equal(ledger.rows.length, 7);
    assert.ok(ledger.rows.every(row => /^[a-f0-9]{64}$/.test(row.checksum_sha256)));

    const second = run(["--apply"]);
    assert.equal(second.status, 0, second.stderr || second.stdout);
    assert.match(second.stdout, /ALREADY APPLIED 004_password_reset_tokens\.sql/);
    assert.match(second.stdout, /ALREADY APPLIED 005_auth_rate_limits\.sql/);
    const again = await pool.query("SELECT count(*)::int AS count FROM public.chattbm_schema_migrations");
    assert.equal(again.rows[0].count, 7);
    const required = await pool.query(
      "SELECT to_regclass('public.chattbm_password_reset_tokens') IS NOT NULL AND to_regclass('public.chattbm_auth_rate_limits') IS NOT NULL AS present"
    );
    assert.equal(required.rows[0].present, true);
  });
});

test("refuses apply without the explicit approval phrase", testOptions, async () => {
  await withDatabase(async () => {
    const result = run(["--apply"], { STAGING_MIGRATION_APPROVAL: "" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Apply refused/);
  });
});

test("refuses a database host outside the allowlist", testOptions, async () => {
  await withDatabase(async () => {
    const result = run(["--apply"], { STAGING_MIGRATION_ALLOWED_HOSTS: "not-localhost" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /host is not in STAGING_MIGRATION_ALLOWED_HOSTS/);
  });
});

test("refuses unknown migration IDs in the ledger", testOptions, async () => {
  await withDatabase(async pool => {
    const applied = run(["--apply"]);
    assert.equal(applied.status, 0, applied.stderr || applied.stdout);
    await pool.query(
      "INSERT INTO public.chattbm_schema_migrations (migration_id, checksum_sha256) VALUES ('999_unknown.sql', $1)",
      ["0".repeat(64)]
    );
    const result = run(["--apply"]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /IDs absent from the manifest/);
  });
});

test("refuses a checksum mismatch for an already-recorded migration", testOptions, async () => {
  await withDatabase(async pool => {
    const applied = run(["--apply"]);
    assert.equal(applied.status, 0, applied.stderr || applied.stdout);
    const original = await pool.query(
      "SELECT checksum_sha256 FROM public.chattbm_schema_migrations WHERE migration_id = $1",
      ["001_auth_accounts_sessions.sql"]
    );
    await pool.query(
      "UPDATE public.chattbm_schema_migrations SET checksum_sha256 = $1 WHERE migration_id = $2",
      ["f".repeat(64), "001_auth_accounts_sessions.sql"]
    );
    const result = run(["--apply"]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Checksum mismatch/);
    await pool.query(
      "UPDATE public.chattbm_schema_migrations SET checksum_sha256 = $1 WHERE migration_id = $2",
      [original.rows[0].checksum_sha256, "001_auth_accounts_sessions.sql"]
    );
  });
});
