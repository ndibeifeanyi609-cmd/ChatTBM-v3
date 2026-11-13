'use strict';

const assert = require('node:assert/strict');
const { Client } = require('pg');
const constraintQuery = require('../database/stagingConstraintInventoryQuery');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.log('STAGING_CONSTRAINT_INVENTORY_TESTS_SKIPPED: DATABASE_URL is not configured.');
    process.exit(0);
}
const parsed = new URL(connectionString);
const databaseName = decodeURIComponent(parsed.pathname.slice(1));
if (databaseName !== 'chattbm_test' || !['localhost', '127.0.0.1'].includes(parsed.hostname)) {
    throw new Error('Refusing to run constraint tests outside the local chattbm_test database.');
}

function parsePgTextArray(value) {
    if (value === null || value === undefined) return null;
    if (!Array.isArray(value)) {
        throw new Error(`Expected PostgreSQL text[] to be parsed as an array; received: ${String(value)}`);
    }
    return value;
}

async function main() {
    const client = new Client({ connectionString });
    await client.connect();
    try {
        await client.query('BEGIN');
        await client.query(`
            CREATE TABLE public.chattbm_constraint_parent (
                tenant_id integer NOT NULL,
                record_id integer NOT NULL,
                label text NOT NULL,
                CONSTRAINT chattbm_constraint_parent_pk PRIMARY KEY (tenant_id, record_id),
                CONSTRAINT chattbm_constraint_parent_label_uq UNIQUE (tenant_id, label)
            )
        `);
        await client.query(`
            CREATE TABLE public.chattbm_constraint_child (
                tenant_id integer NOT NULL,
                record_id integer NOT NULL,
                amount integer NOT NULL,
                CONSTRAINT chattbm_constraint_child_fk
                    FOREIGN KEY (tenant_id, record_id)
                    REFERENCES public.chattbm_constraint_parent (tenant_id, record_id)
                    DEFERRABLE INITIALLY DEFERRED
            )
        `);
        await client.query(`ALTER TABLE public.chattbm_constraint_child
            ADD CONSTRAINT chattbm_constraint_child_amount_ck CHECK (amount > 0) NOT VALID`);

        const result = await client.query(constraintQuery);
        const rows = result.rows
            .filter(row =>
                ['chattbm_constraint_parent', 'chattbm_constraint_child'].includes(row.table_name)
            )
            .map(row => ({
                ...row,
                columns: parsePgTextArray(row.columns),
                foreign_columns: row.foreign_columns === null
                    ? null
                    : parsePgTextArray(row.foreign_columns)
            }));
        const byName = Object.fromEntries(rows.map(row => [row.constraint_name, row]));

        assert.ok(byName.chattbm_constraint_parent_pk, 'primary key is inventoried');
        assert.deepEqual(byName.chattbm_constraint_parent_pk.columns, ['tenant_id', 'record_id']);
        assert.ok(byName.chattbm_constraint_parent_label_uq, 'unique constraint is inventoried');

        const fk = byName.chattbm_constraint_child_fk;
        assert.ok(fk, 'foreign key is inventoried');
        assert.deepEqual(fk.columns, ['tenant_id', 'record_id']);
        assert.equal(fk.foreign_table_schema, 'public');
        assert.equal(fk.foreign_table_name, 'chattbm_constraint_parent');
        assert.deepEqual(fk.foreign_columns, ['tenant_id', 'record_id']);
        assert.match(fk.definition, /FOREIGN KEY \(tenant_id, record_id\)/);
        assert.equal(fk.is_deferrable, true);
        assert.equal(fk.is_initially_deferred, true);
        assert.equal(fk.is_validated, true);

        const check = byName.chattbm_constraint_child_amount_ck;
        assert.ok(check, 'check constraint is inventoried');
        assert.match(check.definition, /CHECK \(amount > 0\)/);
        assert.equal(check.is_validated, false);

        assert.ok(rows.every(row => row.constraint_type !== 'NOT NULL'));
        assert.ok(rows.every(row => !String(row.constraint_name).includes('not_null')));
        console.log('STAGING_CONSTRAINT_INVENTORY_TESTS_OK');
        await client.query('ROLLBACK');
    } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
    } finally {
        await client.end();
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
