'use strict';

// =====================================
// ChatTBM
// REG-095 Intelligence Orchestration
//
// Canonical Intelligence Orchestration
// Application Facade
// =====================================

const {
    handleOrchestration
} = require('./IntelligenceOrchestrationBoundary');

async function orchestrate(
    data = {},
    dependencies = {}
) {
    return handleOrchestration(
        data,
        dependencies
    );
}

module.exports = {
    orchestrate
};
