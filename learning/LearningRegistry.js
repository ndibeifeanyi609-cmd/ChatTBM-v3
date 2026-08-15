const {
    saveLearning,
    getLearning,
    getLearningsByUser,
    updateLearning: updatePersistedLearning,
    deleteLearning
} = require("./LearningPersistence");

const { isValidLearningType } = require("./LearningTypes");

const {
    isValidLifecycleState,
    canTransition
} = require("./LearningLifecycle");

function registerLearning(learning) {
    if (!learning || !learning.id) {
        return {
            success: false,
            learning: null,
            error: "Invalid learning."
        };
    }

    if (
        !learning.version ||
        !learning.userId ||
        !learning.lifecycle ||
        !isValidLifecycleState(learning.lifecycle) ||
        !isValidLearningType(learning.type)
    ) {
        return {
            success: false,
            learning: null,
            error: "Invalid canonical learning."
        };
    }

    const existing = getLearning(learning.id);

    if (existing) {
        if (
            JSON.stringify(existing) ===
            JSON.stringify(learning)
        ) {
            return {
                success: true,
                learning: existing,
                idempotent: true
            };
        }

        return {
            success: false,
            learning: existing,
            error: "Learning ID already exists."
        };
    }

    return saveLearning(learning);
}

function updateLearning(learning) {
    if (!learning || !learning.id) {
        return {
            success: false,
            learning: null,
            error: "Invalid learning."
        };
    }

    const existing = getLearning(learning.id);

    if (!existing) {
        return {
            success: false,
            learning: null,
            error: "Learning not found."
        };
    }

    if (
        !learning.version ||
        !learning.userId ||
        !learning.lifecycle ||
        !isValidLifecycleState(learning.lifecycle) ||
        !isValidLearningType(learning.type)
    ) {
        return {
            success: false,
            learning: existing,
            error: "Invalid canonical learning."
        };
    }

    if (existing.userId !== learning.userId) {
        return {
            success: false,
            learning: existing,
            error: "Learning ownership cannot be changed."
        };
    }

    if (
        existing.lifecycle !== learning.lifecycle &&
        !canTransition(
            existing.lifecycle,
            learning.lifecycle
        )
    ) {
        return {
            success: false,
            learning: existing,
            error: "Invalid learning lifecycle transition."
        };
    }

    return updatePersistedLearning(learning);
}

function getRegisteredLearning(id, userId) {
    const learning = getLearning(id);

    if (!learning) {
        return {
            success: false,
            learning: null,
            error: "Learning not found."
        };
    }

    if (
        typeof userId !== "string" ||
        learning.userId !== userId
    ) {
        return {
            success: false,
            learning: null,
            error: "Learning not found."
        };
    }

    return {
        success: true,
        learning
    };
}

function getUserLearnings(userId) {
    return getLearningsByUser(userId);
}

function unregisterLearning(id) {
    return deleteLearning(id);
}

module.exports = {
    registerLearning,
    updateLearning,
    getRegisteredLearning,
    getUserLearnings,
    unregisterLearning
};
