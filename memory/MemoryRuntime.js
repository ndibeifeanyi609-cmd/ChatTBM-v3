'use strict';

// =====================================
// ChatTBM REG-092
// Memory Runtime
//
// Responsibility
// - Initialize durable Memory persistence
// - Hydrate the canonical Memory Registry
// - Fail startup when persisted Memory is invalid
//
// Does NOT
// - Own Memory state
// - Replace MemoryBoundary
// - Implement Memory lifecycle
// - Implement Memory ranking/retrieval
// - Connect legacy Memory systems
// =====================================

const MemoryPersistence =
  require('./MemoryPersistence');

const MemoryRegistry =
  require('./MemoryRegistry');

let initialized = false;

function initializeMemoryRuntime() {
  if (initialized) {
    return {
      success: true,
      initialized: true,
      count:
        MemoryPersistence
          .getAllPersistedMemories()
          .length
    };
  }

  const loaded =
    MemoryPersistence
      .loadMemoryPersistence();

  const memories =
    MemoryPersistence
      .getAllPersistedMemories();

  MemoryRegistry.clearRegistry();

  let registeredCount = 0;

  try {
    for (const memory of memories) {
      const result =
        MemoryRegistry.registerMemory(
          memory
        );

      if (
        !result ||
        result.conflict ||
        (
          !result.registered &&
          !result.updated &&
          !result.idempotent
        )
      ) {
        throw new Error(
          result?.error ||
          `Memory Registry hydration failed for ${memory.id}.`
        );
      }

      registeredCount += 1;
    }
  } catch (error) {
    MemoryRegistry.clearRegistry();

    throw new Error(
      `Memory runtime initialization failed: ${error.message}`
    );
  }

  initialized = true;

  return {
    success: true,
    initialized: true,
    loaded: loaded.loaded,
    empty: memories.length === 0,
    count: registeredCount
  };
}

function resetMemoryRuntime() {
  MemoryRegistry.clearRegistry();
  initialized = false;
}

module.exports = {
  initializeMemoryRuntime,
  resetMemoryRuntime
};
