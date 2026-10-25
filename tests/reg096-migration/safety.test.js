'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { assertSafeTarget } = require('../../scripts/db-migrate');

const identity = { database: 'chattbm_test', username: 'chattbm_test', host: 'postgres' };
const env = { NODE_ENV: 'test', CHATTBM_MIGRATION_TEST_HOSTS: 'postgres' };

test('migration target requires explicit test environment', () => {
    assert.throws(() => assertSafeTarget(identity, { ...env, NODE_ENV: 'development' }), /restricted to NODE_ENV=test/);
});

test('migration target rejects non-test database', () => {
    assert.throws(() => assertSafeTarget({ ...identity, database: 'chattbm' }, env), /outside a \\*_test database/);
});

test('migration target rejects missing approved-host configuration', () => {
    assert.throws(() => assertSafeTarget(identity, { NODE_ENV: 'test' }), /host is not explicitly approved/);
});

test('migration target rejects host not on explicit allowlist', () => {
    assert.throws(() => assertSafeTarget({ ...identity, host: 'production.example.com' }, env), /host is not explicitly approved/);
});

test('migration target accepts explicitly approved disposable host', () => {
    assert.doesNotThrow(() => assertSafeTarget(identity, env));
});

test('environment overrides cannot authorize production mode', () => {
    assert.throws(() => assertSafeTarget({ ...identity, database: 'chattbm' }, {
        ...env,
        NODE_ENV: 'production',
        CHATTBM_MIGRATION_ALLOW_NONTEST: 'true',
        CHATTBM_MIGRATION_ALLOW_PRODUCTION: 'true'
    }), /restricted to NODE_ENV=test/);
});

test('test mode cannot target production database even with override flags', () => {
    assert.throws(() => assertSafeTarget({ ...identity, database: 'chattbm' }, {
        ...env,
        CHATTBM_MIGRATION_ALLOW_NONTEST: 'true',
        CHATTBM_MIGRATION_ALLOW_PRODUCTION: 'true'
    }), /outside a \\*_test database/);
});
