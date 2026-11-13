import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateManifest, buildMigrationPlan } from "../../scripts/runStagingMigrations.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const manifest = JSON.parse(await readFile(path.join(root, "database/migrations/manifest.json"), "utf8"));

test("migration manifest uses unique immutable filename IDs and explicit dependency order", () => {
  const entries = validateManifest(manifest);
  assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
  assert.deepEqual(entries.map(entry => entry.id), [
    "001_auth_accounts_sessions.sql",
    "002_chat_history.sql",
    "002_google_oauth_identities.sql",
    "003_context_records.sql",
    "003_google_oauth_states.sql",
    "004_password_reset_tokens.sql",
    "005_auth_rate_limits.sql"
  ]);
});

test("all manifest migrations exist, are non-empty, and receive SHA-256 checksums", async () => {
  const plan = await buildMigrationPlan(manifest);
  assert.equal(plan.length, 7);
  for (const item of plan) {
    assert.match(item.checksum, /^[a-f0-9]{64}$/);
    assert.ok(item.sql.trim().length > 0);
  }
});

test("manifest rejects duplicate IDs and unsafe paths", () => {
  assert.throws(() => validateManifest({ version: 1, migrations: [
    { id: "001_auth_accounts_sessions.sql", file: "001_auth_accounts_sessions.sql" },
    { id: "001_auth_accounts_sessions.sql", file: "001_auth_accounts_sessions.sql" }
  ] }), /invalid or duplicate/);
  assert.throws(() => validateManifest({ version: 1, migrations: [
    { id: "../secret.sql", file: "../secret.sql" }
  ] }), /invalid or duplicate/);
});
