'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { assertSafeTarget } = require('../../scripts/db-migrate');

const identity = { database: 'chattbm_test', username: 'chattbm_test' };

test('migration target requires explicit test environment by default', () => {
    assert.throws(() => assertSafeTarget(identity, { NODE_ENV: 'development' }), /require NODE_ENV=test/);
});

test('migration target rejects non-test database by default', () => {
    assert.throws(() => assertSafeTarget({ database: 'chattbm', username: 'chattbm_test' }, { NODE_ENV: 'test' }), /outside a \*_test database/);
});

test('migration target accepts disposable test database', () => {
    assert.doesNotThrow(() => assertSafeTarget(identity, { NODE_ENV: 'test' }));
});

test('production target requires separate production approval', () => {
    assert.throws(() => assertSafeTarget({ database: 'chattbm_test', username: 'chattbm_test' }, {
        NODE_ENV: 'production',
        CHATTBM_MIGRATION_ALLOW_NONTEST: 'true'
    }), /separate explicit approval/);
});
