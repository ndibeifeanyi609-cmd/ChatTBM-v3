'use strict';

function createBuildPlan(objective) {
  if (!objective || typeof objective !== 'object' || Array.isArray(objective)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_PLAN',
        message: 'Build plan requires a valid objective.'
      }
    };
  }

  const operationId =
    typeof objective.operationId === 'string' && objective.operationId.trim()
      ? objective.operationId.trim()
      : '';

  const objectiveId =
    typeof objective.id === 'string' && objective.id.trim()
      ? objective.id.trim()
      : '';

  const userId =
    typeof objective.userId === 'string' && objective.userId.trim()
      ? objective.userId.trim()
      : '';

  const intent =
    typeof objective.intent === 'string'
      ? objective.intent.trim()
      : '';

  if (!operationId || !objectiveId || !userId || !intent) {
    return {
      valid: false,
      error: {
        code: 'INVALID_PLAN',
        message: 'Build plan requires operation identity, objective identity, ownership, and intent.'
      }
    };
  }

  return {
    valid: true,
    plan: {
      id: `build-plan:${operationId}`,
      operationId,
      objectiveId,
      userId,
      status: 'planned',
      steps: [
        {
          id: 'step-1',
          type: 'analyze',
          description: 'Analyze the requested software-building objective.'
        },
        {
          id: 'step-2',
          type: 'design',
          description: 'Define the required software structure and implementation approach.'
        },
        {
          id: 'step-3',
          type: 'implement',
          description: 'Identify implementation work that may be performed only through an approved execution boundary.'
        },
        {
          id: 'step-4',
          type: 'verify',
          description: 'Identify verification required before reporting successful completion.'
        }
      ]
    }
  };
}

module.exports = {
  createBuildPlan
};
