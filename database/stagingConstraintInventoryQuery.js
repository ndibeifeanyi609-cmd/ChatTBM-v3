'use strict';

// Shared by the read-only staging diagnostic route and its PostgreSQL integration test.
module.exports = `SELECT
    ns.nspname AS table_schema,
    tbl.relname AS table_name,
    con.conname AS constraint_name,
    CASE con.contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'c' THEN 'CHECK'
        WHEN 'x' THEN 'EXCLUSION'
        ELSE con.contype::text
    END AS constraint_type,
    ARRAY(
        SELECT att.attname
        FROM unnest(con.conkey) WITH ORDINALITY AS key_col(attnum, ord)
        JOIN pg_attribute att
          ON att.attrelid = con.conrelid
         AND att.attnum = key_col.attnum
        ORDER BY key_col.ord
    )::text[] AS columns,
    CASE WHEN con.contype = 'f' THEN ref_ns.nspname ELSE NULL END
        AS foreign_table_schema,
    CASE WHEN con.contype = 'f' THEN ref_tbl.relname ELSE NULL END
        AS foreign_table_name,
    CASE WHEN con.contype = 'f' THEN ARRAY(
        SELECT att.attname
        FROM unnest(con.confkey) WITH ORDINALITY AS ref_col(attnum, ord)
        JOIN pg_attribute att
          ON att.attrelid = con.confrelid
         AND att.attnum = ref_col.attnum
        ORDER BY ref_col.ord
    )::text[] ELSE NULL END AS foreign_columns,
    pg_get_constraintdef(con.oid, true) AS definition,
    con.condeferrable AS is_deferrable,
    con.condeferred AS is_initially_deferred,
    con.convalidated AS is_validated
FROM pg_constraint con
JOIN pg_class tbl ON tbl.oid = con.conrelid
JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
LEFT JOIN pg_class ref_tbl ON ref_tbl.oid = con.confrelid
LEFT JOIN pg_namespace ref_ns ON ref_ns.oid = ref_tbl.relnamespace
WHERE ns.nspname = 'public'
  AND tbl.relkind IN ('r', 'p')
  AND left(tbl.relname, 8) = 'chattbm_'
  AND con.contype IN ('p', 'u', 'f', 'c', 'x')
ORDER BY ns.nspname, tbl.relname, con.conname`;
