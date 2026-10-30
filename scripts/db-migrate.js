'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'database', 'migrations');
const HISTORY_TABLE = 'chattbm_schema_migrations';
const ALLOWED_DATABASE = 'chattbm_staging_isolated';
const ALLOWED_MIGRATION = '006_email_verification_tokens.sql';

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--file') args.file = argv[++i];
        else if (argv[i] === '--target') args.target = argv[++i];
        else if (argv[i] === '--confirm') args.confirm = argv[++i];
        else throw new Error(`Unknown argument: ${argv[i]}`);
    }
    if (!args.file || !args.target || !args.confirm) {
        throw new Error('Usage: npm run db:migrate -- --file <migration.sql> --target chattbm_staging_isolated --confirm APPLY:chattbm_staging_isolated:<migration.sql>');
    }
    return args;
}

function validateMigrationFilename(filename) {
    if (filename !== ALLOWED_MIGRATION) {
        throw new Error(`Refusing migration: only ${ALLOWED_MIGRATION} is enabled in this initial runner.`);
    }
    return filename;
}

async function runSelectedMigration({ client, migrationFile, expectedDatabase, confirmation, sql, checksum }) {
    validateMigrationFilename(migrationFile);
    if (expectedDatabase !== ALLOWED_DATABASE) {
        throw new Error(`Refusing migration: initial runner is restricted to ${ALLOWED_DATABASE}.`);
    }
    if (confirmation !== `APPLY:${expectedDatabase}:${migrationFile}`) {
        throw new Error('Refusing migration: explicit target confirmation does not match.');
    }

    const identity = await client.query('SELECT current_database() AS database_name');
    const actualDatabase = identity.rows[0] && identity.rows[0].database_name;
    if (actualDatabase !== expectedDatabase) {
        throw new Error(`Refusing migration: connected database is "${actualDatabase}", expected "${expectedDatabase}".`);
    }

    const digest = checksum || crypto.createHash('sha256').update(sql, 'utf8').digest('hex');
    await client.query(`
        CREATE TABLE IF NOT EXISTS ${HISTORY_TABLE} (
            filename TEXT PRIMARY KEY,
            checksum CHAR(64) NOT NULL,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await client.query('SELECT pg_advisory_lock($1, $2)', [194735, 1]);
    try {
        const prior = await client.query(
            `SELECT checksum FROM ${HISTORY_TABLE} WHERE filename = $1`,
            [migrationFile]
        );
        if (prior.rowCount > 0) {
            if (prior.rows[0].checksum.trim() !== digest) {
                throw new Error(`Migration checksum mismatch for ${migrationFile}; refusing to continue.`);
            }
            return { status: 'already-applied', filename: migrationFile, database: actualDatabase };
        }

        await client.query('BEGIN');
        try {
            await client.query(sql);
            await client.query(
                `INSERT INTO ${HISTORY_TABLE} (filename, checksum) VALUES ($1, $2)`,
                [migrationFile, digest]
            );
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        return { status: 'applied', filename: migrationFile, database: actualDatabase };
    } finally {
        await client.query('SELECT pg_advisory_unlock($1, $2)', [194735, 1]);
    }
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
    const filename = validateMigrationFilename(args.file);
    if (args.target !== ALLOWED_DATABASE) {
        throw new Error(`Refusing migration: initial runner is restricted to ${ALLOWED_DATABASE}.`);
    }
    const filePath = path.join(MIGRATIONS_DIR, filename);
    if (path.dirname(filePath) !== MIGRATIONS_DIR || !fs.existsSync(filePath)) {
        throw new Error('Selected migration file does not exist in database/migrations.');
    }
    const sql = fs.readFileSync(filePath, 'utf8');
    if (!sql.trim()) throw new Error('Selected migration file is empty.');

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
        const result = await runSelectedMigration({
            client, migrationFile: filename, expectedDatabase: args.target,
            confirmation: args.confirm, sql
        });
        console.log(`Migration ${result.status}: ${result.filename} on ${result.database}.`);
    } finally {
        await client.end();
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error(error.message);
        process.exitCode = 1;
    });
}

module.exports = { parseArgs, validateMigrationFilename, runSelectedMigration };
