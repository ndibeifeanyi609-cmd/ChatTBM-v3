'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRunner, checksum } = require('../../scripts/db-migrate');

test('verify rejects an applied migration whose source checksum changed', { timeout: 30000, skip: !process.env.DATABASE_URL }, async () => {
    assert.equal(process.env.NODE_ENV, 'test', 'test environment must be explicit');
    assert.match(process.env.DATABASE_URL || '', /chattbm_test/, 'must use disposable test database');

    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chattbm-checksum-'));
    const id = '0001_checksum_probe';
    const upPath = path.join(directory, id + '.up.sql');
    const downPath = path.join(directory, id + '.down.sql');
    fs.writeFileSync(upPath, 'CREATE TABLE checksum_probe (id INTEGER PRIMARY KEY);\n');
    fs.writeFileSync(downPath, 'DROP TABLE checksum_probe;\n');

    try {
        const runner = await createRunner({ directory });
        const applied = await runner.up();
        assert.deepEqual(applied.applied, [id]);

        fs.writeFileSync(upPath, 'CREATE TABLE checksum_probe (id BIGINT PRIMARY KEY);\n');
        await assert.rejects(
            () => createRunner({ directory }).then((next) => next.verify()),
            /Applied migration checksum mismatch/
        );

        const client = new (require('pg').Client)({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            await client.query('DROP TABLE IF EXISTS checksum_probe');
            await client.query('DELETE FROM chattbm_schema_migrations WHERE migration_id = $1', [id]);
        } finally {
            await client.end();
        }
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});
