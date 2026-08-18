const assert = require("assert");

const {
    LEGACY_SOURCES,
    CANONICAL_TYPES,
    isValidSource,
    isValidType,
    createBoundaryInput,
    integrateLegacyLearning
} = require("../services/LearningBoundary");

async function runTests() {

    console.log("\n=== LEARNING BOUNDARY TEST ===\n");

    // =====================================
    // CONSTANTS
    // =====================================

    assert.ok(Array.isArray(LEGACY_SOURCES));
    assert.ok(Array.isArray(CANONICAL_TYPES));
    console.log("✓ Boundary contract constants");

    // =====================================
    // SOURCE VALIDATION
    // =====================================

    assert.strictEqual(
        isValidSource("learningEngine"),
        true
    );

    assert.strictEqual(
        isValidSource("unknownSource"),
        false
    );

    console.log("✓ Legacy source validation");

    // =====================================
    // TYPE VALIDATION
    // =====================================

    assert.strictEqual(
        isValidType("preference"),
        true
    );

    assert.strictEqual(
        isValidType("invalid-type"),
        false
    );

    console.log("✓ Canonical learning type validation");

    // =====================================
    // INVALID INPUT
    // =====================================

    const invalidNull =
        createBoundaryInput(null);

    assert.strictEqual(
        invalidNull.success,
        false
    );

    const invalidArray =
        createBoundaryInput([]);

    assert.strictEqual(
        invalidArray.success,
        false
    );

    console.log("✓ Invalid boundary input protection");

    // =====================================
    // INVALID SOURCE
    // =====================================

    const invalidSource =
        createBoundaryInput({
            source: "unknownSource",
            type: "preference"
        });

    assert.strictEqual(
        invalidSource.success,
        false
    );

    assert.strictEqual(
        invalidSource.error,
        "Unsupported learning source."
    );

    console.log("✓ Unsupported source rejection");

    // =====================================
    // INVALID TYPE
    // =====================================

    const invalidType =
        createBoundaryInput({
            source: "learningEngine",
            type: "invalid-type"
        });

    assert.strictEqual(
        invalidType.success,
        false
    );

    assert.strictEqual(
        invalidType.error,
        "Invalid canonical learning type."
    );

    console.log("✓ Invalid canonical type rejection");

    // =====================================
    // CANONICAL INPUT TRANSLATION
    // =====================================

    const prepared =
        createBoundaryInput({
            source: "creatorLearningEngine",
            sourceId: "legacy-123",
            sourceVersion: "2.0",
            type: "pattern",
            userId: "test-user",
            subject: "content",
            input: {
                message: "test"
            },
            learning: {
                pattern: "short hooks"
            },
            evidence: [
                {
                    source: "evaluation"
                }
            ],
            confidence: 0.8,
            lifecycle: "proposed",
            evaluationRefs: [
                "evaluation-1"
            ]
        });

    assert.strictEqual(
        prepared.success,
        true
    );

    assert.strictEqual(
        prepared.input.type,
        "pattern"
    );

    assert.strictEqual(
        prepared.input.userId,
        "test-user"
    );

    assert.strictEqual(
        prepared.input.subject,
        "content"
    );

    assert.deepStrictEqual(
        prepared.input.input,
        {
            message: "test"
        }
    );

    assert.deepStrictEqual(
        prepared.input.learning,
        {
            pattern: "short hooks"
        }
    );

    assert.deepStrictEqual(
        prepared.input.evidence,
         [
            {
                source: "evaluation"
            }
        ]
    );

    assert.deepStrictEqual(
        prepared.input.evaluationRefs,
        [
            "evaluation-1"
        ]
    );

    assert.strictEqual(
        prepared.input.provenance.sourceType,
        "creatorLearningEngine"
    );

    assert.strictEqual(
        prepared.input.provenance.sourceId,
        "legacy-123"
    );

    assert.strictEqual(
        prepared.input.provenance.sourceVersion,
        "2.0"
    );

    console.log("✓ Legacy-to-canonical input translation");

    // =====================================
    // DEFAULT OWNERSHIP
    // =====================================

    const guestInput =
        createBoundaryInput({
            source: "learningEngine",
            type: "behavior"
        });

    assert.strictEqual(
        guestInput.success,
        true
    );

    assert.strictEqual(
        guestInput.input.userId,
        "guest"
    );

    console.log("✓ Guest ownership normalization");

    // =====================================
    // INTEGRATION
    // =====================================

    const integrated =
        integrateLegacyLearning({
            source: "performanceLearningEngine",
            sourceId: "performance-001",
            sourceVersion: "1.0",
            type: "performance",
            userId: "boundary-test-user",
            subject: "content-performance",
            learning: "High-performing hooks should be retained.",
            evidence: [
                "evaluation-001"
            ],
            confidence: 0.9
        });

    assert.strictEqual(
        integrated.success,
        true
    );

    assert.ok(
        integrated.learning
    );

    assert.strictEqual(
        integrated.learning.type,
        "performance"
    );

    assert.strictEqual(
        integrated.learning.userId,
        "boundary-test-user"
    );

    assert.strictEqual(
        integrated.learning.provenance.sourceType,
        "performanceLearningEngine"
    );

    assert.strictEqual(
        integrated.learning.provenance.sourceId,
        "performance-001"
    );

    assert.strictEqual(
        integrated.learning.confidence,
        0.9
    );

    console.log("✓ Canonical learning integration");

    // =====================================
    // INTEGRATION FAILURE
    // =====================================

    const failedIntegration =
        integrateLegacyLearning({
            source: "invalidSource",
            type: "performance",
            userId: "failure-test-user"
        });

    assert.strictEqual(
        failedIntegration.success,
        false
    );

    assert.strictEqual(
        failedIntegration.learning,
        null
    );

    console.log("✓ Integration failure protection");

    // =====================================
    // MALFORMED OPTIONAL FIELDS
    // =====================================

    const normalized =
        createBoundaryInput({
            source: "profileLearningBridge",
            type: "preference",
            input: [],
            evidence: "invalid",
            evaluationRefs: "invalid"
        });

    assert.strictEqual(
        normalized.success,
        true
    );

    assert.deepStrictEqual(
        normalized.input.input,
        {}
    );

    assert.deepStrictEqual(
        normalized.input.evidence,
        []
    );

    assert.deepStrictEqual(
        normalized.input.evaluationRefs,
        []
    );

    console.log("✓ Optional field normalization");

    console.log(
        "\n=== LEARNING BOUNDARY VERIFIED ===\n"
    );
}

runTests().catch(error => {
    console.error(
        "\n=== LEARNING BOUNDARY FAILED ==="
    );

    console.error(error);

    process.exitCode = 1;
});
