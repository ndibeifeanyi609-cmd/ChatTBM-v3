'use strict';

// =====================================
// ChatTBM
// REG-089 Profile/Identity
//
// Canonical Profile Types
// =====================================

const PROFILE_TYPES = Object.freeze([
    'identity',
    'attribute'
]);

function isValidProfileType(type) {
    return PROFILE_TYPES.includes(type);
}

module.exports = {
    PROFILE_TYPES,
    isValidProfileType
};
