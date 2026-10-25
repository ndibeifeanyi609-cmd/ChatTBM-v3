'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createRunner } = require('../../scripts/db-migrate');

test('migration runner applies, verifies, repeats, and rolls back harmless probe migration', { timeout: 30000 }, async () => {
    assert.equal(process.env.NODE_ENV, 'test', 'test environment must be explicit');
    assert.match(process.env.DATABASE_URL || '', /chattbm_test/, 'must use disposable test database');

    const runner = await createRunner();
    const initial = await runner.status();
    assert.ok(Array.isArray(initial.pending));
    assert.ok(Array.isArray(initial.applied));

    const firstUp = await runner.up();
    assert.ok(firstUp.applied.includes('0001_runner_probe'));

    const secondUp = await (await createRunner()).up();
    assert.deepEqual(secondUp.applied, []);

    const verified = await (await createRunner()).verify();
    assert.equal(verified.valid, true);
    assert.ok(verified.applied.includes('0001_runner_probe'));

    const rollback = await (await createRunner()).down('0001_runner_probe');
    assert.equal(rollback.rolledBack, '0001_runner_probe');

    const finalStatus = await (await createRunner()).status();
    assert.equal(finalStatus.applied.includes('0001_runner_probe'), false);
    assert.equal(finalStatus.pending.includes('0001_runner_probe'), true);
});
