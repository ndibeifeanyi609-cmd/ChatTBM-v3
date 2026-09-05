'use strict';

const {
    isValidProfileType
} = require('./ProfileTypes');

const {
    isValidLifecycleState
} = require('./ProfileLifecycle');

const registry = new Map();

const REQUIRED_FIELDS = [
    'id',
    'version',
    'userId',
    'type',
    'subject',
    'value',
    'lifecycle',
    'createdAt',
    'updatedAt'
];

function validateProfile(profile) {

    if (
        !profile ||
        typeof profile !== 'object' ||
        Array.isArray(profile)
    ) {
        throw new Error(
            'Profile must be an object'
        );
    }

    for (const field of REQUIRED_FIELDS) {

        if (
            profile[field] === undefined ||
            profile[field] === null ||
            profile[field] === ''
        ) {
            throw new Error(
                `Missing required profile field: ${field}`
            );
        }
    }

    if (profile.version !== '1.0') {
        throw new Error(
            `Unsupported profile version: ${profile.version}`
        );
    }

    if (!isValidProfileType(profile.type)) {
        throw new Error(
            `Invalid profile type: ${profile.type}`
        );
    }

    if (!isValidLifecycleState(profile.lifecycle)) {
        throw new Error(
            `Invalid profile lifecycle state: ${profile.lifecycle}`
        );
    }

    return true;
}

function getProfileIdentity(profile) {

    return [
        profile.userId ?? null,
        profile.type ?? null,
        profile.subject ?? null
    ];
}

function identitiesAreEquivalent(
    existing,
    incoming
) {

    return JSON.stringify(
        getProfileIdentity(existing)
    ) === JSON.stringify(
        getProfileIdentity(incoming)
    );
}

function recordsAreEquivalent(
    existing,
    incoming
) {

    return (
        JSON.stringify(existing) ===
        JSON.stringify(incoming)
    );
}

function registerProfile(profile) {

    validateProfile(profile);

    const existing =
        registry.get(profile.id);

    if (!existing) {

        for (const registered of registry.values()) {

            if (
                identitiesAreEquivalent(
                    registered,
                    profile
                )
            ) {
                return {
                    profile: { ...registered },
                    registered: false,
                    updated: false,
                    idempotent: false,
                    conflict: true,
                    error:
                        'Profile semantic identity already exists.'
                };
            }
        }

        const stored = {
            ...profile
        };

        registry.set(
            profile.id,
            stored
        );

        return {
            profile: { ...stored },
            registered: true,
            updated: false,
            idempotent: false,
            conflict: false
        };
    }

    if (
        !identitiesAreEquivalent(
            existing,
            profile
        )
    ) {
        return {
            profile: { ...existing },
            registered: false,
            updated: false,
            idempotent: false,
            conflict: true,
            error:
                'Profile identity conflict.'
        };
    }

    if (
        recordsAreEquivalent(
            existing,
            profile
        )
    ) {
        return {
            profile: { ...existing },
            registered: false,
            updated: false,
            idempotent: true,
            conflict: false
        };
    }

    const updated = {
        ...profile
    };

    registry.set(
        profile.id,
        updated
    );

    return {
        profile: { ...updated },
        registered: false,
        updated: true,
        idempotent: false,
        conflict: false
    };
}

function getRegisteredProfile(id) {

    if (!id) {
        return null;
    }

    const profile =
        registry.get(id);

    return profile
        ? { ...profile }
        : null;
}

function getRegisteredProfilesByUser(userId) {

    if (!userId) {
        return [];
    }

    return [
        ...registry.values()
    ]
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
    validateProfile,
    getProfileIdentity,
    identitiesAreEquivalent,
    recordsAreEquivalent,
    registerProfile,
    getRegisteredProfile,
    getRegisteredProfilesByUser,
    deleteProfile
};

function deleteProfile(
    profileId,
    userId
) {

    if (!profileId) {
        return {
            success: false,
            error: 'Profile ID is required.'
        };
    }

    if (!userId) {
        return {
            success: false,
            error: 'User ID is required.'
        };
    }

    const existing =
        registry.get(profileId);

    if (!existing) {
        return {
            success: false,
            profile: null,
            error: 'Profile not found.'
        };
    }

    if (existing.userId !== userId) {
        return {
            success: false,
            profile: { ...existing },
            error:
                'Profile ownership violation.'
        };
    }

    registry.delete(profileId);

    return {
        success: true,
        profile: { ...existing }
    };

}
