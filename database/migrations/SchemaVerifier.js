'use strict';

const VERIFIER_VERSION = '1';
const STATUSES = Object.freeze({
  COMPLETE: 'COMPLETE',
  ABSENT: 'ABSENT',
  PARTIAL_OR_CONFLICTING: 'PARTIAL_OR_CONFLICTING',
  BLOCKED: 'BLOCKED'
});

// Definitions mirror the reviewed migration SQL. Constraint and index checks
// use PostgreSQL's normalized catalog definitions, never generated names alone.
const SPECS = [
  ['001_auth_accounts_sessions', {
    chattbm_users: {
      columns: {id:'text!',email_normalized:'text!',password_hash:'text!',email_verified_at:'timestamptz?',created_at:'timestamptz!@now',updated_at:'timestamptz!@now',disabled_at:'timestamptz?'},
      constraints: ['PRIMARY KEY (id)','UNIQUE (email_normalized)']
    },
    chattbm_auth_sessions: {
      columns: {id:'text!',user_id:'text!',token_hash:'text!',created_at:'timestamptz!@now',expires_at:'timestamptz!',revoked_at:'timestamptz?',last_seen_at:'timestamptz?'},
      constraints: ['PRIMARY KEY (id)','UNIQUE (token_hash)','FOREIGN KEY (user_id) REFERENCES chattbm_users(id) ON DELETE CASCADE']
    }
  }, [
    ['chattbm_auth_sessions_user_id_idx','chattbm_auth_sessions','(user_id)'],
    ['chattbm_auth_sessions_expires_at_idx','chattbm_auth_sessions','(expires_at)']
  ]],
  ['002_chat_history', {chattbm_chat_history:{
    columns:{user_id:'text!',conversation_id:'text!',messages:'jsonb!',updated_at:'timestamptz!@now'},
    constraints:['PRIMARY KEY (user_id, conversation_id)','FOREIGN KEY (user_id) REFERENCES chattbm_users(id) ON DELETE CASCADE',"CHECK (jsonb_typeof(messages) = 'array')"]
  }}, [['chattbm_chat_history_updated_at_idx','chattbm_chat_history','(user_id, updated_at DESC)']]],
  ['002_google_oauth_identities', {chattbm_oauth_identities:{
    columns:{id:'text!',user_id:'text!',provider:'text!',provider_subject:'text!',created_at:'timestamptz!@now'},
    constraints:['PRIMARY KEY (id)','FOREIGN KEY (user_id) REFERENCES chattbm_users(id) ON DELETE CASCADE','UNIQUE (provider, provider_subject)','UNIQUE (user_id, provider)']
  }}, []],
  ['003_context_records', {chattbm_contexts:{
    columns:{id:'text!',user_id:'text!',interaction_id:'text!',version:'integer!',schema_version:'text!',lifecycle:'text!',created_at:'timestamptz!',updated_at:'timestamptz!',payload:'jsonb!'},
    constraints:['PRIMARY KEY (id)','FOREIGN KEY (user_id) REFERENCES chattbm_users(id) ON DELETE CASCADE','UNIQUE (user_id, interaction_id)','CHECK (version >= 1)',"CHECK (jsonb_typeof(payload) = 'object')"]
  }}, [['chattbm_contexts_user_created_idx','chattbm_contexts','(user_id, created_at DESC)'],['chattbm_contexts_user_updated_idx','chattbm_contexts','(user_id, updated_at DESC)']]],
  ['003_google_oauth_states', {chattbm_google_oauth_states:{
    columns:{state_hash:'text!',link_user_id:'text?',expires_at:'timestamptz!',created_at:'timestamptz!@now'},
    constraints:['PRIMARY KEY (state_hash)','FOREIGN KEY (link_user_id) REFERENCES chattbm_users(id) ON DELETE CASCADE']
  }}, [['chattbm_google_oauth_states_expires_at_idx','chattbm_google_oauth_states','(expires_at)']]],
  ['004_password_reset_tokens', {chattbm_password_reset_tokens:{
    columns:{id:'text!',user_id:'text!',token_hash:'text!',created_at:'timestamptz!@now',expires_at:'timestamptz!',used_at:'timestamptz?'},
    constraints:['PRIMARY KEY (id)','UNIQUE (token_hash)','FOREIGN KEY (user_id) REFERENCES chattbm_users(id) ON DELETE CASCADE']
  }}, [['chattbm_password_reset_tokens_user_created_idx','chattbm_password_reset_tokens','(user_id, created_at DESC)'],['chattbm_password_reset_tokens_expires_idx','chattbm_password_reset_tokens','(expires_at)']]],
  ['005_auth_rate_limits', {chattbm_auth_rate_limits:{
    columns:{bucket_key:'text!',window_started_at:'timestamptz!',request_count:'integer!',expires_at:'timestamptz!',updated_at:'timestamptz!@now'},
    constraints:['PRIMARY KEY (bucket_key)','CHECK (request_count >= 1)']
  }}, [['chattbm_auth_rate_limits_expires_at_idx','chattbm_auth_rate_limits','(expires_at)']]],
  ['006_email_verification_tokens', {chattbm_email_verification_tokens:{
    columns:{id:'text!',user_id:'text!',token_hash:'text!',created_at:'timestamptz!@now',expires_at:'timestamptz!',used_at:'timestamptz?'},
    constraints:['PRIMARY KEY (id)','UNIQUE (token_hash)','FOREIGN KEY (user_id) REFERENCES chattbm_users(id) ON DELETE CASCADE']
  }}, [['chattbm_email_verification_tokens_user_id_idx','chattbm_email_verification_tokens','(user_id)'],['chattbm_email_verification_tokens_expires_at_idx','chattbm_email_verification_tokens','(expires_at)'],['chattbm_email_verification_tokens_active_user_idx','chattbm_email_verification_tokens','(user_id)','used_at IS NULL']]]
];

const QUERIES = [
  `SELECT c.relname AS table_name,c.relkind AS kind FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=$1 AND c.relname=ANY($2::text[])`,
  `SELECT c.relname AS table_name,a.attname AS column_name,pg_catalog.format_type(a.atttypid,a.atttypmod) AS data_type,a.attnotnull AS not_null,pg_catalog.pg_get_expr(d.adbin,d.adrelid) AS default_expr FROM pg_catalog.pg_attribute a JOIN pg_catalog.pg_class c ON c.oid=a.attrelid JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace LEFT JOIN pg_catalog.pg_attrdef d ON d.adrelid=c.oid AND d.adnum=a.attnum WHERE n.nspname=$1 AND c.relname=ANY($2::text[]) AND a.attnum>0 AND NOT a.attisdropped`,
  `SELECT c.relname AS table_name,pg_catalog.pg_get_constraintdef(k.oid,true) AS definition FROM pg_catalog.pg_constraint k JOIN pg_catalog.pg_class c ON c.oid=k.conrelid JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=$1 AND c.relname=ANY($2::text[])`,
  `SELECT t.relname AS table_name,x.relname AS index_name,pg_catalog.pg_get_indexdef(i.indexrelid) AS definition,pg_catalog.pg_get_expr(i.indpred,i.indrelid) AS predicate,i.indisunique AS is_unique FROM pg_catalog.pg_index i JOIN pg_catalog.pg_class t ON t.oid=i.indrelid JOIN pg_catalog.pg_namespace n ON n.oid=t.relnamespace JOIN pg_catalog.pg_class x ON x.oid=i.indexrelid WHERE n.nspname=$1 AND t.relname=ANY($2::text[])`
];

const norm = value => String(value || '').toLowerCase().replace(/["']/g,'').replace(/\\s+/g,' ').trim();
const normalizeCheck = value => {
  let normalized = norm(value).replace(/::[a-zA-Z_][a-zA-Z0-9_ ]*/g, '').trim();
  while (normalized.startsWith('(') && normalized.endsWith(')')) {
    let depth = 0;
    let wrapsWholeExpression = true;
    for (let i = 0; i < normalized.length; i++) {
      if (normalized[i] === '(') depth++;
      if (normalized[i] === ')') depth--;
      if (depth === 0 && i < normalized.length - 1) { wrapsWholeExpression = false; break; }
    }
    if (!wrapsWholeExpression) break;
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized.replace(/\\s*([<>=!]+)\\s*/g, '$1').replace(/\\s+/g, ' ');
};
const schemaValid = value => typeof value === 'string' && value.length > 0 && value.length <= 63 && /^[a-zA-Z_][a-zA-Z0-9_$]*$/.test(value);
const allTables = [...new Set(SPECS.flatMap(([,tables]) => Object.keys(tables)))];

function migrationResult(spec, relations, columns, constraints, indexes) {
  const [migrationId, tables, expectedIndexes] = spec;
  const names = Object.keys(tables);
  const present = names.filter(name => relations.has(name));
  if (migrationId !== '001_auth_accounts_sessions' && names.some(name => name !== 'chattbm_users') && !relations.has('chattbm_users')) {
    return {migrationId,status:STATUSES.BLOCKED,reasons:['PREREQUISITE_USERS_TABLE_MISSING'],objects:[]};
  }
  if (!present.length) {
    if (migrationId === '006_email_verification_tokens' && columns.some(row => row.table_name === 'chattbm_users' && row.column_name === 'email_verified_at')) return {migrationId,status:STATUSES.PARTIAL_OR_CONFLICTING,reasons:['EMAIL_VERIFICATION_COLUMN_PRESENT_BUT_TOKEN_TABLE_ABSENT'],objects:names.map(name=>({name,status:'MISSING'}))};
    return {migrationId,status:STATUSES.ABSENT,reasons:['MIGRATION_OBJECTS_ABSENT'],objects:names.map(name=>({name,status:'MISSING'}))};
  }

  let conflict = false;
  const objects = [];
  for (const [tableName, expected] of Object.entries(tables)) {
    if (!relations.has(tableName)) {
      conflict = true; objects.push({name:tableName,status:'MISSING',reasons:['EXPECTED_TABLE_MISSING']}); continue;
    }
    const reasons = [];
    const actualColumns = columns.filter(row=>row.table_name===tableName);
    for (const [columnName, contract] of Object.entries(expected.columns)) {
      const actual = actualColumns.find(row=>row.column_name===columnName);
      if (!actual) { reasons.push('COLUMN_MISSING:'+columnName); continue; }
      const [type, nullable, defaultMarker] = contract.match(/^([^!?@]+)([!?])?(?:@(.*))?$/).slice(1);
      const actualType = norm(actual.data_type).replace('timestamp with time zone','timestamptz');
      if (actualType !== type) reasons.push('COLUMN_TYPE_MISMATCH:'+columnName);
      if (Boolean(actual.not_null) !== (nullable === '!')) reasons.push('COLUMN_NULLABILITY_MISMATCH:'+columnName);
      if (defaultMarker && !norm(actual.default_expr).includes('now')) reasons.push('COLUMN_DEFAULT_MISMATCH:'+columnName);
    }
    const actualDefs = constraints.filter(row=>row.table_name===tableName).map(row=>norm(row.definition));
    for (const definition of expected.constraints) {
      const target = norm(definition);
      const matched = actualDefs.some(actual=> target.startsWith('check') ? normalizeCheck(actual) === normalizeCheck(target) : target.startsWith('foreign key')
        ? actual.includes('foreign key') && actual.includes('references chattbm_users') && actual.includes('on delete cascade') && actual.includes(target.match(/\(([^)]+)\)/)?.[1] || '')
        : actual === target);
      if (!matched) reasons.push('CONSTRAINT_MISSING_OR_MISMATCHED');
    }
    if (reasons.length) { conflict=true; objects.push({name:tableName,status:'CONFLICTING',reasons}); }
    else objects.push({name:tableName,status:'COMPATIBLE',reasons:[]});
  }
  for (const [name,tableName,keyText,predicate] of expectedIndexes) {
    const actual = indexes.find(row=>row.index_name===name && row.table_name===tableName);
    if (!actual) { conflict=true; objects.push({name,status:'MISSING',reasons:['INDEX_MISSING']}); continue; }
    const def = norm(actual.definition);
    const keysMatch = def.includes(norm(keyText)) && def.includes('using btree') && !actual.is_unique;
    const predicateMatch = predicate ? norm(actual.predicate).replace(/[()]/g,'')===norm(predicate).replace(/[()]/g,'') : !actual.predicate;
    if (!keysMatch || !predicateMatch) { conflict=true; objects.push({name,status:'CONFLICTING',reasons:['INDEX_DEFINITION_MISMATCH']}); }
    else objects.push({name,status:'COMPATIBLE',reasons:[]});
  }
  return {migrationId,status:conflict?STATUSES.PARTIAL_OR_CONFLICTING:STATUSES.COMPLETE,reasons:conflict?['EXPECTED_SCHEMA_OBJECT_MISSING_OR_INCOMPATIBLE']:[],objects};
}

async function verifyMigrationSchema({client,schema}={}) {
  if (!client || typeof client.query !== 'function') throw new TypeError('A caller-owned PostgreSQL client is required.');
  if (!schemaValid(schema)) throw new TypeError('A valid schema name must be supplied explicitly.');
  let begun = false;
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY'); begun = true;
    const results = [];
    for (const sql of QUERIES) results.push(await client.query(sql,[schema,allTables]));
    const relations = new Set(results[0].rows.filter(row=>row.kind==='r'||row.kind==='p').map(row=>row.table_name));
    const migrations = SPECS.map(spec=>migrationResult(spec,relations,results[1].rows,results[2].rows,results[3].rows));
    await client.query('ROLLBACK'); begun = false;
    return {verifierVersion:VERIFIER_VERSION,schema,readOnly:true,migrations};
  } catch (_) {
    if (begun) { try { await client.query('ROLLBACK'); } catch (_) {} }
    return {verifierVersion:VERIFIER_VERSION,schema,readOnly:true,migrations:SPECS.map(([migrationId])=>({migrationId,status:STATUSES.BLOCKED,reasons:['CATALOG_OR_TRANSACTION_FAILURE'],objects:[]}))};
  }
}

module.exports = {verifyMigrationSchema,STATUSES,VERIFIER_VERSION};
