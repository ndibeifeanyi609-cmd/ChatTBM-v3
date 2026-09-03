'use strict';

const crypto = require('crypto');

const profilesById = new Map();
const profileIdsByKey = new Map();

function createProfileKey(profile) {
    if (!profile || typeof profile !== 'object') {
        return null;
    }

    const identity = JSON.stringify([
        profile.userId ?? null,
        profile.type ?? null,
        profile.subject ?? null
    ]);

    return crypto
        .createHash('sha256')
        .update(identity)
        .digest('hex');
}

function saveProfile(profile) {
    if (
        !profile ||
        !profile.id ||
        !profile.userId ||
        !profile.version ||
        !profile.type
    ) {
        return {
            success: false,
            profile: null,
            error: 'Invalid profile.'
        };
    }

    const profileKey = createProfileKey(profile);

    if (!profileKey) {
        return {
            success: false,
            profile: null,
            error: 'Unable to create profile identity.'
        };
    }

    const existingById = profilesById.get(profile.id);

    if (existingById) {
        if (
            JSON.stringify(existingById) ===
            JSON.stringify(profile)
        ) {
            return {
                success: true,
                profile: { ...existingById },
                profileKey,
                idempotent: true,
                conflict: false
            };
        }

        return {
            success: false,
            profile: { ...existingById },
            profileKey,
            idempotent: false,
            conflict: true,
            error: 'Profile ID already exists.'
        };
    }

    const existingId = profileIdsByKey.get(profileKey);

    if (
        existingId &&
        existingId !== profile.id
    ) {
        const existing = profilesById.get(existingId);

        return {
            success: false,
            profile: existing ? { ...existing } : null,
            profileKey,
            idempotent: false,
            conflict: true,
            error: 'Profile identity already exists.'
        };
    }

    profilesById.set(profile.id, { ...profile });
    profileIdsByKey.set(profileKey, profile.id);

    return {
        success: true,
        profile: { ...profile },
        profileKey,
        idempotent: false,
        conflict: false
    };
}

function updateProfile(profile) {
    if (
        !profile ||
        !profile.id ||
        !profile.userId
    ) {
        return {
            success: false,
            profile: null,
            error: 'Invalid profile.'
        };
    }

    const existing = profilesById.get(profile.id);

    if (!existing) {
        return {
            success: false,
            profile: null,
            error: 'Profile not found.'
        };
    }

    if (existing.userId !== profile.userId) {
        return {
            success: false,
            profile: { ...existing },
            error: 'Profile ownership cannot be changed.'
        };
    }

    const oldKey = createProfileKey(existing);
    const newKey = createProfileKey(profile);

    if (!newKey) {
        return {
            success: false,
            profile: { ...existing },
            error: 'Unable to create profile identity.'
        };
    }

    const existingId = profileIdsByKey.get(newKey);

    if (
        existingId &&
        existingId !== profile.id
    ) {
        const conflictingProfile =
            profilesById.get(existingId);

        return {
            success: false,
            profile:
                conflictingProfile
                    ? { ...conflictingProfile }
                    : { ...existing },
            profileKey: newKey,
            conflict: true,
            error: 'Profile identity already exists.'
        };
    }

    profilesById.set(profile.id, { ...profile });

    if (
        oldKey &&
        oldKey !== newKey &&
        profileIdsByKey.get(oldKey) === profile.id
    ) {
        profileIdsByKey.delete(oldKey);
    }

    profileIdsByKey.set(newKey, profile.id);

    return {

         success: true,
        profile: { ...profile },
        profileKey: newKey,
        conflict: false
    };
}

function getProfile(id) {
    if (!id) {
        return null;
    }

    const profile = profilesById.get(id);

    return profile ? { ...profile } : null;
}

function getProfilesByUser(userId) {
    if (!userId) {
        return [];
    }

    return [...profilesById.values()]
        .filter(
            profile =>
                profile.userId === userId
        )
        .map(
            profile =>
                ({ ...profile })
        );
}

module.exports = {
    createProfileKey,
    saveProfile,
    updateProfile,
    getProfile,
    getProfilesByUser
};
