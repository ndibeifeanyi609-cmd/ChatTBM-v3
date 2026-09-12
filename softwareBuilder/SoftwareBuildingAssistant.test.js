'use strict';

const assert = require('assert');

const { validateSoftwareBuildRequest } = require('./SoftwareBuildRequest');
const { createBuildObjective } = require('./BuildObjective');
const { createBuildPlan } = require('./BuildPlan');
const {
  validateBuildAccess,
  authorizeOperation
} = require('./SoftwareBuildingBoundary');
const {
  createBuild,
  delegateBuildReasoning,
  normalizeDelegatedFailure
} = require('./SoftwareBuildingAssistant');

async function run() {
  const requestResult = validateSoftwareBuildRequest({
    operationId: 'op-001',
    userId: 'user-1',
    message: 'Build a web application'
  });

  assert.strictEqual(requestResult.valid, true);
  assert.strictEqual(requestResult.value.operationId, 'op-001');
  assert.strictEqual(requestResult.value.userId, 'user-1');

  const missingOperationResult = validateSoftwareBuildRequest({
    userId: 'user-1',
    message: 'Build a web application'
  });

  assert.strictEqual(missingOperationResult.valid, false);
  assert.strictEqual(missingOperationResult.error.code, 'INVALID_REQUEST');

  const objectiveResult = createBuildObjective(requestResult.value);

  assert.strictEqual(objectiveResult.valid, true);
  assert.strictEqual(objectiveResult.objective.operationId, 'op-001');
  assert.strictEqual(objectiveResult.objective.id, 'build-objective:op-001');
  assert.strictEqual(objectiveResult.objective.userId, 'user-1');
  assert.strictEqual(objectiveResult.objective.intent, 'Build a web application');

  const secondObjectiveResult = createBuildObjective({
    operationId: 'op-002',
    userId: 'user-1',
    message: 'Build a web application'
  });

  assert.strictEqual(secondObjectiveResult.valid, true);
  assert.notStrictEqual(
    objectiveResult.objective.id,
    secondObjectiveResult.objective.id
  );

  const planResult = createBuildPlan(objectiveResult.objective);

  assert.strictEqual(planResult.valid, true);
  assert.strictEqual(planResult.plan.operationId, 'op-001');
  assert.strictEqual(planResult.plan.id, 'build-plan:op-001');
  assert.strictEqual(planResult.plan.objectiveId, 'build-objective:op-001');
  assert.strictEqual(planResult.plan.steps.length, 4);
  assert.deepStrictEqual(
    planResult.plan.steps.map((step) => step.type),
    ['analyze', 'design', 'implement', 'verify']
  );

  const accessResult = validateBuildAccess({
    operationId: 'op-001',
    userId: 'user-1'
  });

  assert.strictEqual(accessResult.valid, true);
  assert.strictEqual(accessResult.access.authorized, true);

  const unsupportedResult = authorizeOperation(
    { operationId: 'op-001', userId: 'user-1' },
    'write-file'
  );

  assert.strictEqual(unsupportedResult.valid, false);
  assert.strictEqual(unsupportedResult.error.code, 'UNSUPPORTED_OPERATION');

  const unauthorizedResult = authorizeOperation(
    { operationId: 'op-001', userId: '' },
    'write-file'
  );

  assert.strictEqual(unauthorizedResult.valid, false);
  assert.strictEqual(unauthorizedResult.error.code, 'UNAUTHORIZED_OPERATION');

  const buildResult = createBuild({
    operationId: 'op-001',
    userId: 'user-1',
    message: 'Build a web application'
  });

  assert.strictEqual(buildResult.valid, true);
  assert.strictEqual(
    buildResult.build.objective.id,
    'build-objective:op-001'
  );
  assert.strictEqual(
    buildResult.build.plan.id,
    'build-plan:op-001'
  );
  assert.strictEqual(buildResult.build.execution.available, false);
  assert.strictEqual(buildResult.build.execution.status, 'not-executed');

  const invalidBuildResult = createBuild({
    operationId: 'op-002',
    userId: 'user-1',
    message: ''
  });

  assert.strictEqual(invalidBuildResult.valid, false);
  assert.strictEqual(invalidBuildResult.error.code, 'INVALID_REQUEST');

  const invalidDelegationResult = await delegateBuildReasoning(null);

  assert.strictEqual(invalidDelegationResult.valid, false);
  assert.strictEqual(
    invalidDelegationResult.error.code,
    'INVALID_DELEGATION_REQUEST'
  );

  const malformedPlanResult = await delegateBuildReasoning({ objective: { userId: 'user-1', operationId: 'op-003', intent: 'test' }, plan: {} });

  assert.strictEqual(malformedPlanResult.valid, false);
  assert.strictEqual(malformedPlanResult.error.code, 'INVALID_DELEGATION_REQUEST');

  const normalizedFailure = normalizeDelegatedFailure({
    success: false,
    error: {
      code: 'PROVIDER_UNAVAILABLE',
      message: 'Gemini API key is not configured.'
    }
  });

  assert.strictEqual(normalizedFailure.valid, false);
  assert.strictEqual(
    normalizedFailure.error.code,
    'DELEGATED_ASSISTANT_FAILURE'
  );
  assert.strictEqual(
    normalizedFailure.error.causeCode,
    'PROVIDER_UNAVAILABLE'
  );

  const delegationResult = await delegateBuildReasoning(buildResult.build);

  assert.strictEqual(delegationResult.valid, false);
  assert.strictEqual(
    delegationResult.error.code,
    'DELEGATED_ASSISTANT_FAILURE'
  );
  assert.strictEqual(
    delegationResult.error.causeCode,
    'PROVIDER_UNAVAILABLE'
  );

  assert.strictEqual(buildResult.build.execution.status, 'not-executed');
  assert.strictEqual(buildResult.build.execution.available, false);

  console.log('SoftwareBuildingAssistant verification passed.');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
