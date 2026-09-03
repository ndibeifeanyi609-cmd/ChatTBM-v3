'use strict';

const { isValidProfileType } = require('./ProfileTypes');
const { isValidLifecycleState } = require('./ProfileLifecycle');

function validateCandidate(profile) {
    if (!profile || typeof profile !== 'object') {
        return { valid: false, error: 'Profile object is required.' };
    }

    if (!isValidProfileType(profile.type)) {
        return { valid: false, error: 'Invalid profile type.' };
    }

    if (!profile.userId) {
        return { valid: false, error: 'Profile userId is required.' };
    }

    if (profile.subject === undefined || profile.subject === null || profile.subject === '') {
        return { valid: false, error: 'Profile subject is required.' };
    }

    if (profile.value === undefined || profile.value === null) {
        return { valid: false, error: 'Profile value is required.' };
    }

    if (!isValidLifecycleState(profile.lifecycle)) {
        return { valid: false, error: 'Invalid profile lifecycle state.' };
    }

    return { valid: true, error: null };
}

function profilesAreEquivalent(a, b) {
    return !!a &&
        !!b &&
        a.userId === b.userId &&
        a.type === b.type &&
        a.subject === b.subject &&
        JSON.stringify(a.value) === JSON.stringify(b.value);
}

function resolveProfileCandidate(currentProfile, candidateProfile) {
    const validation = validateCandidate(candidateProfile);

    if (!validation.valid) {
        return {
            success: false,
            decision: 'invalid',
            profile: null,
            error: validation.error
        };
    }

    if (currentProfile && currentProfile.userId !== candidateProfile.userId) {
        return {
            success: false,
            decision: 'ownership-conflict',
            profile: currentProfile,
            error: 'Profile ownership conflict.'
        };
    }

    if (!currentProfile) {
        return {
            success: true,
            decision: 'admit',
            profile: candidateProfile,
            idempotent: false
        };
    }

    if (profilesAreEquivalent(currentProfile, candidateProfile)) {
        return {
            success: true,
            decision: 'idempotent',
            profile: currentProfile,
            idempotent: true
        };
    }

    if (
        currentProfile.userId === candidateProfile.userId &&
        currentProfile.type === candidateProfile.type &&
        currentProfile.subject === candidateProfile.subject
    ) {
        return {
            success: false,
            decision: 'conflict',
            profile: currentProfile,
            error: 'Conflicting canonical Profile value.'
        };
    }

    return {
        success: true,
        decision: 'admit',
        profile: candidateProfile,
        idempotent: false
    };
}

module.exports = {
    validateCandidate,
    profilesAreEquivalent,
    resolveProfileCandidate
};
