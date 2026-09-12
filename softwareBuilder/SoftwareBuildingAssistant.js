'use strict';

const { validateSoftwareBuildRequest } = require('./SoftwareBuildRequest');
const { createBuildObjective } = require('./BuildObjective');
const { createBuildPlan } = require('./BuildPlan');
const { validateBuildAccess } = require('./SoftwareBuildingBoundary');
const { generateReply } = require('../services/assistantEngine');

function createBuild(request) {
  const requestResult = validateSoftwareBuildRequest(request);

  if (!requestResult.valid) {
    return requestResult;
  }

  const accessResult = validateBuildAccess(requestResult.value);

  if (!accessResult.valid) {
    return accessResult;
  }

  const objectiveResult = createBuildObjective(requestResult.value);

  if (!objectiveResult.valid) {
    return objectiveResult;
  }

  const planResult = createBuildPlan(objectiveResult.objective);

  if (!planResult.valid) {
    return planResult;
  }

  return {
    valid: true,
    build: {
      objective: objectiveResult.objective,
      plan: planResult.plan,
      execution: {
        available: false,
        status: 'not-executed',
        reason: 'No approved execution boundary is available.'
      }
    }
  };
}

function normalizeDelegatedFailure(result) {
  if (result && result.success === false) {
    return {
      valid: false,
      error: {
        code: 'DELEGATED_ASSISTANT_FAILURE',
        message:
          result.error?.message ||
          'Assistant Engine delegation failed.',
        causeCode:
          result.error?.code ||
          'ASSISTANT_ERROR'
      }
    };
  }

  return {
    valid: false,
    error: {
      code: 'DELEGATED_ASSISTANT_FAILURE',
      message: 'Assistant Engine returned an invalid delegation result.',
      causeCode: 'INVALID_ASSISTANT_RESULT'
    }
  };
}

async function delegateBuildReasoning(build) {
  if (!build || typeof build !== 'object' || Array.isArray(build)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_DELEGATION_REQUEST',
        message: 'Build delegation requires a valid build.'
      }
    };
  }

  const objective = build.objective;
  const plan = build.plan;

  if (!objective || !plan || !Array.isArray(plan.steps)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_DELEGATION_REQUEST',
        message: 'Build delegation requires an objective and plan.'
      }
    };
  }

  try {
    const result = await generateReply({
      userId: objective.userId,
      message: [
        `Build objective: ${objective.intent}`,
        `Operation ID: ${objective.operationId}`,
        `Plan steps: ${plan.steps.map((step) => step.type).join(', ')}`,
        'Provide reasoning and guidance only. Do not claim that any implementation or verification has been executed.'
      ].join('\n')
    });

    if (!result || result.success !== true || typeof result.response !== 'string') {
      return normalizeDelegatedFailure(result);
    }

    return {
      valid: true,
      delegation: {
        operationId: objective.operationId,
        userId: objective.userId,
        response: result.response,
        execution: {
          available: false,
          status: 'not-executed',
          reason: 'Assistant Engine reasoning does not authorize consequential software execution.'
        }
      }
    };
  } catch (error) {
    return normalizeDelegatedFailure({
      success: false,
      error
    });
  }
}

module.exports = {
  createBuild,
  delegateBuildReasoning,
  normalizeDelegatedFailure
};
