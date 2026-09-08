'use strict';

const assert = require('assert');

const {
  createContext,
  getContext,
  updateContext,
} = require('./ContextBoundary');

const created = createContext({ userId: 'test-user' });

assert.strictEqual(created.success, true);
assert.ok(created.context);
assert.ok(created.context.id);
assert.strictEqual(created.context.userId, 'test-user');
assert.strictEqual(created.context.version, 1);

const ownership = getContext(
  created.context.id,
  'different-user'
);

assert.strictEqual(ownership.success, false);
assert.strictEqual(
  ownership.error,
  'Context ownership violation.'
);

const missingVersion = updateContext(
  created.context.id,
  'test-user',
  {
    expectedVersion: undefined,
    changes: {}
  }
);

assert.strictEqual(missingVersion.success, false);

const updated = updateContext(
  created.context.id,
  'test-user',
  {
    expectedVersion: 1,
    changes: {}
  }
);

assert.strictEqual(updated.success, true);
assert.strictEqual(updated.context.version, 2);

const stale = updateContext(
  created.context.id,
  'test-user',
  {
    expectedVersion: 1,
    changes: {}
  }
);

assert.strictEqual(stale.success, false);
assert.strictEqual(stale.code, 'CONTEXT_CONFLICT');

const afterStale = getContext(
  created.context.id,
  'test-user'
);

assert.deepStrictEqual(
  afterStale.context,
  updated.context
);


const failureCreated = createContext({
  userId: 'failure-test-user',
  value: { state: 'original' }
});

const failureUpdated = updateContext(
  failureCreated.context.id,
  'failure-test-user',
  {
    expectedVersion: 1,
    changes: {
      value: { state: 'updated' }
    }
  }
);

assert.strictEqual(failureUpdated.success, true);
assert.strictEqual(failureUpdated.context.version, 2);

const failureStale = updateContext(
  failureCreated.context.id,
  'failure-test-user',
  {
    expectedVersion: 1,
    changes: {
      value: { state: 'MUST-NOT-APPLY' }
    }
  }
);

assert.strictEqual(failureStale.success, false);
assert.strictEqual(failureStale.code, 'CONTEXT_CONFLICT');

const failureCurrent = getContext(
  failureCreated.context.id,
  'failure-test-user'
);

assert.strictEqual(failureCurrent.context.version, 2);
assert.deepStrictEqual(
  failureCurrent.context.value,
  { state: 'updated' }
);
