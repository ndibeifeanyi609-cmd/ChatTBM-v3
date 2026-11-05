'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { discoverMigrations, checksum } = require('../../scripts/db-migrate');

test('migration discovery ignores non-migration files and returns ordered pairs', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chattbm-migrations-'));
    try {
        fs.writeFileSync(path.join(directory, 'README.md'), 'notes');
        fs.writeFileSync(path.join(directory, '.gitkeep'), '');
        fs.writeFileSync(path.join(directory, '0002_second.up.sql'), 'SELECT 2;');
        fs.writeFileSync(path.join(directory, '0002_second.down.sql'), 'SELECT 0;');
        fs.writeFileSync(path.join(directory, '0001_first.up.sql'), 'SELECT 1;');
        const found = discoverMigrations(directory);
        assert.deepEqual(found.map((item) => item.id), ['0001_first', '0002_second']);
        assert.equal(found[0].downPath, null);
        assert.ok(found[1].downPath.endsWith('0002_second.down.sql'));
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test('migration discovery rejects a down-only migration', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chattbm-migrations-'));
    try {
        fs.writeFileSync(path.join(directory, '0001_orphan.down.sql'), 'SELECT 0;');
        assert.throws(() => discoverMigrations(directory), /Missing up migration/);
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test('migration checksums are deterministic SHA-256 digests', () => {
    assert.equal(checksum('SELECT 1;'), checksum('SELECT 1;'));
    assert.notEqual(checksum('SELECT 1;'), checksum('SELECT 2;'));
});
