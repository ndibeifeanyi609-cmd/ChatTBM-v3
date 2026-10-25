'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createRunner } = require('../../scripts/db-migrate');

test('migration runner applies, verifies, repeats, and rolls back harmless probe migration', { timeout: 30000 }, async () => {
    assert.equal(process.env.NODE_ENV, 'test', 'test environment must be explicit');
    assert.match(process.env.DATABASE_URL || '', /chattbm_test/, 'must use disposable test database');

    const fs = require('node:fs');
    const os = require('node:os');
    const path = require('node:path');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chattbm-runner-probe-'));
    fs.writeFileSync(path.join(directory, '0001_runner_probe.up.sql'), 'CREATE TABLE chattbm_migration_runner_probe (id INTEGER PRIMARY KEY, note TEXT NOT NULL);\n');
    fs.writeFileSync(path.join(directory, '0001_runner_probe.down.sql'), 'DROP TABLE IF EXISTS chattbm_migration_runner_probe;\n');

    try {
        const initial = await (await createRunner({ directory })).status();
        assert.ok(Array.isArray(initial.pending));
        assert.ok(Array.isArray(initial.applied));

        const firstUp = await (await createRunner({ directory })).up();
        assert.ok(firstUp.applied.includes('0001_runner_probe'));

        const secondUp = await (await createRunner({ directory })).up();
        assert.deepEqual(secondUp.applied, []);

        const verified = await (await createRunner({ directory })).verify();
        assert.equal(verified.valid, true);
        assert.ok(verified.applied.includes('0001_runner_probe'));

        const rollback = await (await createRunner({ directory })).down('0001_runner_probe');
        assert.equal(rollback.rolledBack, '0001_runner_probe');

        const finalStatus = await (await createRunner({ directory })).status();
        assert.equal(finalStatus.applied.includes('0001_runner_probe'), false);
        assert.equal(finalStatus.pending.includes('0001_runner_probe'), true);
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test('migration failure preserves a safe cause for diagnosis', { timeout: 30000 }, async () => {
    assert.equal(process.env.NODE_ENV, 'test', 'test environment must be explicit');
    assert.match(process.env.DATABASE_URL || '', /chattbm_test/, 'must use disposable test database');

    const fs = require('node:fs');
    const os = require('node:os');
    const path = require('node:path');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chattbm-failed-migration-'));
    const id = '0001_invalid_probe';
    fs.writeFileSync(path.join(directory, id + '.up.sql'), 'THIS IS NOT VALID SQL;\n');
    fs.writeFileSync(path.join(directory, id + '.down.sql'), 'SELECT 1;\n');

    try {
        await assert.rejects(
            () => createRunner({ directory }).then((runner) => runner.up()),
            (error) => {
                assert.match(error.message, /Migration failed: 0001_invalid_probe/);
                assert.ok(error.cause, 'original database error should be retained');
                assert.equal(error.code, '42601');
                return true;
            }
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test('migration runner refuses rollback while a later migration remains applied', { timeout: 30000 }, async () => {
    assert.equal(process.env.NODE_ENV, 'test', 'test environment must be explicit');
    assert.match(process.env.DATABASE_URL || '', /chattbm_test/, 'must use disposable test database');

    const fs = require('node:fs');
    const os = require('node:os');
    const path = require('node:path');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chattbm-rollback-order-'));
    fs.writeFileSync(path.join(directory, '0001_order_probe.up.sql'), 'CREATE TABLE chattbm_order_probe (id INTEGER PRIMARY KEY);\n');
    fs.writeFileSync(path.join(directory, '0001_order_probe.down.sql'), 'DROP TABLE chattbm_order_probe;\n');
    fs.writeFileSync(path.join(directory, '0002_order_probe_child.up.sql'), 'CREATE TABLE chattbm_order_probe_child (id INTEGER PRIMARY KEY, parent_id INTEGER NOT NULL REFERENCES chattbm_order_probe(id));\n');
    fs.writeFileSync(path.join(directory, '0002_order_probe_child.down.sql'), 'DROP TABLE chattbm_order_probe_child;\n');

    try {
        await (await createRunner({ directory })).up();
        await assert.rejects(
            () => createRunner({ directory }).then((runner) => runner.down('0001_order_probe')),
            /Cannot roll back 0001_order_probe while later migration is applied: 0002_order_probe_child/
        );
        await (await createRunner({ directory })).down('0002_order_probe_child');
        await (await createRunner({ directory })).down('0001_order_probe');
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});


test('migration runner rejects a changed rollback file after application', { timeout: 30000 }, async () => {
    assert.equal(process.env.NODE_ENV, 'test', 'test environment must be explicit');
    assert.match(process.env.DATABASE_URL || '', /chattbm_test/, 'must use disposable test database');

    const fs = require('node:fs');
    const os = require('node:os');
    const path = require('node:path');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chattbm-down-checksum-'));
    const id = '0001_down_checksum_probe';
    const upPath = path.join(directory, id + '.up.sql');
    const downPath = path.join(directory, id + '.down.sql');
    const downSql = 'DROP TABLE chattbm_down_checksum_probe;\n';
    fs.writeFileSync(upPath, 'CREATE TABLE chattbm_down_checksum_probe (id INTEGER PRIMARY KEY);\n');
    fs.writeFileSync(downPath, downSql);

    try {
        await (await createRunner({ directory })).up();
        fs.writeFileSync(downPath, 'SELECT 1;\n');
        await assert.rejects(
            () => createRunner({ directory }).then((runner) => runner.verify()),
            /Applied migration down checksum mismatch: 0001_down_checksum_probe/
        );
    } finally {
        fs.writeFileSync(downPath, downSql);
        await (await createRunner({ directory })).down(id);
        fs.rmSync(directory, { recursive: true, force: true });
    }
});
