'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STORAGE_VERSION = '1.0';

const DEFAULT_STORAGE_FILE =
  path.join(__dirname, '..', 'storage', 'memory.json');

let storageFilePath =
  process.env.CHAT_TBM_MEMORY_STORAGE_PATH ||
  DEFAULT_STORAGE_FILE;

const memoriesById = new Map();
const memoryIdsByKey = new Map();

let persistenceLoaded = false;

function cloneMemory(memory) {
  return JSON.parse(JSON.stringify(memory));
}

function createMemoryKey(memory) {
  const identity = [
    memory.userId,
    memory.type,
    memory.subject
  ];

  return crypto
    .createHash('sha256')
    .update(JSON.stringify(identity))
    .digest('hex');
}

function getMemoryStoragePath() {
  return storageFilePath;
}

function configureMemoryPersistence(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error(
      'Memory persistence file path must be a non-empty string.'
    );
  }

  storageFilePath = path.resolve(filePath);

  memoriesById.clear();
  memoryIdsByKey.clear();
  persistenceLoaded = false;

  return storageFilePath;
}

function createStorageEnvelope(memories) {
  return {
    version: STORAGE_VERSION,
    memories: memories.map(cloneMemory)
  };
}

function validateStorageEnvelope(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(
      'Memory storage must contain a JSON object.'
    );
  }

  if (data.version !== STORAGE_VERSION) {
    throw new Error(
      `Unsupported memory storage version: ${data.version}`
    );
  }

  if (!Array.isArray(data.memories)) {
    throw new Error(
      'Memory storage field "memories" must be an array.'
    );
  }

  return data;
}

function writeStorage() {
  const directory = path.dirname(storageFilePath);
  const tempFilePath = `${storageFilePath}.tmp`;

  try {
    fs.mkdirSync(directory, { recursive: true });

    const memories = Array.from(
      memoriesById.values()
    );

    const envelope = createStorageEnvelope(memories);

    fs.writeFileSync(
      tempFilePath,
      JSON.stringify(envelope, null, 2),
      'utf8'
    );

    fs.renameSync(
      tempFilePath,
      storageFilePath
    );
  } catch (error) {
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (_) {
      // Preserve the original write failure.
    }

    throw new Error(
      `Memory persistence write failed: ${error.message}`
    );
  }
}

function loadMemoryPersistence() {
  if (persistenceLoaded) {
    return {
      loaded: true,
      empty: memoriesById.size === 0,
      count: memoriesById.size,
      path: storageFilePath
    };
  }

  const nextMemoriesById = new Map();
  const nextMemoryIdsByKey = new Map();

  if (!fs.existsSync(storageFilePath)) {
    memoriesById.clear();
    memoryIdsByKey.clear();
    persistenceLoaded = true;

    return {
      loaded: true,
      empty: true,
      count: 0,
      path: storageFilePath
    };
  }

  let parsed;

  try {
    const raw = fs.readFileSync(
      storageFilePath,
      'utf8'
    );

    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Memory persistence load failed: ${error.message}`
    );
  }

  validateStorageEnvelope(parsed);

  const MemoryRegistry =
    require('./MemoryRegistry');

  for (const memory of parsed.memories) {
    MemoryRegistry.validateMemory(memory);

    const id = memory.id;
    const key = createMemoryKey(memory);

    if (nextMemoriesById.has(id)) {
      throw new Error(
        `Duplicate persisted Memory id: ${id}`
      );
    }

    if (nextMemoryIdsByKey.has(key)) {
      throw new Error(
        `Duplicate persisted Memory identity: ${key}`
      );
    }

    nextMemoriesById.set(
      id,
      cloneMemory(memory)
    );

    nextMemoryIdsByKey.set(
      key,
      id
    );
  }

  memoriesById.clear();
  memoryIdsByKey.clear();

  for (const [id, memory] of nextMemoriesById) {
    memoriesById.set(id, memory);
  }

  for (const [key, id] of nextMemoryIdsByKey) {
    memoryIdsByKey.set(key, id);
  }

  persistenceLoaded = true;

  return {
    loaded: true,
    empty: memoriesById.size === 0,
    count: memoriesById.size,
    path: storageFilePath
  };
}

function ensureLoaded() {
  if (!persistenceLoaded) {
    loadMemoryPersistence();
  }
}

function saveMemory(memory) {
  ensureLoaded();

  if (!memory || typeof memory !== 'object') {
    throw new Error('Memory record is required.');
  }

  if (!memory.id) {
    throw new Error('Memory id is required.');
  }

  if (!memory.userId) {
    throw new Error('Memory userId is required.');
  }

  if (!memory.version) {
    throw new Error('Memory version is required.');
  }

  if (!memory.type) {
    throw new Error('Memory type is required.');
  }

  const id = memory.id;
  const key = createMemoryKey(memory);

  const existingById =
    memoriesById.get(id);

  if (existingById) {
    if (
      JSON.stringify(existingById) ===
      JSON.stringify(memory)
    ) {
      return {
        success: true,
        saved: false,
        idempotent: true,
        memory: cloneMemory(existingById)
      };
    }

    return {
      success: false,
      conflict: true,
      error:
        `Memory id already exists: ${id}`
    };
  }

  const existingId =
    memoryIdsByKey.get(key);

  if (existingId) {
    return {
      success: false,
      conflict: true,
      error:
        `Memory identity already exists: ${key}`
    };
  }

  memoriesById.set(
    id,
    cloneMemory(memory)
  );

  memoryIdsByKey.set(
    key,
    id
  );

  try {
    writeStorage();
  } catch (error) {
    memoriesById.delete(id);
    memoryIdsByKey.delete(key);
    throw error;
  }

  return {
    success: true,
    saved: true,
    memory: cloneMemory(memory)
  };
}

function updateMemory(memory) {
  ensureLoaded();

  if (!memory || typeof memory !== 'object') {
    throw new Error('Memory record is required.');
  }

  if (!memory.id) {
    throw new Error('Memory id is required.');
  }

  if (!memory.userId) {
    throw new Error('Memory userId is required.');
  }

  const id = memory.id;
  const existing =
    memoriesById.get(id);

  if (!existing) {
    return {
      success: false,
      notFound: true,
      error:
        `Memory not found: ${id}`
    };
  }

  if (existing.userId !== memory.userId) {
    return {
      success: false,
      ownershipFailure: true,
      error:
        `Memory ownership mismatch: ${id}`
    };
  }

  const oldKey =
    createMemoryKey(existing);

  const newKey =
    createMemoryKey(memory);

  if (oldKey !== newKey) {
    return {
      success: false,
      conflict: true,
      error:
        'Memory identity cannot change during update.'
    };
  }

  const existingId =
    memoryIdsByKey.get(newKey);

  if (
    existingId &&
    existingId !== id
  ) {
    return {
      success: false,
      conflict: true,
      error:
        `Memory identity already belongs to: ${existingId}`
    };
  }

  const previousMemory =
    cloneMemory(existing);

  memoriesById.set(
    id,
    cloneMemory(memory)
  );

  try {
    writeStorage();
  } catch (error) {
    memoriesById.set(
      id,
      previousMemory
    );
    throw error;
  }

  return {
    success: true,
    updated: true,
    memory: cloneMemory(memory)
  };
}

function getMemory(id) {
  ensureLoaded();

  const memory =
    memoriesById.get(id);

  return memory
    ? cloneMemory(memory)
    : null;
}

function getMemoriesByUser(userId) {
  ensureLoaded();

  if (!userId) {
    return [];
  }

  return Array.from(
    memoriesById.values()
  )
    .filter(
      memory =>
        memory.userId === userId
    )
    .map(cloneMemory);
}

function getAllPersistedMemories() {
  ensureLoaded();

  return Array.from(
    memoriesById.values()
  ).map(cloneMemory);
}

function deleteMemory(id, userId) {
  ensureLoaded();

  if (!id) {
    throw new Error('Memory id is required.');
  }

  const existing =
    memoriesById.get(id);

  if (!existing) {
    return {
      success: false,
      notFound: true,
      error:
        `Memory not found: ${id}`
    };
  }

  if (
    userId &&
    existing.userId !== userId
  ) {
    return {
      success: false,
      ownershipFailure: true,
      error:
        `Memory ownership mismatch: ${id}`
    };
  }

  const key =
    createMemoryKey(existing);

  const previousMemory =
    cloneMemory(existing);

  memoriesById.delete(id);
  memoryIdsByKey.delete(key);

  try {
    writeStorage();
  } catch (error) {
    memoriesById.set(
      id,
      previousMemory
    );

    memoryIdsByKey.set(
      key,
      id
    );

    throw error;
  }

  return {
    success: true,
    deleted: true,
    id
  };
}

function clearMemoriesByUser(userId) {
  ensureLoaded();

  if (!userId) {
    return {
      success: false,
      error: 'Memory userId is required.'
    };
  }

  const removed = [];

  for (const [id, memory] of memoriesById) {
    if (memory.userId === userId) {
      removed.push({
        id,
        key: createMemoryKey(memory),
        memory: cloneMemory(memory)
      });
    }
  }

  if (removed.length === 0) {
    return {
      success: true,
      cleared: 0
    };
  }

  for (const item of removed) {
    memoriesById.delete(item.id);
    memoryIdsByKey.delete(item.key);
  }

  try {
    writeStorage();
  } catch (error) {
    for (const item of removed) {
      memoriesById.set(
        item.id,
        item.memory
      );

      memoryIdsByKey.set(
        item.key,
        item.id
      );
    }

    throw error;
  }

  return {
    success: true,
    cleared: removed.length
  };
}

function clearMemoryPersistence() {
  memoriesById.clear();
  memoryIdsByKey.clear();

  const tempFilePath =
    `${storageFilePath}.tmp`;

  try {
    if (fs.existsSync(storageFilePath)) {
      fs.unlinkSync(storageFilePath);
    }

    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  } catch (error) {
    throw new Error(
      `Memory persistence clear failed: ${error.message}`
    );
  }

  persistenceLoaded = true;

  return {
    success: true,
    cleared: true,
    path: storageFilePath
  };
}

module.exports = {
  STORAGE_VERSION,
  createMemoryKey,
  getMemoryStoragePath,
  configureMemoryPersistence,
  loadMemoryPersistence,
  getAllPersistedMemories,
  saveMemory,
  updateMemory,
  getMemory,
  getMemoriesByUser,
  deleteMemory,
  clearMemoriesByUser,
  clearMemoryPersistence
};
