'use strict';

// =====================================
// ChatTBM
// REG-089 Profile/Identity
//
// Canonical Profile Object
// =====================================

const {
    isValidProfileType
} = require('./ProfileTypes');

const {
    isValidLifecycleState
} = require('./ProfileLifecycle');

const PROFILE_OBJECT_VERSION = '1.0';

function createProfileObject(data = {}) {

    const type = data.type;

    if (!isValidProfileType(type)) {
        throw new Error(
            `Invalid profile type: ${type}`
        );
    }

    const userId =
        data.userId || 'guest';

    if (!userId) {
        throw new Error(
            'Profile userId is required'
        );
    }

    if (
        data.subject === undefined ||
        data.subject === null ||
        data.subject === ''
    ) {
        throw new Error(
            'Profile subject is required'
        );
    }

    if (
        data.value === undefined ||
        data.value === null
    ) {
        throw new Error(
            'Profile value is required'
        );
    }

    const lifecycle =
        data.lifecycle || 'proposed';

    if (!isValidLifecycleState(lifecycle)) {
        throw new Error(
            `Invalid profile lifecycle state: ${lifecycle}`
        );
    }

    const now =
        new Date().toISOString();

    return {

        id:
            data.id ||
            createProfileId(),

        version:
            PROFILE_OBJECT_VERSION,

        userId,

        type,

        subject:
            data.subject ?? null,

        value:
            data.value ?? null,

        provenance: {

            sourceType:
                data.provenance?.sourceType ||
                'ChatTBM',

            sourceId:
                data.provenance?.sourceId ||
                null,

            sourceVersion:
                data.provenance?.sourceVersion ||
                null

        },

        lifecycle,

        createdAt:
            data.createdAt ||
            now,

        updatedAt:
            data.updatedAt ||
            now

    };
}

function createProfileId() {

    return (
        'profile_' +
        Date.now() +
        '_' +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}

module.exports = {
    PROFILE_OBJECT_VERSION,
    createProfileObject,
    createProfileId
};
