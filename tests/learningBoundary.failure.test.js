const assert = require("assert");

const {
    createBoundaryInput,
    integrateLegacyLearning
} = require("../services/LearningBoundary");

const {
    clearLearnings,
    getLearning,
    getLearningsByUser
} = require("../learning/LearningPersistence");

const {
    updateLearning
} = require("../learning/LearningRegistry");

async function runFailureTests() {

    console.log("\n=== LEARNING BOUNDARY FAILURE TEST ===\n");

    clearLearnings();


    // =====================================
    // INVALID INPUT TYPES
    // =====================================

    for (const value of [
        null,
        undefined,
        "invalid",
        123,
        true,
        []
    ]) {

        const result =
            createBoundaryInput(value);

        assert.strictEqual(
            result.success,
            false
        );

        assert.strictEqual(
            result.input,
            null
        );
    }

    console.log("✓ Invalid boundary input rejection");


    // =====================================
    // UNSUPPORTED SOURCE
    // =====================================

    const unsupportedSource =
        integrateLegacyLearning({
            source: "unknownLearningEngine",
            type: "behavior",
            userId: "failure-user"
        });

    assert.strictEqual(unsupportedSource.success, false);
    assert.strictEqual(unsupportedSource.learning, null);

    console.log("✓ Unsupported source rejection");

    // =====================================
    // INVALID TYPE
    // =====================================

    const invalidType =
        integrateLegacyLearning({
            source: "learningEngine",
            type: "unknown-type",
            userId: "failure-user"
        });

    assert.strictEqual(invalidType.success, false);
    assert.strictEqual(invalidType.learning, null);

    console.log("✓ Invalid type rejection");

    // =====================================
    // MALFORMED OPTIONAL FIELDS
    // =====================================

    const malformed =
        createBoundaryInput({
            source: "learningEngine",
            type: "behavior",
            input: [],
            evidence: {},
            evaluationRefs: {}
        });

    assert.strictEqual(malformed.success, true);
    assert.deepStrictEqual(malformed.input.input, {});
    assert.deepStrictEqual(malformed.input.evidence, []);
    assert.deepStrictEqual(malformed.input.evaluationRefs, []);

    console.log("✓ Malformed optional field normalization");

    // =====================================
    // INVALID LIFECYCLE
    // =====================================

    const invalidLifecycle =
        integrateLegacyLearning({
            source: "learningEngine",
            type: "behavior",
            userId: "lifecycle-failure-user",
            lifecycle: "invalid-lifecycle"
        });

    assert.strictEqual(invalidLifecycle.success, false);

    console.log("✓ Invalid lifecycle rejection");

    // =====================================
    // INVALID CONFIDENCE NORMALIZATION
    // =====================================

    const invalidConfidence =
        integrateLegacyLearning({
            source: "learningEngine",
            type: "pattern",
            userId: "confidence-failure-user",
            confidence: "invalid-confidence"
        });

    assert.strictEqual(invalidConfidence.success, true);
    assert.strictEqual(invalidConfidence.learning.confidence, null);

    console.log("✓ Invalid confidence normalization");

    // =====================================
    // SEMANTIC IDENTITY PROTECTION
    // =====================================

    const first =
        integrateLegacyLearning({
            source: "learningEngine",
            type: "preference",
            userId: "identity-user",
            subject: "posting",
            learning: "short captions"
        });

    assert.strictEqual(first.success, true);

    const second =
        integrateLegacyLearning({
            source: "creatorLearningEngine",
            type: "preference",
            userId: "identity-user",
            subject: "posting",
            learning: "short captions"
        });

    assert.strictEqual(second.success, false);
    assert.strictEqual(second.error, "Learning identity already exists.");

    console.log("✓ Semantic learning identity protection");

    // =====================================
    // OWNERSHIP REASSIGNMENT PROTECTION
    // =====================================

    const owned =
        integrateLegacyLearning({
            source: "performanceLearningEngine",
            type: "performance",
            userId: "owner-user",
            subject: "content",
            learning: "strong hooks"
        });

    assert.strictEqual(owned.success, true);

    const stored =
        getLearning(owned.learning.id);

    assert.ok(stored);

    const reassigned = {
        ...stored,
        userId: "attacker-user"
    };

    const ownershipUpdate =
        updateLearning(reassigned);

    assert.strictEqual(ownershipUpdate.success, false);
    assert.strictEqual(
        ownershipUpdate.error,
        "Learning ownership cannot be changed."
    );

    assert.strictEqual(
        getLearning(stored.id).userId,
        "owner-user"
    );

    console.log("✓ Ownership reassignment rejection");

    // =====================================
    // USER-SCOPED ISOLATION
    // =====================================

    const ownerResults =
        getLearningsByUser("owner-user");

    const attackerResults =
        getLearningsByUser("attacker-user");

    assert.ok(
        ownerResults.some(
            learning => learning.id === stored.id
        )
    );

    assert.strictEqual(
        attackerResults.some(
            learning => learning.id === stored.id
        ),
        false
    );

    console.log("✓ User-scoped learning isolation");

    clearLearnings();

    assert.strictEqual(
        getLearning(stored.id),
        null
    );

    console.log("✓ Failure-test state cleanup");

}

runFailureTests().catch(error => {
    console.error(
        "\n=== LEARNING BOUNDARY FAILURE GATE FAILED ==="
    );

    console.error(error);

    process.exitCode = 1;
});
