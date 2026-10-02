'use strict';

const fs = require('fs');
const path = require('path');

const STORAGE_VERSION = '1.0';

const DEFAULT_STORAGE_FILE =
    path.join(__dirname, '..', 'storage', 'payment.json');

let storageFilePath =
    process.env.CHAT_TBM_PAYMENT_STORAGE_PATH ||
    DEFAULT_STORAGE_FILE;

const paymentTransactionsById = new Map();
const subscriptionsById = new Map();
const entitlementsById = new Map();
const providerReferencesById = new Map();

const paymentIdsByIdempotencyKey = new Map();
const providerReferenceIdsByKey = new Map();

let persistenceLoaded = false;

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function providerReferenceKey(reference) {
    return [
        reference.provider,
        reference.providerObjectType,
        reference.providerObjectId
    ].join(':');
}

function configurePaymentPersistence(filePath) {
    if (!filePath || typeof filePath !== 'string') {
        throw new Error(
            'Payment persistence file path must be a non-empty string.'
        );
    }

    storageFilePath = path.resolve(filePath);

    paymentTransactionsById.clear();
    subscriptionsById.clear();
    entitlementsById.clear();
    providerReferencesById.clear();
    paymentIdsByIdempotencyKey.clear();
    providerReferenceIdsByKey.clear();

    persistenceLoaded = false;

    return storageFilePath;
}

function getPaymentStoragePath() {
    return storageFilePath;
}

function createStorageEnvelope() {
    return {
        version: STORAGE_VERSION,
        paymentTransactions:
            Array.from(paymentTransactionsById.values()).map(clone),
        subscriptions:
            Array.from(subscriptionsById.values()).map(clone),
        entitlements:
            Array.from(entitlementsById.values()).map(clone),
        providerReferences:
            Array.from(providerReferencesById.values()).map(clone)
    };
}

function validateStorageEnvelope(data) {
    if (
        !data ||
        typeof data !== 'object' ||
        Array.isArray(data)
    ) {
        throw new Error(
            'Payment storage must contain a JSON object.'
        );
    }

    if (data.version !== STORAGE_VERSION) {
        throw new Error(
            `Unsupported payment storage version: ${data.version}`
        );
    }

    const arrays = [
        'paymentTransactions',
        'subscriptions',
        'entitlements',
        'providerReferences'
    ];

    for (const field of arrays) {
        if (!Array.isArray(data[field])) {
            throw new Error(
                `Payment storage field "${field}" must be an array.`
            );
        }
    }

    return data;
}

function writeStorage() {
    const directory = path.dirname(storageFilePath);
    const tempFilePath = `${storageFilePath}.tmp`;

    try {
        fs.mkdirSync(directory, { recursive: true });

        const envelope = {
            version: STORAGE_VERSION,
            paymentTransactions:
                Array.from(
                    paymentTransactionsById.values()
                ),
            subscriptions:
                Array.from(
                    subscriptionsById.values()
                ),
            entitlements:
                Array.from(
                    entitlementsById.values()
                ),
            providerReferences:
                Array.from(
                    providerReferencesById.values()
                )
        };

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
        } catch (_) {}

        throw new Error(
            `Payment persistence write failed: ${error.message}`
        );
    }
}

function loadPaymentPersistence() {
    if (persistenceLoaded) {
        return {
            loaded: true,
            path: storageFilePath,
            counts: {
                paymentTransactions:
                    paymentTransactionsById.size,
                subscriptions:
                    subscriptionsById.size,
                entitlements:
                    entitlementsById.size,
                providerReferences:
                    providerReferencesById.size
            }
        };
    }

    paymentTransactionsById.clear();
    subscriptionsById.clear();
    entitlementsById.clear();
    providerReferencesById.clear();
    paymentIdsByIdempotencyKey.clear();
    providerReferenceIdsByKey.clear();

    if (!fs.existsSync(storageFilePath)) {
        persistenceLoaded = true;

        return {
            loaded: true,
            empty: true,
            path: storageFilePath
        };
    }

    let data;

    try {
        data = JSON.parse(
            fs.readFileSync(
                storageFilePath,
                'utf8'
            )
        );
    } catch (error) {
        throw new Error(
            `Payment persistence load failed: ${error.message}`
        );
    }

    validateStorageEnvelope(data);

    for (const item of data.paymentTransactions) {
        if (
            !item.id ||
            !item.userId ||
            !item.version
        ) {
            throw new Error(
                'Invalid persisted Payment Transaction.'
            );
        }

        if (paymentTransactionsById.has(item.id)) {
            throw new Error(
                `Duplicate persisted Payment Transaction id: ${item.id}`
            );
        }

        if (
            paymentIdsByIdempotencyKey.has(
                item.idempotencyKey
            )
        ) {
            throw new Error(
                `Duplicate persisted payment idempotency key: ${item.idempotencyKey}`
            );
        }

        paymentTransactionsById.set(
            item.id,
            clone(item)
        );

        paymentIdsByIdempotencyKey.set(
            item.idempotencyKey,
            item.id
        );
    }

    for (const item of data.subscriptions) {
        if (
            !item.id ||
            !item.userId ||
            !item.version
        ) {
            throw new Error(
                'Invalid persisted Subscription.'
            );
        }

        if (subscriptionsById.has(item.id)) {
            throw new Error(
                `Duplicate persisted Subscription id: ${item.id}`
            );
        }

        subscriptionsById.set(
            item.id,
            clone(item)
        );
    }

    for (const item of data.entitlements) {
        if (
            !item.id ||
            !item.userId ||
            !item.version
        ) {
            throw new Error(
                'Invalid persisted Entitlement.'
            );
        }

        if (entitlementsById.has(item.id)) {
            throw new Error(
                `Duplicate persisted Entitlement id: ${item.id}`
            );
        }

        entitlementsById.set(
            item.id,
            clone(item)
        );
    }

    for (const item of data.providerReferences) {
        if (
            !item.id ||
            !item.userId ||
            !item.version
        ) {
            throw new Error(
                'Invalid persisted Provider Reference.'
            );
        }

        const key = [
            item.provider,
            item.providerObjectType,
            item.providerObjectId
        ].join(':');

        if (providerReferencesById.has(item.id)) {
            throw new Error(
                `Duplicate persisted Provider Reference id: ${item.id}`
            );
        }

        if (providerReferenceIdsByKey.has(key)) {
            throw new Error(
                `Duplicate persisted Provider Reference: ${key}`
            );
        }

        providerReferencesById.set(
            item.id,
            clone(item)
        );

        providerReferenceIdsByKey.set(
            key,
            item.id
        );
    }

    persistenceLoaded = true;

    return {
        loaded: true,
        empty:
            paymentTransactionsById.size === 0 &&
            subscriptionsById.size === 0 &&
            entitlementsById.size === 0 &&
            providerReferencesById.size === 0,
        path: storageFilePath,
        counts: {
            paymentTransactions:
                paymentTransactionsById.size,
            subscriptions:
                subscriptionsById.size,
            entitlements:
                entitlementsById.size,
            providerReferences:
                providerReferencesById.size
        }
    };
}

function ensureLoaded() {
    if (!persistenceLoaded) {
        loadPaymentPersistence();
    }
}

function saveRecord(map, object) {
    const previous = map.get(object.id);

    map.set(object.id, clone(object));

    try {
        writeStorage();
    } catch (error) {
        if (previous) {
            map.set(object.id, previous);
        } else {
            map.delete(object.id);
        }
        throw error;
    }

    return clone(object);
}

function savePaymentTransaction(transaction) {
    ensureLoaded();

    const existingId =
        paymentIdsByIdempotencyKey.get(
            transaction.idempotencyKey
        );

    if (existingId && existingId !== transaction.id) {
        throw new Error(
            'Payment Transaction idempotency key already exists.'
        );
    }

    const result = saveRecord(
        paymentTransactionsById,
        transaction
    );

    paymentIdsByIdempotencyKey.set(
        transaction.idempotencyKey,
        transaction.id
    );

    return result;
}

function saveSubscription(subscription) {
    ensureLoaded();

    return saveRecord(
        subscriptionsById,
        subscription
    );
}

function saveEntitlement(entitlement) {
    ensureLoaded();

    return saveRecord(
        entitlementsById,
        entitlement
    );
}

function saveProviderReference(reference) {
    ensureLoaded();

    const key = providerReferenceKey(reference);
    const existingId =
        providerReferenceIdsByKey.get(key);

    if (existingId && existingId !== reference.id) {
        throw new Error(
            'Provider reference already exists.'
        );
    }

    const result = saveRecord(
        providerReferencesById,
        reference
    );

    providerReferenceIdsByKey.set(
        key,
        reference.id
    );

    return result;
}

function getPaymentTransaction(id) {
    ensureLoaded();

    const item = paymentTransactionsById.get(id);

    return item ? clone(item) : null;
}

function getSubscription(id) {
    ensureLoaded();

    const item = subscriptionsById.get(id);

    return item ? clone(item) : null;
}

function getEntitlement(id) {
    ensureLoaded();

    const item = entitlementsById.get(id);

    return item ? clone(item) : null;
}

function getProviderReference(id) {
    ensureLoaded();

    const item = providerReferencesById.get(id);

    return item ? clone(item) : null;
}

function getPaymentTransactionByIdempotencyKey(
    idempotencyKey
) {
    ensureLoaded();

    const id =
        paymentIdsByIdempotencyKey.get(
            idempotencyKey
        );

    return id
        ? getPaymentTransaction(id)
        : null;
}

function getProviderReferenceByKey(
    provider,
    providerObjectType,
    providerObjectId
) {
    ensureLoaded();

    const key = [
        provider,
        providerObjectType,
        providerObjectId
    ].join(':');

    const id =
        providerReferenceIdsByKey.get(key);

    return id
        ? getProviderReference(id)
        : null;
}

function getPaymentTransactionsByUser(userId) {
    ensureLoaded();

    return Array.from(
        paymentTransactionsById.values()
    )
        .filter(item => item.userId === userId)
        .map(clone);
}

function getSubscriptionsByUser(userId) {
    ensureLoaded();

    return Array.from(
        subscriptionsById.values()
    )
        .filter(item => item.userId === userId)
        .map(clone);
}

function getEntitlementsByUser(userId) {
    ensureLoaded();

    return Array.from(
        entitlementsById.values()
    )
        .filter(item => item.userId === userId)
        .map(clone);
}

function getProviderReferencesByUser(userId) {
    ensureLoaded();

    return Array.from(
        providerReferencesById.values()
    )
        .filter(item => item.userId === userId)
        .map(clone);
}

function updateRecord(map, id, nextObject) {
    ensureLoaded();

    const existing = map.get(id);

    if (!existing) {
        throw new Error(
            'Payment record does not exist.'
        );
    }

    if (nextObject.id !== id) {
        throw new Error(
            'Payment record identity cannot change.'
        );
    }

    if (existing.userId !== nextObject.userId) {
        throw new Error(
            'Payment record ownership cannot change.'
        );
    }

    return saveRecord(map, nextObject);
}

function updatePaymentTransaction(
    transaction
) {
    ensureLoaded();

    const existing =
        paymentTransactionsById.get(
            transaction.id
        );

    if (!existing) {
        throw new Error(
            'Payment Transaction does not exist.'
        );
    }

    if (
        existing.idempotencyKey !==
        transaction.idempotencyKey
    ) {
        throw new Error(
            'Payment Transaction idempotency key cannot change.'
        );
    }

    return updateRecord(
        paymentTransactionsById,
        transaction.id,
        transaction
    );
}

function updateSubscription(subscription) {
    return updateRecord(
        subscriptionsById,
        subscription.id,
        subscription
    );
}

function updateEntitlement(entitlement) {
    return updateRecord(
        entitlementsById,
        entitlement.id,
        entitlement
    );
}

function updateProviderReference(reference) {
    ensureLoaded();

    const existing =
        providerReferencesById.get(
            reference.id
        );

    if (!existing) {
        throw new Error(
            'Provider Reference does not exist.'
        );
    }

    if (
        existing.provider !== reference.provider ||
        existing.providerObjectType !==
            reference.providerObjectType ||
        existing.providerObjectId !==
            reference.providerObjectId
    ) {
        throw new Error(
            'Provider Reference identity cannot change.'
        );
    }

    return updateRecord(
        providerReferencesById,
        reference.id,
        reference
    );
}

function clearMaps() {
    paymentTransactionsById.clear();
    subscriptionsById.clear();
    entitlementsById.clear();
    providerReferencesById.clear();
    paymentIdsByIdempotencyKey.clear();
    providerReferenceIdsByKey.clear();
}

function clearPaymentPersistence() {
    clearMaps();

    persistenceLoaded = true;

    writeStorage();

    return {
        cleared: true,
        path: storageFilePath
    };
}

module.exports = {
    STORAGE_VERSION,
    DEFAULT_STORAGE_FILE,
    configurePaymentPersistence,
    getPaymentStoragePath,
    loadPaymentPersistence,
    savePaymentTransaction,
    saveSubscription,
    saveEntitlement,
    saveProviderReference,
    getPaymentTransaction,
    getSubscription,
    getEntitlement,
    getProviderReference,
    getPaymentTransactionByIdempotencyKey,
    getProviderReferenceByKey,
    getPaymentTransactionsByUser,
    getSubscriptionsByUser,
    getEntitlementsByUser,
    getProviderReferencesByUser,
    updatePaymentTransaction,
    updateSubscription,
    updateEntitlement,
    updateProviderReference,
    clearPaymentPersistence
};
