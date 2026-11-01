'use strict';

const STAGING_DIAGNOSTIC_SERVICE_ID = 'srv-dbd5pddg1s2s73dsm6k0';

function isStagingDiagnosticService(environment = process.env) {
    return environment.RENDER_SERVICE_ID === STAGING_DIAGNOSTIC_SERVICE_ID;
}

module.exports = { STAGING_DIAGNOSTIC_SERVICE_ID, isStagingDiagnosticService };
