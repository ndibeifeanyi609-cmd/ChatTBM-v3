'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isStagingDiagnosticService, STAGING_DIAGNOSTIC_SERVICE_ID } = require('../auth/stagingDiagnosticGuard');

test('allows the schema diagnostic only on the designated staging service', () => {
    assert.equal(isStagingDiagnosticService({ RENDER_SERVICE_ID: STAGING_DIAGNOSTIC_SERVICE_ID }), true);
});

test('fails closed when the Render service ID is absent', () => {
    assert.equal(isStagingDiagnosticService({}), false);
});

test('fails closed on production and every other service ID', () => {
    assert.equal(isStagingDiagnosticService({ RENDER_SERVICE_ID: 'srv-production' }), false);
    assert.equal(isStagingDiagnosticService({ RENDER_SERVICE_ID: 'srv-other-staging' }), false);
});
