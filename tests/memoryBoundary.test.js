'use strict';

const assert = require('assert');

const T = require('../memory/MemoryTypes');
const L = require('../memory/MemoryLifecycle');
const O = require('../memory/MemoryObject');
const P = require('../memory/MemoryPersistence');
const R = require('../memory/MemoryRegistry');
const B = require('../memory/MemoryBoundary');

function memory(x = {}) {
  return O.createMemoryObject({
    userId: 'memory-test-user',
    type: 'preference',
    subject: 'contentStyle',
    value: 'educational',
    provenance: {
      sourceType: 'user',
      sourceId: 'msg-001',
      sourceVersion: '1.0'
    },
    ...x
  });
}

function runTests() {
  console.log('\n=== MEMORY FOUNDATION TEST ===\n');

  P.clearMemoryPersistence();
  R.clearRegistry();


  assert.strictEqual(T.isValidMemoryType('preference'), true);
  console.log('✓ Memory types');

  assert.strictEqual(L.isValidLifecycleState('proposed'), true);
  assert.strictEqual(L.canTransition('proposed', 'active'), true);
  assert.strictEqual(L.canTransition('proposed', 'rejected'), true);
  assert.strictEqual(L.canTransition('active', 'superseded'), true);
  assert.strictEqual(L.canTransition('active', 'proposed'), false);
  assert.strictEqual(L.canTransition('superseded', 'active'), false);
  console.log('✓ Memory lifecycle');

  const m = memory();

  for (const k of [
    'id',
    'version',
    'userId',
    'type',
    'subject',
    'value',
    'provenance',
    'lifecycle',
    'createdAt',
    'updatedAt'
  ]) {
    assert.ok(k in m, `Missing field: ${k}`);
  }

  assert.strictEqual(m.version, O.MEMORY_OBJECT_VERSION);
  assert.strictEqual(m.userId, 'memory-test-user');
  assert.strictEqual(m.type, 'preference');
  assert.strictEqual(m.subject, 'contentStyle');
  assert.strictEqual(m.value, 'educational');
  assert.strictEqual(m.lifecycle, 'proposed');

  console.log('✓ Memory object contract');

  assert.throws(() =>
    memory({ type: 'invalid-memory-type' })
  );

  console.log('✓ Memory object validation');

  const lifecycle = L.transitionMemory(m, 'active');

  assert.strictEqual(lifecycle.success, true);

  const repeat = L.transitionMemory(
    lifecycle.memory,
    'active'
  );

  assert.strictEqual(repeat.success, true);
  assert.strictEqual(repeat.idempotent, true);

  const bad = L.transitionMemory(
    lifecycle.memory,
    'proposed'
  );

  assert.strictEqual(bad.success, false);

  const superseded = L.transitionMemory(
    lifecycle.memory,
    'superseded'
  );

  assert.strictEqual(superseded.success, true);
  assert.strictEqual(
    superseded.memory.lifecycle,
    'superseded'
  );

  const terminal = L.transitionMemory(
    superseded.memory,
    'active'
  );

  assert.strictEqual(terminal.success, false);

  console.log('✓ Memory lifecycle transitions');

  const created = B.createMemory({
    userId: 'boundary-memory-user',
    type: 'preference',
    subject: 'tone',
    value: 'direct',
    provenance: {
      sourceType: 'user',
      sourceId: 'msg-boundary',
      sourceVersion: '1.0'
    }
  });

  assert.strictEqual(created.success, true);
  assert.ok(created.memory.id);

  const duplicate = B.createMemory({
    userId: 'boundary-memory-user',
    type: 'preference',
    subject: 'tone',
    value: 'direct',
    provenance: {
      sourceType: 'user',
      sourceId: 'msg-boundary',
      sourceVersion: '1.0'
    }
  });

  assert.strictEqual(duplicate.success, false);
  assert.strictEqual(duplicate.conflict, true);
  const conflicting = B.createMemory({
    userId: 'boundary-memory-user',
    type: 'preference',
    subject: 'tone',
    value: 'casual',
    provenance: {
      sourceType: 'user',
      sourceId: 'msg-conflict',
      sourceVersion: '1.0'
    }
  });

  assert.strictEqual(conflicting.success, false);
  assert.strictEqual(conflicting.conflict, true);

  const fetched = B.getMemory(
    created.memory.id,
    'boundary-memory-user'
  );

  assert.strictEqual(fetched.success, true);
  assert.strictEqual(fetched.memory.value, 'direct');

  const listed = B.getMemoriesByUser(
    'boundary-memory-user'
  );

  assert.strictEqual(listed.success, true);
  assert.strictEqual(listed.memories.length, 1);

  console.log('✓ Memory boundary creation and retrieval');

  const updated = B.updateMemory(
    {
      id: created.memory.id,
      value: 'concise'
    },
    'boundary-memory-user'
  );

  assert.strictEqual(updated.success, true);
  assert.strictEqual(updated.memory.value, 'concise');

  console.log('✓ Memory ordinary update');

  const identityTypeChange = B.updateMemory(
    {
      id: created.memory.id,
      type: 'fact'
    },
    'boundary-memory-user'
  );

  assert.strictEqual(identityTypeChange.success, false);
  assert.strictEqual(identityTypeChange.conflict, true);

  const identitySubjectChange = B.updateMemory(
    {
      id: created.memory.id,
      subject: 'responseStyle'
    },
    'boundary-memory-user'
  );

  assert.strictEqual(identitySubjectChange.success, false);
  assert.strictEqual(identitySubjectChange.conflict, true);

  const unchanged = B.getMemory(
    created.memory.id,
    'boundary-memory-user'
  );

  assert.strictEqual(unchanged.success, true);
  assert.strictEqual(unchanged.memory.type, 'preference');
  assert.strictEqual(unchanged.memory.subject, 'tone');
  assert.strictEqual(unchanged.memory.value, 'concise');

  console.log('✓ Memory identity immutability');

  const lifecycleMemory = B.createMemory({
    userId: 'memory-lifecycle-user',
    type: 'preference',
    subject: 'format',
    value: 'short',
    provenance: {
      sourceType: 'test'
    }
  });

  assert.strictEqual(lifecycleMemory.success, true);

  const activated = B.transitionMemoryLifecycle(
    lifecycleMemory.memory.id,
    'active',
    'memory-lifecycle-user'
  );

  assert.strictEqual(activated.success, true);
  assert.strictEqual(activated.memory.lifecycle, 'active');

  const idempotentLifecycle =
    B.transitionMemoryLifecycle(
      lifecycleMemory.memory.id,
      'active',
      'memory-lifecycle-user'
    );

  assert.strictEqual(idempotentLifecycle.success, true);
  assert.strictEqual(idempotentLifecycle.idempotent, true);

  const invalidLifecycle = B.updateMemory(
    {
      id: lifecycleMemory.memory.id,
      lifecycle: 'superseded'
    },
    'memory-lifecycle-user'
  );

  assert.strictEqual(invalidLifecycle.success, false);

  const currentLifecycle = B.getMemory(
    lifecycleMemory.memory.id,
    'memory-lifecycle-user'
  );

  assert.strictEqual(currentLifecycle.success, true);
  assert.strictEqual(currentLifecycle.memory.lifecycle, 'active');

  console.log('✓ Memory lifecycle boundary');

  const foreignRead = B.getMemory(
    created.memory.id,
    'other-memory-user'
  );

  assert.strictEqual(foreignRead.success, false);
  assert.strictEqual(
    foreignRead.error,
    'Memory ownership violation.'
  );

  const foreignUpdate = B.updateMemory(
    {
      id: created.memory.id,
      value: 'foreign'
    },
    'other-memory-user'
  );

  assert.strictEqual(foreignUpdate.success, false);
  assert.strictEqual(
    foreignUpdate.error,
    'Memory ownership violation.'
  );

  console.log('✓ Memory ownership');

  const saved = P.saveMemory(m);

  assert.strictEqual(saved.success, true);

  const got = P.getMemory(m.id);

  assert.ok(got);
  assert.strictEqual(got.id, m.id);
  assert.deepStrictEqual(got.provenance, m.provenance);

  const duplicateSave = P.saveMemory(m);

  assert.strictEqual(duplicateSave.success, true);
  assert.strictEqual(duplicateSave.idempotent, true);

  const foreignPersistenceUpdate = P.updateMemory({
    ...m,
    userId: 'different-memory-user'
  });

  assert.strictEqual(
    foreignPersistenceUpdate.success,
    false
  );

  assert.strictEqual(
    P.getMemory(m.id).userId,
    'memory-test-user'
  );

  const persistenceIdentityChange = P.updateMemory({
    ...m,
    subject: 'differentSubject'
  });

  assert.strictEqual(
    persistenceIdentityChange.success,
    false
  );
  assert.strictEqual(
    persistenceIdentityChange.conflict,
    true
  );

  console.log('✓ Memory persistence');

  const registered = R.registerMemory(m);

  assert.strictEqual(
    registered.registered,
    true
  );

  const registeredMemory = R.getMemory(m.id);

  assert.ok(registeredMemory);
  assert.strictEqual(
    registeredMemory.id,
    m.id
  );

  const registryIdentityChange = R.registerMemory({
    ...m,
    subject: 'differentSubject'
  });

  assert.strictEqual(
    registryIdentityChange.registered,
    false
  );
  assert.strictEqual(
    registryIdentityChange.conflict,
    true
  );

  console.log('✓ Memory registry');

  const deleted = B.deleteMemory(
    created.memory.id,
    'boundary-memory-user'
  );

  assert.strictEqual(deleted.success, true);

  const afterDelete = B.getMemory(
    created.memory.id,
    'boundary-memory-user'
  );

  assert.strictEqual(afterDelete.success, false);

  console.log('✓ Memory deletion');

  P.clearMemoryPersistence();

  console.log('\n=== ALL MEMORY FOUNDATION TESTS PASSED ===\n');
}

runTests();
