'use strict';

// Read-only schema comparison. This tool intentionally refuses every database
// except an explicitly named loopback PostgreSQL 18 disposable test database.
const crypto = require('node:crypto');

function canonicalize(value) {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.keys(value).sort().map(key => [key, canonicalize(value[key])])
        );
    }
    return value;
}

function canonicalJson(value) {
    return JSON.stringify(canonicalize(value));
}

function fingerprint(value) {
    return crypto.createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex');
}

function compareManifests(expected, actual) {
    const expectedJson = canonicalJson(expected);
    const actualJson = canonicalJson(actual);
    return {
        matches: expectedJson === actualJson,
        expectedFingerprint: fingerprint(expected),
        actualFingerprint: fingerprint(actual),
        expectedOnly: expectedJson === actualJson ? [] : findDifferences(expected, actual, 'expected'),
        actualOnly: expectedJson === actualJson ? [] : findDifferences(actual, expected, 'actual')
    };
}

function findDifferences(left, right, side, path = '$', out = []) {
    if (canonicalJson(left) === canonicalJson(right)) return out;
    if (
        left && right &&
        typeof left === 'object' && typeof right === 'object' &&
        !Array.isArray(left) && !Array.isArray(right)
    ) {
        const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
        for (const key of [...keys].sort()) {
            if (!(key in right)) out.push({ path: path + '.' + key, side });
            else if (!(key in left)) out.push({ path: path + '.' + key, side: side === 'expected' ? 'actual' : 'expected' });
            else findDifferences(left[key], right[key], side, path + '.' + key, out);
        }
        return out;
    }
    out.push({ path, side });
    return out;
}


function assertSafeConnectionString(connectionString) {
    let url;
    try {
        url = new URL(connectionString);
    } catch (_) {
        throw new Error('Refusing schema comparison: DATABASE_URL is not a valid URL.');
    }
    const host = url.hostname.toLowerCase();
    const loopback = host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]';
    const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ''));
    if (!loopback || databaseName !== 'chattbm_test') {
        throw new Error('Refusing schema comparison: target must be loopback database chattbm_test.');
    }
}

function assertSafeTarget(connectionString, databaseName, serverVersionNum) {
    let url;
    try {
        url = new URL(connectionString);
    } catch (_) {
        throw new Error('Refusing schema comparison: DATABASE_URL is not a valid URL.');
    }

    const host = url.hostname.toLowerCase();
    const loopback = host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]';
    if (!loopback || databaseName !== 'chattbm_test') {
        throw new Error('Refusing schema comparison: target must be loopback database chattbm_test.');
    }
    if (Number(serverVersionNum) < 180000 || Number(serverVersionNum) >= 190000) {
        throw new Error('Refusing schema comparison: PostgreSQL 18 is required.');
    }
}

const CATALOG_SQL = `
SELECT jsonb_build_object(
  'tables', COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'schema', c.table_schema,
      'name', c.table_name,
      'columns', (
        SELECT jsonb_agg(jsonb_build_object(
          'position', c2.ordinal_position,
          'name', c2.column_name,
          'type', c2.udt_schema || '.' || c2.udt_name,
          'nullable', c2.is_nullable = 'YES',
          'default', c2.column_default
        ) ORDER BY c2.ordinal_position)
        FROM information_schema.columns c2
        WHERE c2.table_schema = c.table_schema AND c2.table_name = c.table_name
      )
    ) ORDER BY c.table_schema, c.table_name)
    FROM information_schema.tables c
    WHERE c.table_schema = 'public'
      AND c.table_type = 'BASE TABLE'
      AND c.table_name LIKE 'chattbm_%'
  ), '[]'::jsonb),
  'constraints', COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'schema', ns.nspname,
      'table', cls.relname,
      'name', con.conname,
      'type', con.contype,
      'definition', pg_get_constraintdef(con.oid),
      'deferrable', con.condeferrable,
      'deferred', con.condeferred,
      'validated', con.convalidated
    ) ORDER BY ns.nspname, cls.relname, con.conname)
    FROM pg_constraint con
    JOIN pg_class cls ON cls.oid = con.conrelid
    JOIN pg_namespace ns ON ns.oid = cls.relnamespace
    WHERE ns.nspname = 'public'
      AND cls.relname LIKE 'chattbm\\_%' ESCAPE '\\'
      AND con.contype <> 'n'
  ), '[]'::jsonb),
  'indexes', COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'table', tablename,
      'name', indexname,
      'definition', indexdef
    ) ORDER BY tablename, indexname)
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename LIKE 'chattbm_%'
  ), '[]'::jsonb)
) AS manifest;
`;

async function readLiveManifest(client) {
    assertSafeConnectionString(process.env.DATABASE_URL);
    await client.query('BEGIN READ ONLY');
    try {
        const version = await client.query('SHOW server_version_num');
        const database = await client.query('SELECT current_database() AS name');
        assertSafeTarget(process.env.DATABASE_URL, database.rows[0].name, version.rows[0].server_version_num);
        const result = await client.query(CATALOG_SQL);
        await client.query('COMMIT');
        return result.rows[0].manifest;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}

module.exports = {
    canonicalize,
    canonicalJson,
    fingerprint,
    compareManifests,
    assertSafeConnectionString,
    assertSafeTarget,
    readLiveManifest,
    CATALOG_SQL
};
