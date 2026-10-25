'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Client } = require('pg');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'database', 'migrations');
const LOCK_KEY_1 = 731904;
const LOCK_KEY_2 = 960096;
const RUNNER_VERSION = '1.0.0';

function checksum(content) {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function discoverMigrations(directory = MIGRATIONS_DIR) {
    if (!fs.existsSync(directory)) return [];
    const names = fs.readdirSync(directory);
    const ids = new Set();

    for (const name of names) {
        if (!name.endsWith('.sql')) continue;
        const match = /^(\d{4}_[a-z0-9_]+)\.(up|down)\.sql$/.exec(name);
        if (!match) continue;
        ids.add(match[1]);
    }

    return [...ids].sort().map((id) => {
        const upPath = path.join(directory, id + '.up.sql');
        const downPath = path.join(directory, id + '.down.sql');
        if (!fs.existsSync(upPath)) throw new Error('Missing up migration for ' + id);
        return {
            id,
            upPath,
            downPath: fs.existsSync(downPath) ? downPath : null
        };
    });
}

function assertSafeTarget(row, env = process.env) {
    if (!row || typeof row.database !== 'string' || typeof row.username !== 'string' || typeof row.host !== 'string') {
        throw new Error('Unable to verify database identity.');
    }
    // This runner is deliberately test-only until a separately reviewed production
    // migration procedure exists. Environment flags must never override DB identity.
    if (env.NODE_ENV !== 'test') {
        throw new Error('Migration commands are restricted to NODE_ENV=test.');
    }
    if (!row.database.endsWith('_test')) {
        throw new Error('Refusing to run migrations outside a *_test database.');
    }
    const approvedHosts = (env.CHATTBM_MIGRATION_TEST_HOSTS || '').split(',').map((host) => host.trim()).filter(Boolean);
    if (approvedHosts.length === 0 || !approvedHosts.includes(row.host)) {
        throw new Error('Refusing migration: database host is not explicitly approved for disposable testing.');
    }
}

async function createRunner(options = {}) {
    const client = options.client || new Client({ connectionString: process.env.DATABASE_URL });
    const directory = options.directory || MIGRATIONS_DIR;
    const env = options.env || process.env;
    let connected = false;
    let locked = false;

    async function connect() {
        if (!env.DATABASE_URL && !options.client) throw new Error('DATABASE_URL is required.');
        if (connected) return;
        await client.connect();
        connected = true;
        try {
            const identity = await client.query(
                'SELECT current_database() AS database, current_user AS username, $1::text AS host',
                [client.connectionParameters?.host || '']
            );
            assertSafeTarget(identity.rows[0], env);
            await client.query("SELECT set_config('statement_timeout', '15000', false)");
            await client.query("SELECT set_config('lock_timeout', '5000', false)");
        } catch (error) {
            try { await client.end(); } catch (_) {}
            connected = false;
            throw error;
        }
    }

    async function lock() {
        await client.query('SELECT pg_advisory_lock($1, $2)', [LOCK_KEY_1, LOCK_KEY_2]);
        locked = true;
    }

    async function unlockAndClose() {
        try {
            if (locked) await client.query('SELECT pg_advisory_unlock($1, $2)', [LOCK_KEY_1, LOCK_KEY_2]);
        } finally {
            locked = false;
            if (connected) await client.end();
            connected = false;
        }
    }

    async function ensureLedger() {
        await client.query(`
            CREATE TABLE IF NOT EXISTS chattbm_schema_migrations (
                migration_id TEXT PRIMARY KEY,
                checksum_sha256 TEXT NOT NULL,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                runner_version TEXT NOT NULL
            )
        `);
    }

    async function validateApplied(migrations) {
        const result = await client.query(
            'SELECT migration_id, checksum_sha256 FROM chattbm_schema_migrations ORDER BY migration_id'
        );
        const known = new Map(migrations.map((m) => [m.id, m]));
        for (const row of result.rows) {
            const migration = known.get(row.migration_id);
            if (!migration) throw new Error('Applied migration is missing from disk: ' + row.migration_id);
            const actual = checksum(fs.readFileSync(migration.upPath, 'utf8'));
            if (actual !== row.checksum_sha256) {
                throw new Error('Applied migration checksum mismatch: ' + row.migration_id);
            }
        }
        return new Set(result.rows.map((row) => row.migration_id));
    }

    async function status() {
        const migrations = discoverMigrations(directory);
        await connect();
        try {
            await ensureLedger();
            const applied = await validateApplied(migrations);
            return {
                database: (await client.query('SELECT current_database() AS name')).rows[0].name,
                applied: [...applied].sort(),
                pending: migrations.filter((m) => !applied.has(m.id)).map((m) => m.id)
            };
        } finally {
            await unlockAndClose();
        }
    }

    async function verify() {
        const migrations = discoverMigrations(directory);
        await connect();
        try {
            await ensureLedger();
            const applied = await validateApplied(migrations);
            return { valid: true, applied: [...applied].sort(), pending: migrations.filter((m) => !applied.has(m.id)).map((m) => m.id) };
        } finally {
            await unlockAndClose();
        }
    }

    async function up() {
        const migrations = discoverMigrations(directory);
        await connect();
        try {
            await lock();
            await ensureLedger();
            const applied = await validateApplied(migrations);
            const completed = [];
            for (const migration of migrations) {
                if (applied.has(migration.id)) continue;
                const sql = fs.readFileSync(migration.upPath, 'utf8');
                if (!sql.trim()) throw new Error('Empty up migration: ' + migration.id);
                await client.query('BEGIN');
                try {
                    await client.query(sql);
                    await client.query(
                        'INSERT INTO chattbm_schema_migrations (migration_id, checksum_sha256, runner_version) VALUES ($1, $2, $3)',
                        [migration.id, checksum(sql), RUNNER_VERSION]
                    );
                    await client.query('COMMIT');
                    completed.push(migration.id);
                } catch (error) {
                    await client.query('ROLLBACK');
                    throw new Error('Migration failed: ' + migration.id);
                }
            }
            return { applied: completed };
        } finally {
            await unlockAndClose();
        }
    }

    async function down(id) {
        if (typeof id !== 'string' || !/^\d{4}_[a-z0-9_]+$/.test(id)) {
            throw new Error('An exact migration ID is required.');
        }
        const migrations = discoverMigrations(directory);
        const migration = migrations.find((item) => item.id === id);
        if (!migration) throw new Error('Unknown migration ID.');
        if (!migration.downPath) throw new Error('Migration has no reviewed down file.');
        const sql = fs.readFileSync(migration.downPath, 'utf8');
        if (!sql.trim()) throw new Error('Empty down migration.');

        await connect();
        try {
            await lock();
            await ensureLedger();
            const applied = await validateApplied(migrations);
            if (!applied.has(id)) throw new Error('Migration is not applied.');
            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query('DELETE FROM chattbm_schema_migrations WHERE migration_id = $1', [id]);
                await client.query('COMMIT');
                return { rolledBack: id };
            } catch (_) {
                await client.query('ROLLBACK');
                throw new Error('Rollback failed: ' + id);
            }
        } finally {
            await unlockAndClose();
        }
    }

    return { status, verify, up, down };
}

async function main(args) {
    const command = args[0];
    if (!['status', 'verify', 'up', 'down'].includes(command)) {
        throw new Error('Usage: node scripts/db-migrate.js status|verify|up|down <migration-id>');
    }
    const runner = await createRunner();
    let result;
    if (command === 'status') result = await runner.status();
    if (command === 'verify') result = await runner.verify();
    if (command === 'up') result = await runner.up();
    if (command === 'down') result = await runner.down(args[1]);
    process.stdout.write(JSON.stringify(result) + '\n');
}

if (require.main === module) {
    main(process.argv.slice(2)).catch((error) => {
        process.stderr.write('Migration command failed: ' + error.message + '\n');
        process.exitCode = 1;
    });
}

module.exports = { checksum, discoverMigrations, assertSafeTarget, createRunner };
