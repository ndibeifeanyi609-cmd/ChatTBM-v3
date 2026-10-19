'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Persistence = require('../memory/MemoryPersistence');
const Registry = require('../memory/MemoryRegistry');
const Runtime = require('../memory/MemoryRuntime');
const Boundary = require('../memory/MemoryBoundary');

const file = path.join(__dirname, 'memoryBoundary.integration.tmp.json');
Persistence.configureMemoryPersistence(file);
Persistence.clearMemoryPersistence();
Runtime.resetMemoryRuntime();

const saved = Boundary.createMemory({
    userId: 'memory-test-user',
    type: 'fact',
    subject: 'project nickname',
    value: 'Blue Falcon',
    lifecycle: 'active'
});
assert.strictEqual(saved.success, true);
assert.strictEqual(saved.memory.value, 'Blue Falcon');

// Simulate a fresh process by clearing the in-memory registry and
// rehydrating it from the persisted JSON file.
Registry.clearRegistry();
Runtime.resetMemoryRuntime();
const initialized = Runtime.initializeMemoryRuntime();
assert.strictEqual(initialized.success, true);
assert.strictEqual(initialized.count, 1);

const retrieved = Boundary.getMemoriesByUser('memory-test-user');
assert.strictEqual(retrieved.success, true);
assert.strictEqual(retrieved.memories.length, 1);
assert.strictEqual(retrieved.memories[0].value, 'Blue Falcon');
assert.strictEqual(Boundary.getMemoriesByUser('another-user').memories.length, 0);

Persistence.clearMemoryPersistence();
Registry.clearRegistry();
Runtime.resetMemoryRuntime();
try { fs.unlinkSync(file); } catch (_) {}
console.log('Memory boundary reload and ownership tests passed.');
