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

function declaredObjects(sql) {
  const objects = [];
  const patterns = [
    /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([a-z0-9_]+)/gi,
    /CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+([a-z0-9_]+)/gi
  ];
  for (const pattern of patterns) {
    for (const match of sql.matchAll(pattern)) objects.push(match[1]);
  }
  return objects;
}

const migration001Columns = {
  chattbm_users: [
    ["id", "text", "NO"],
    ["email_normalized", "text", "NO"],
    ["password_hash", "text", "NO"],
    ["email_verified_at", "timestamp with time zone", "YES"],
    ["created_at", "timestamp with time zone", "NO"],
    ["updated_at", "timestamp with time zone", "NO"],
    ["disabled_at", "timestamp with time zone", "YES"]
  ],
  chattbm_auth_sessions: [
    ["id", "text", "NO"],
    ["user_id", "text", "NO"],
    ["token_hash", "text", "NO"],
    ["created_at", "timestamp with time zone", "NO"],
    ["expires_at", "timestamp with time zone", "NO"],
    ["revoked_at", "timestamp with time zone", "YES"],
    ["last_seen_at", "timestamp with time zone", "YES"]
  ]
};

const migration001Constraints = {
  chattbm_users: [
    "primary key (id)",
    "unique (email_normalized)"
  ],
  chattbm_auth_sessions: [
    "primary key (id)",
    "unique (token_hash)",
    "foreign key (user_id) references chattbm_users(id) on delete cascade"
  ]
};

const migration001Indexes = {
  chattbm_auth_sessions: [
    ["chattbm_auth_sessions_user_id_idx", "CREATE INDEX chattbm_auth_sessions_user_id_idx ON public.chattbm_auth_sessions USING btree (user_id)"],
    ["chattbm_auth_sessions_expires_at_idx", "CREATE INDEX chattbm_auth_sessions_expires_at_idx ON public.chattbm_auth_sessions USING btree (expires_at)"]
  ]
};

async function verifyMigration001Indexes(client) {
  const mismatches = [];
  for (const [tableName, expectedIndexes] of Object.entries(migration001Indexes)) {
    for (const [indexName, expectedDefinition] of expectedIndexes) {
      const result = await client.query(`
        SELECT pg_get_indexdef(index_meta.indexrelid) AS definition
        FROM pg_class AS index_row
        JOIN pg_namespace AS namespace_row ON namespace_row.oid = index_row.relnamespace
        JOIN pg_index AS index_meta ON index_meta.indexrelid = index_row.oid
        JOIN pg_class AS table_row ON table_row.oid = index_meta.indrelid
        WHERE namespace_row.nspname = 'public'
          AND index_row.relname = $1 AND table_row.relname = $2
      `, [indexName, tableName]);
      const normalize = value => value.toLowerCase().replace(/\\s+/g, " ").trim();
      if (result.rows.length !== 1 || normalize(result.rows[0].definition) !== normalize(expectedDefinition)) {
        mismatches.push(indexName + " definition differs from migration 001");
      }
    }
  }
  if (mismatches.length) {
    throw new Error("Recorded migration schema mismatch: " + mismatches.join("; ") + ". Refusing to continue.");
  }
}

async function verifyMigration001Constraints(client) {
  const mismatches = [];
  for (const [tableName, expected] of Object.entries(migration001Constraints)) {
    const result = await client.query(`
      SELECT lower(pg_get_constraintdef(constraint_row.oid)) AS definition
      FROM pg_constraint AS constraint_row
      JOIN pg_class AS table_row ON table_row.oid = constraint_row.conrelid
      JOIN pg_namespace AS namespace_row ON namespace_row.oid = table_row.relnamespace
      WHERE namespace_row.nspname = 'public' AND table_row.relname = $1
        AND constraint_row.contype IN ('p', 'u', 'f')
      ORDER BY definition
    `, [tableName]);
    const actual = result.rows.map(row => row.definition.replace(/\\s+/g, " ").trim()).sort();
    const wanted = expected.slice().sort();
    if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
      mismatches.push(tableName + " primary/unique/foreign-key constraints differ from migration 001 definition");
    }
  }
  if (mismatches.length) {
    throw new Error("Recorded migration schema mismatch: " + mismatches.join("; ") + ". Refusing to continue.");
  }
}

async function verifyMigration001Columns(client) {
  const mismatches = [];
  for (const [tableName, expected] of Object.entries(migration001Columns)) {
    const result = await client.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [tableName]
    );
    const actual = result.rows.map(row => [row.column_name, row.data_type, row.is_nullable]);
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      mismatches.push(tableName + " columns differ from migration 001 definition");
    }
  }
  if (mismatches.length) {
    throw new Error("Recorded migration schema mismatch: " + mismatches.join("; ") + ". Refusing to continue.");
  }
}

async function verifyRecordedObjectPresence(client, plan, appliedMap) {
  const missing = [];
  for (const migration of plan) {
    if (!appliedMap.has(migration.id)) continue;
    for (const objectName of declaredObjects(migration.sql)) {
      const result = await client.query("SELECT to_regclass($1) IS NOT NULL AS present", ["public." + objectName]);
      if (!result.rows[0].present) missing.push(migration.id + ": " + objectName);
    }
  }
  if (missing.length) {
    throw new Error("Recorded migrations are missing declared schema objects: " + missing.join(", ") + ". Refusing to continue.");
  }
  if (appliedMap.has("001_auth_accounts_sessions.sql")) {
    await verifyMigration001Columns(client);
    await verifyMigration001Constraints(client);
    await verifyMigration001Indexes(client);
  }
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
    if (ledgerExists.rows[0].present && applied.rows.length === 0) {
      const existing = await client.query(
        "SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name LIKE 'chattbm_%' AND table_name <> 'chattbm_schema_migrations'"
      );
      if (existing.rows[0].count > 0) {
        throw new Error("Empty migration ledger found beside existing ChatTBM tables. Baseline verification is required; refusing to treat the schema as clean.");
      }
    }
    const manifestIds = new Set(plan.map(migration => migration.id));
    const unknownLedgerIds = applied.rows
      .map(row => row.migration_id)
      .filter(id => !manifestIds.has(id));
    if (unknownLedgerIds.length) {
      throw new Error("Migration ledger contains IDs absent from the manifest: " + unknownLedgerIds.join(", "));
    }
    const appliedMap = new Map(applied.rows.map(row => [row.migration_id, row.checksum_sha256]));
    await verifyRecordedObjectPresence(client, plan, appliedMap);
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
