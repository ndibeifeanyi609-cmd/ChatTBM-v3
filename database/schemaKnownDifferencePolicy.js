'use strict';

// Classification-only policy layered over the raw schema comparator.
// Never writes to PostgreSQL and never changes the raw comparison result.

const { canonicalJson, canonicalizeManifest } = require('./schemaDryRunComparator');

const ALLOWED_DIFFERENCE = Object.freeze({
    id: 'schema.chat_history.updated_at_index.missing',
    path: '$.indexes.public.chattbm_chat_history.chattbm_chat_history_updated_at_idx',
    category: 'missing_index',
    status: 'separately_planned'
});

function objectKey(collection, item) {
    if (collection === 'tables') return [item.schema || '', item.name || ''].join('.');
    return [item.schema || '', item.table || '', item.name || ''].join('.');
}

function validateRegistry(registry) {
    if (!Array.isArray(registry) || registry.length !== 1) {
        throw new Error('Known-difference policy refuses: exactly one registered difference is required.');
    }
    const entry = registry[0];
    const allowedKeys = ['id', 'path', 'category', 'status', 'rationale', 'reviewRef'];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        throw new Error('Known-difference policy refuses: invalid registry entry.');
    }
    const actualKeys = Object.keys(entry);
    if (actualKeys.length !== allowedKeys.length || actualKeys.some(key => !allowedKeys.includes(key))) {
        throw new Error('Known-difference policy refuses: unknown or missing registry fields.');
    }
    for (const field of Object.keys(ALLOWED_DIFFERENCE)) {
        if (entry[field] !== ALLOWED_DIFFERENCE[field]) {
            throw new Error('Known-difference policy refuses: registered difference metadata does not match the approved identity.');
        }
    }
    if (typeof entry.rationale !== 'string' || !entry.rationale.trim() ||
        typeof entry.reviewRef !== 'string' || !entry.reviewRef.trim()) {
        throw new Error('Known-difference policy refuses: rationale and review reference are required.');
    }
}

function classifyKnownDifferences(rawResult, expectedManifest, actualManifest) {
    if (!rawResult || rawResult.matches !== false ||
        typeof rawResult.expectedFingerprint !== 'string' ||
        typeof rawResult.actualFingerprint !== 'string') {
        throw new Error('Known-difference policy refuses: a raw mismatch with fingerprints is required.');
    }
    const expected = canonicalizeManifest(expectedManifest);
    const actual = canonicalizeManifest(actualManifest);
    if (!expected || !actual || expected.manifestVersion !== 1 ||
        actual.manifestVersion !== 1 ||
        expected.postgresMajorVersion !== 18 || actual.postgresMajorVersion !== 18 ||
        expected.schema !== 'public' || actual.schema !== 'public') {
        throw new Error('Known-difference policy refuses: unsupported manifest/schema version.');
    }
    validateRegistry(expected.knownDifferences);

    const expectedCollections = {};
    const actualCollections = {};
    for (const collection of ['tables', 'constraints', 'indexes']) {
        expectedCollections[collection] = Array.isArray(expected[collection]) ? expected[collection].slice() : [];
        actualCollections[collection] = Array.isArray(actual[collection]) ? actual[collection].slice() : [];
    }

    const target = expectedCollections.indexes.filter(item =>
        item.schema === 'public' &&
        item.table === 'chattbm_chat_history' &&
        item.name === 'chattbm_chat_history_updated_at_idx'
    );
    if (target.length !== 1) {
        throw new Error('Known-difference policy refuses: expected index record must exist exactly once.');
    }
    const reviewedIndex = {
        definition: 'CREATE INDEX chattbm_chat_history_updated_at_idx ON public.chattbm_chat_history USING btree (user_id, updated_at DESC)',
        unique: false,
        primary: false,
        valid: true,
        ready: true,
        live: true
    };
    for (const [field, value] of Object.entries(reviewedIndex)) {
        if (target[0][field] !== value) {
            throw new Error('Known-difference policy refuses: expected index definition or health metadata changed.');
        }
    }
    const actualTarget = actualCollections.indexes.filter(item =>
        item.schema === 'public' &&
        item.table === 'chattbm_chat_history' &&
        item.name === 'chattbm_chat_history_updated_at_idx'
    );
    if (actualTarget.length !== 0) {
        throw new Error('Known-difference policy refuses: registered difference is not an absent index.');
    }

    expectedCollections.indexes = expectedCollections.indexes.filter(item =>
        !(item.schema === 'public' &&
          item.table === 'chattbm_chat_history' &&
          item.name === 'chattbm_chat_history_updated_at_idx')
    );

    for (const collection of ['tables', 'constraints', 'indexes']) {
        const sortByKey = items => items.sort((a, b) => objectKey(collection, a).localeCompare(objectKey(collection, b)));
        sortByKey(expectedCollections[collection]);
        sortByKey(actualCollections[collection]);
    }
    if (canonicalJson(expectedCollections) !== canonicalJson(actualCollections)) {
        throw new Error('Known-difference policy refuses: additional or changed schema drift exists.');
    }

    // The raw result is returned untouched; this result is only a classification.
    return {
        classification: 'known_differences_only',
        knownDifferences: [{
            id: ALLOWED_DIFFERENCE.id,
            path: ALLOWED_DIFFERENCE.path,
            category: ALLOWED_DIFFERENCE.category,
            status: ALLOWED_DIFFERENCE.status
        }],
        rawComparison: rawResult
    };
}

module.exports = { classifyKnownDifferences, validateRegistry, ALLOWED_DIFFERENCE };
