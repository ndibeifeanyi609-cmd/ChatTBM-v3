'use strict';

const { isValidProfileType } = require('./ProfileTypes');
const { createProfileObject } = require('./ProfileObject');
const {
    saveProfile,
    updateProfile: persistUpdatedProfile,
} = require('./ProfilePersistence');
const {
    registerProfile,
    getRegisteredProfile,
    getRegisteredProfilesByUser,
    deleteProfile: deleteRegisteredProfile
} = require('./ProfileRegistry');
const { transitionProfile, isValidLifecycleState } = require('./ProfileLifecycle');

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

    if (!profile.provenance || typeof profile.provenance !== 'object' || Array.isArray(profile.provenance)) {
        return { valid: false, error: 'Profile provenance is required.' };
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
function createProfile(data = {}) {
    try {
        const profile = createProfileObject(data);
        const validation = validateCandidate(profile);
        if (!validation.valid) return { success: false, profile: null, error: validation.error };

        const existing = getRegisteredProfilesByUser(profile.userId)
            .find(item => item.type === profile.type && item.subject === profile.subject);

        if (existing) {
            const resolution = resolveProfileCandidate(existing, profile);
            if (!resolution.success) {
                return {
                    success: false,
                    profile: resolution.profile || existing,
                    error: resolution.error || "Profile candidate conflict.",
                    conflict: true
                };
            }
            if (resolution.idempotent) {
                return {
                    success: true,
                    profile: resolution.profile,
                    idempotent: true,
                    conflict: false
                };
            }
        }

        const registration = registerProfile(profile);
        if (registration.conflict) return { success: false, profile: registration.profile || null, error: registration.error || "Profile registration conflict.", conflict: true };

        const persistence = saveProfile(profile);
        if (!persistence.success) {
            deleteRegisteredProfile(profile.id, profile.userId);
            return { success: false, profile: null, error: persistence.error || "Profile persistence failed.", persistenceFailure: true };
        }

        return {
            success: true,
            profile: persistence.profile,
            idempotent: Boolean(registration.idempotent) || Boolean(persistence.idempotent),
            conflict: false
        };
    } catch (error) {
        return { success: false, profile: null, error: error.message || "Profile creation failed." };
    }
}

function getProfile(profileId, userId) {
    if (!profileId) return { success: false, profile: null, error: "Profile ID is required." };
    const profile = getRegisteredProfile(profileId);
    if (!profile) return { success: false, profile: null, error: "Profile not found." };
    if (!userId || profile.userId !== userId) return { success: false, profile: null, error: "Profile ownership violation." };
    return { success: true, profile };
}

function getProfilesByUser(userId) {
    if (!userId) return { success: false, profiles: [], error: "User ID is required." };
    return { success: true, profiles: getRegisteredProfilesByUser(userId) };
}

function updateProfile(profile, userId) {
    if (!profile || !profile.id) return { success: false, profile: null, error: "Profile ID is required." };
    const existing = getRegisteredProfile(profile.id);
    if (!existing) return { success: false, profile: null, error: "Profile not found." };
    if (!userId || existing.userId !== userId) return { success: false, profile: null, error: "Profile ownership violation." };
    if (Object.prototype.hasOwnProperty.call(profile, "lifecycle") && profile.lifecycle !== existing.lifecycle) return { success: false, profile: existing, error: "Lifecycle changes must use the Profile lifecycle boundary." };
    const updated = { ...existing, ...profile, id: existing.id, userId: existing.userId };
    const validation = validateCandidate(updated);
    if (!validation.valid) return { success: false, profile: existing, error: validation.error };
    const registration = registerProfile(updated);
    if (registration.conflict) return { success: false, profile: registration.profile || existing, error: registration.error || "Profile registration conflict.", conflict: true };
    const persistence = persistUpdatedProfile(updated);
    if (!persistence.success) { registerProfile(existing); return { success: false, profile: null, error: persistence.error || "Profile persistence failed.", persistenceFailure: true }; }
    return { success: true, profile: persistence.profile, idempotent: Boolean(persistence.idempotent) };
}

function transitionProfileLifecycle(profileId, nextState, userId) {
    if (!profileId) return { success: false, profile: null, error: "Profile ID is required." };
    if (!isValidLifecycleState(nextState)) return { success: false, profile: null, error: "Invalid lifecycle state." };
    const existing = getRegisteredProfile(profileId);
    if (!existing) return { success: false, profile: null, error: "Profile not found." };
    if (!userId || existing.userId !== userId) return { success: false, profile: null, error: "Profile ownership violation." };
    const result = transitionProfile(existing, nextState);
    if (!result.success) return { success: false, profile: existing, error: result.error };
    if (result.idempotent) return { success: true, profile: existing, idempotent: true };
    const registration = registerProfile(result.profile);
    if (registration.conflict) return { success: false, profile: existing, error: registration.error || "Profile registration conflict.", conflict: true };
    const persistence = persistUpdatedProfile(result.profile);
    if (!persistence.success) { registerProfile(existing); return { success: false, profile: null, error: persistence.error || "Profile persistence failed.", persistenceFailure: true }; }
    return { success: true, profile: persistence.profile, idempotent: false };
}

module.exports = {
    createProfile,
    getProfile,
    getProfilesByUser,
    updateProfile,
    transitionProfileLifecycle,
    validateCandidate,
    profilesAreEquivalent,
    resolveProfileCandidate
};
