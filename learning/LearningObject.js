const {
    LEARNING_TYPES,
    isValidLearningType
} = require("./LearningTypes");

// =====================================
// LEARNING OBJECT VERSION
// =====================================

const LEARNING_OBJECT_VERSION = "1.0";

// =====================================
// CREATE LEARNING OBJECT
// =====================================

function createLearningObject(data = {}) {

    const type =
        isValidLearningType(data.type)
            ? data.type
            : LEARNING_TYPES[0];

    const now =
        new Date().toISOString();

    return {

        // ===============================
        // IDENTITY
        // ===============================

        id:
            data.id ||
            createLearningId(),

        version:
            LEARNING_OBJECT_VERSION,

        type,

        // ===============================
        // OWNERSHIP
        // ===============================

        userId:
            data.userId ||
            "guest",

        // ===============================
        // SUBJECT
        // ===============================

        subject:
            data.subject ??
            null,

        // ===============================
        // INPUT
        // ===============================

        input:
            data.input &&
            typeof data.input === "object" &&
            !Array.isArray(data.input)
                ? data.input
                : {},

        // ===============================
        // LEARNING
        // ===============================

        learning:
            data.learning ??
            null,

        // ===============================
        // EVIDENCE
        // ===============================

        evidence:
            Array.isArray(data.evidence)
                ? data.evidence
                : [],

        // ===============================
        // CONFIDENCE
        // ===============================

        confidence:
            normalizeConfidence(
                data.confidence
            ),

        // ===============================
        // LIFECYCLE
        // ===============================

        lifecycle:
            data.lifecycle ||
            "proposed",

        // ===============================
        // PROVENANCE
        // ===============================

        provenance: {
            sourceType:
                data.provenance?.sourceType ||
                "ChatTBM",

            sourceId:
                data.provenance?.sourceId ||
                null,

            sourceVersion:
                data.provenance?.sourceVersion ||
                null
        },

        // ===============================
        // EVALUATION REFERENCES
        // ===============================

        evaluationRefs:
            Array.isArray(data.evaluationRefs)
                ? data.evaluationRefs
                : [],

        // ===============================
        // TIMESTAMPS
        // ===============================

        createdAt:
            data.createdAt ||
            now,

        updatedAt:
            data.updatedAt ||
            now

    };

}

// =====================================
// LEARNING ID
// =====================================

function createLearningId() {

    return (
        "learning_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}

// =====================================
// NORMALIZE CONFIDENCE
// =====================================

function normalizeConfidence(confidence) {

    if (
        typeof confidence !== "number" ||
        Number.isNaN(confidence)
    ) {
        return null;
    }

    if (confidence < 0) {
        return 0;
    }

    if (confidence > 1) {
        return 1;
    }

    return confidence;

}

module.exports = {
    createLearningObject
};
