'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { ACCESS, decideProductAccess } = require('../access/ProductAccessPolicy');

const paidPolicy = { requiresSubscription: true, founderExemptionEnabled: false, founderExemptionAllowed: true };

test('rejects missing authenticated identity', () => {
    assert.equal(decideProductAccess({ feature: 'chat', policy: paidPolicy }).decision, ACCESS.DENY);
});

test('returns unavailable when trusted policy is missing', () => {
    const result = decideProductAccess({ userId: 'u1', feature: 'chat' });
    assert.equal(result.decision, ACCESS.UNAVAILABLE);
    assert.equal(result.code, 'ACCESS_POLICY_UNAVAILABLE');
});

test('allows a feature explicitly included in the free policy', () => {
    const result = decideProductAccess({
        userId: 'u1', feature: 'chat',
        policy: { requiresSubscription: false }
    });
    assert.equal(result.decision, ACCESS.ALLOW);
    assert.equal(result.code, 'FEATURE_INCLUDED');
});

test('denies a paid feature when entitlement is missing', () => {
    const result = decideProductAccess({
        userId: 'u1', feature: 'builder', policy: paidPolicy
    });
    assert.equal(result.decision, ACCESS.UNAVAILABLE);
    assert.equal(result.code, 'ENTITLEMENT_UNAVAILABLE');
});

test('denies an inactive entitlement', () => {
    const result = decideProductAccess({
        userId: 'u1', feature: 'builder', policy: paidPolicy,
        entitlement: { active: false, userId: 'u1' }
    });
    assert.equal(result.decision, ACCESS.DENY);
    assert.equal(result.code, 'SUBSCRIPTION_REQUIRED');
});

test('does not accept another users entitlement', () => {
    const result = decideProductAccess({
        userId: 'u1', feature: 'builder', policy: paidPolicy,
        entitlement: { active: true, userId: 'u2' }
    });
    assert.equal(result.decision, ACCESS.DENY);
    assert.equal(result.code, 'SUBSCRIPTION_REQUIRED');
});

test('founder exemption is denied until trusted policy explicitly enables it', () => {
    const result = decideProductAccess({
        userId: 'founder', feature: 'builder',
        founderUserId: 'founder',
        founderAccountVerified: true,
        founderAccountEnabled: true,
        policy: paidPolicy
    });
    assert.equal(result.decision, ACCESS.UNAVAILABLE);
    assert.equal(result.code, 'ENTITLEMENT_UNAVAILABLE');
});

test('founder account must be verified and enabled before exemption', () => {
    const result = decideProductAccess({
        userId: 'founder', feature: 'builder',
        founderUserId: 'founder',
        founderAccountVerified: false,
        founderAccountEnabled: true,
        policy: { requiresSubscription: true, founderExemptionEnabled: true, founderExemptionAllowed: true }
    });
    assert.equal(result.decision, ACCESS.DENY);
    assert.equal(result.code, 'FOUNDER_ACCOUNT_NOT_ELIGIBLE');
});

test('allows eligible founder only when both trusted exemption controls are enabled', () => {
    const result = decideProductAccess({
        userId: 'founder', feature: 'builder',
        founderUserId: 'founder',
        founderAccountVerified: true,
        founderAccountEnabled: true,
        policy: { requiresSubscription: true, founderExemptionEnabled: true, founderExemptionAllowed: true }
    });
    assert.equal(result.decision, ACCESS.ALLOW);
    assert.equal(result.code, 'FOUNDER_EXEMPTION');
});

test('ignores client-style founder flags because they are not policy inputs', () => {
    const result = decideProductAccess({
        userId: 'u1', feature: 'builder',
        isFounder: true, isAdmin: true, role: 'admin',
        policy: paidPolicy
    });
    assert.equal(result.decision, ACCESS.UNAVAILABLE);
    assert.equal(result.code, 'ENTITLEMENT_UNAVAILABLE');
});
