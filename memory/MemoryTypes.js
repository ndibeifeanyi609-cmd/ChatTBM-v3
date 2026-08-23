'use strict';

// =====================================
// ChatTBM
// REG-088 Memory
//
// Canonical Memory Types
// =====================================

const MEMORY_TYPES = Object.freeze([
    'preference',
    'fact',
    'goal',
    'identity',
    'context'
]);

function isValidMemoryType(type) {
    return MEMORY_TYPES.includes(type);
}

module.exports = {
    MEMORY_TYPES,
    isValidMemoryType
};
