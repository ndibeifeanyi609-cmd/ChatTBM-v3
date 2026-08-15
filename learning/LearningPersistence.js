const crypto = require("crypto");

const learningsById = new Map();
const learningIdsByKey = new Map();

// =====================================
// CREATE LEARNING KEY
// =====================================

function createLearningKey(learning) {
    if (!learning || typeof learning !== "object") {
        return null;
    }

    const identity = JSON.stringify([
        learning.userId ?? null,
        learning.type ?? null,
        learning.subject ?? null,
        learning.learning ?? null
    ]);

    return crypto
        .createHash("sha256")
        .update(identity)
        .digest("hex");
}

// =====================================
// SAVE LEARNING
// =====================================

function saveLearning(learning) {
    if (
        !learning ||
        !learning.id ||
        !learning.userId
    ) {
        return {
            success: false,
            learning: null,
            error: "Invalid learning."
        };
    }

    const learningKey =
        createLearningKey(learning);

    if (!learningKey) {
        return {
            success: false,
            learning: null,
            error: "Unable to create learning identity."
        };
    }

    const existingById =
        learningsById.get(learning.id);

    if (existingById) {
        if (
            JSON.stringify(existingById) ===
            JSON.stringify(learning)
        ) {
            return {
                success: true,
                learning: existingById,
                learningKey,
                idempotent: true
            };
        }

        return {
            success: false,
            learning: existingById,
            learningKey,
            error: "Learning ID already exists."
        };
    }

    const existingId =
        learningIdsByKey.get(learningKey);

    if (
        existingId &&
        existingId !== learning.id
    ) {
        const existing =
            learningsById.get(existingId);

        return {
            success: false,
            learning: existing || null,
            learningKey,
            error: "Learning identity already exists."
        };
    }

    learningsById.set(
        learning.id,
        learning
    );

    learningIdsByKey.set(
        learningKey,
        learning.id
    );

    return {
        success: true,
        learning,
        learningKey,
        idempotent: false
    };
}

// =====================================
// UPDATE LEARNING
// =====================================

function updateLearning(learning) {
    if (
        !learning ||
        !learning.id ||
        !learning.userId
    ) {
        return {
            success: false,
            learning: null,
            error: "Invalid learning."
        };
    }

    const existing =
        learningsById.get(learning.id);

    if (!existing) {
        return {
            success: false,
            learning: null,
            error: "Learning not found."
        };
    }

    if (existing.userId !== learning.userId) {
        return {
            success: false,
            learning: existing,
            error: "Learning ownership cannot be changed."
        };
    }

    const oldKey =
        createLearningKey(existing);

    const newKey =
        createLearningKey(learning);

    if (!newKey) {
        return {
            success: false,
            learning: existing,
            error: "Unable to create learning identity."
        };
    }

    const existingId =
        learningIdsByKey.get(newKey);

    if (
        existingId &&
        existingId !== learning.id
    ) {
        const conflictingLearning =
            learningsById.get(existingId);

        return {
            success: false,
            learning: conflictingLearning || existing,
            error: "Learning identity already exists."
        };
    }

    learningsById.set(
        learning.id,
        learning
    );
    if (
        oldKey &&
        oldKey !== newKey &&
        learningIdsByKey.get(oldKey) === learning.id
    ) {
        learningIdsByKey.delete(oldKey);
    }
    learningIdsByKey.set(
        newKey,
        learning.id
    );

    return {
        success: true,
        learning,
        learningKey: newKey
    };
}

// =====================================
// GET LEARNING
// =====================================

function getLearning(id) {
    return learningsById.get(id) || null;
}

// =====================================
// GET LEARNINGS BY USER
// =====================================

function getLearningsByUser(userId) {
    return [
        ...learningsById.values()
    ].filter(
        learning =>
            learning.userId === userId
    );
}

// =====================================
// DELETE LEARNING
// =====================================

function deleteLearning(id) {
    const learning =
        learningsById.get(id);

    if (!learning) {
        return false;
    }

    const learningKey =
        createLearningKey(learning);

    learningsById.delete(id);

    if (
        learningKey &&
        learningIdsByKey.get(learningKey) === id
    ) {
        learningIdsByKey.delete(
            learningKey
        );
    }

    return true;
}

// =====================================
// CLEAR LEARNINGS
// =====================================

function clearLearnings() {
    learningsById.clear();
    learningIdsByKey.clear();
}

// =====================================
// EXPORTS
// =====================================

module.exports = {
    createLearningKey,
    saveLearning,
    updateLearning,
    getLearning,
    getLearningsByUser,
    deleteLearning,
    clearLearnings
};
