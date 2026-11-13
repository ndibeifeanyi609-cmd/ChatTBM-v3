import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifestPath = path.join(root, "database/migrations/manifest.json");
const approvalPhrase = "APPLY_TO_ISOLATED_STAGING_ONLY";

export function validateManifest(manifest) {
  if (!manifest || manifest.version !== 1 || !Array.isArray(manifest.migrations) || !manifest.migrations.length) {
    throw new Error("Invalid migration manifest.");
  }
  const ids = new Set();
  const files = new Set();
  for (const entry of manifest.migrations) {
    if (!entry || typeof entry.id !== "string" || typeof entry.file !== "string" ||
        !/^[0-9]{3}_[a-z0-9_]+\.sql$/.test(entry.id) || entry.id !== entry.file ||
        ids.has(entry.id) || files.has(entry.file)) {
      throw new Error("Migration manifest contains an invalid or duplicate immutable ID/file.");
    }
    ids.add(entry.id);
    files.add(entry.file);
  }
  return manifest.migrations;
}

export async function buildMigrationPlan(manifest, readSql = (file) => readFile(path.join(root, "database/migrations", file), "utf8")) {
  const entries = validateManifest(manifest);
  const plan = [];
  for (const entry of entries) {
    const sql = await readSql(entry.file);
    if (!sql.trim()) throw new Error("Migration is empty: " + entry.id);
    plan.push({
      id: entry.id,
      sql,
      checksum: createHash("sha256").update(sql).digest("hex")
    });
  }
  return plan;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const connectionString = process.env.STAGING_MIGRATION_DATABASE_URL;
  if (!connectionString) throw new Error("STAGING_MIGRATION_DATABASE_URL is required; DATABASE_URL is deliberately not accepted.");
  const parsed = new URL(connectionString);
  if (decodeURIComponent(parsed.pathname.replace(/^\//, "")) !== "chattbm_staging_isolated") {
    throw new Error("Refusing migration target: database name must be exactly chattbm_staging_isolated.");
  }
  const allowedHosts = (process.env.STAGING_MIGRATION_ALLOWED_HOSTS || "")
    .split(",").map(host => host.trim().toLowerCase()).filter(Boolean);
  if (!allowedHosts.length || !allowedHosts.includes(parsed.hostname.toLowerCase())) {
    throw new Error("Refusing migration target: database host is not in STAGING_MIGRATION_ALLOWED_HOSTS.");
  }
  if (apply && process.env.STAGING_MIGRATION_APPROVAL !== approvalPhrase) {
    throw new Error("Apply refused. Set the explicit staging-only approval phrase after review.");
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const plan = await buildMigrationPlan(manifest);
  const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 10000, statement_timeout: 30000 });
  const client = await pool.connect();
  let locked = false;
  try {
    const identity = await client.query("SELECT current_database() AS database_name");
    if (identity.rows[0]?.database_name !== "chattbm_staging_isolated") {
      throw new Error("Connected database identity did not match the isolated staging database.");
    }

    await client.query("SELECT pg_advisory_lock(731904221)");
    locked = true;

    const ledgerExists = await client.query(
      "SELECT to_regclass('public.chattbm_schema_migrations') IS NOT NULL AS present"
    );
    if (!ledgerExists.rows[0].present) {
      const existing = await client.query(
        "SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name LIKE 'chattbm_%'"
      );
      if (existing.rows[0].count > 0) {
        throw new Error("Existing ChatTBM tables found without a migration ledger. Baseline reconciliation is required; refusing to guess which migrations were applied.");
      }
    }

    if (apply) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.chattbm_schema_migrations (
          migration_id TEXT PRIMARY KEY,
          checksum_sha256 TEXT NOT NULL,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
    }

    if (ledgerExists.rows[0].present) {
      const ledgerColumns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'chattbm_schema_migrations'
        ORDER BY ordinal_position
      `);
      const expectedColumns = [
        ["migration_id", "text", "NO"],
        ["checksum_sha256", "text", "NO"],
        ["applied_at", "timestamp with time zone", "NO"]
      ];
      const actualColumns = ledgerColumns.rows.map(row => [
        row.column_name, row.data_type, row.is_nullable
      ]);
      if (JSON.stringify(actualColumns) !== JSON.stringify(expectedColumns)) {
        throw new Error("Migration ledger has an invalid structure.");
      }
    }

    const applied = ledgerExists.rows[0].present
      ? await client.query("SELECT migration_id, checksum_sha256 FROM public.chattbm_schema_migrations ORDER BY applied_at, migration_id")
      : { rows: [] };
    const manifestIds = new Set(plan.map(migration => migration.id));
    const unknownLedgerIds = applied.rows
      .map(row => row.migration_id)
      .filter(id => !manifestIds.has(id));
    if (unknownLedgerIds.length) {
      throw new Error("Migration ledger contains IDs absent from the manifest: " + unknownLedgerIds.join(", "));
    }
    const appliedMap = new Map(applied.rows.map(row => [row.migration_id, row.checksum_sha256]));
    const manifestOrder = new Map(plan.map((migration, index) => [migration.id, index]));
    const recordedPositions = [...appliedMap.keys()]
      .map(id => manifestOrder.get(id))
      .sort((a, b) => a - b);
    if (recordedPositions.some((position, index) => position !== index)) {
      throw new Error("Migration ledger is not a contiguous manifest prefix.");
    }

    for (const migration of plan) {
      const recorded = appliedMap.get(migration.id);
      if (recorded && recorded !== migration.checksum) {
        throw new Error("Checksum mismatch for already-recorded migration " + migration.id + ".");
      }
      if (recorded) {
        console.log("ALREADY APPLIED " + migration.id);
      } else if (!apply) {
        console.log("PENDING " + migration.id);
      } else {
        await client.query("BEGIN");
        try {
          await client.query(migration.sql);
          await client.query(
            "INSERT INTO public.chattbm_schema_migrations (migration_id, checksum_sha256) VALUES ($1, $2)",
            [migration.id, migration.checksum]
          );
          await client.query("COMMIT");
          console.log("APPLIED " + migration.id);
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        }
      }
    }
    console.log(apply ? "MIGRATION_RUN_COMPLETE" : "DRY_RUN_COMPLETE");
  } finally {
    if (locked) await client.query("SELECT pg_advisory_unlock(731904221)").catch(() => {});
    client.release();
    await pool.end();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error("MIGRATION_RUNNER_ERROR:", error.message);
    process.exitCode = 1;
  });
}
