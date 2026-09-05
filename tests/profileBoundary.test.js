'use strict';

const assert = require('assert');

const T = require('../profile/ProfileTypes');
const L = require('../profile/ProfileLifecycle');
const O = require('../profile/ProfileObject');
const P = require('../profile/ProfilePersistence');
const R = require('../profile/ProfileRegistry');
const B = require('../profile/ProfileBoundary');

function profile(x = {}) {
  return O.createProfileObject({
    userId: 'profile-test-user',
    type: 'attribute',
    subject: 'creatorName',
    value: 'Test Creator',
    provenance: {
      sourceType: 'user',
      sourceId: 'msg-001',
      sourceVersion: '1.0'
    },
    ...x
  });
}

function runTests() {
  console.log('\n=== PROFILE FOUNDATION TEST ===\n');

  assert.deepStrictEqual(T.PROFILE_TYPES, ['identity', 'attribute']);
  assert.strictEqual(T.isValidProfileType('identity'), true);
  assert.strictEqual(T.isValidProfileType('attribute'), true);
  assert.strictEqual(T.isValidProfileType('niche'), false);
  console.log('✓ Profile types');

  assert.deepStrictEqual(L.PROFILE_LIFECYCLE_STATES,
    ['proposed', 'active', 'superseded', 'rejected']);
  assert.strictEqual(L.canTransition('proposed', 'active'), true);
  assert.strictEqual(L.canTransition('proposed', 'rejected'), true);
  assert.strictEqual(L.canTransition('active', 'superseded'), true);
  assert.strictEqual(L.canTransition('active', 'proposed'), false);
  assert.strictEqual(L.canTransition('superseded', 'active'), false);
  console.log('✓ Profile lifecycle');

  const p = profile();

  for (const k of [
    'id','version','userId','type','subject',
    'value','provenance','lifecycle','createdAt','updatedAt'
  ]) assert.ok(k in p, `Missing field: ${k}`);

  assert.strictEqual(p.version, O.PROFILE_OBJECT_VERSION);
  assert.strictEqual(p.userId, 'profile-test-user');
  assert.strictEqual(p.type, 'attribute');
  assert.strictEqual(p.subject, 'creatorName');
  assert.strictEqual(p.value, 'Test Creator');
  assert.strictEqual(p.lifecycle, 'proposed');
  console.log('✓ Profile object contract');

  assert.throws(() => profile({subject: null}));
  assert.throws(() => profile({value: null}));
  assert.throws(() => profile({lifecycle: 'invalid'}));
  console.log('✓ Required-field failures');

  const admit = B.resolveProfileCandidate(null, p);
  assert.strictEqual(admit.success, true);
  assert.strictEqual(admit.decision, 'admit');
  assert.strictEqual(admit.profile.id, p.id);

  const same = B.resolveProfileCandidate(p, profile({id:'other'}));
  assert.strictEqual(same.success, true);
  assert.strictEqual(same.decision, 'idempotent');
  assert.strictEqual(same.idempotent, true);
  assert.strictEqual(same.profile.id, p.id);

  const conflict = B.resolveProfileCandidate(
    p, profile({value:'Different Creator'})
  );
  assert.strictEqual(conflict.success, false);
  assert.strictEqual(conflict.decision, 'conflict');

  const foreign = B.resolveProfileCandidate(
    p, profile({userId:'different-user'})
  );
  assert.strictEqual(foreign.success, false);
  assert.strictEqual(foreign.decision, 'ownership-conflict');

  const learning = B.resolveProfileCandidate(p, profile({
    provenance:{
      sourceType:'learning',
      sourceId:'learning-001',
      sourceVersion:'1.0'
    }
  }));
  assert.strictEqual(learning.success, true);
  assert.strictEqual(learning.decision, 'idempotent');
  assert.strictEqual(learning.profile.provenance.sourceType, 'user');

  console.log('✓ Profile boundary authority and ownership');

  const created = B.createProfile({
    userId: 'boundary-test-user',
    type: 'attribute',
    subject: 'niche',
    value: 'fitness',
    provenance: { sourceType: 'user', sourceId: 'msg-boundary', sourceVersion: '1.0' }
  });
  assert.strictEqual(created.success, true);
  assert.ok(created.profile.id);

  const duplicate = B.createProfile({
    userId: 'boundary-test-user',
    type: 'attribute',
    subject: 'niche',
    value: 'fitness',
    provenance: { sourceType: 'user', sourceId: 'msg-boundary', sourceVersion: '1.0' }
  });
  assert.strictEqual(duplicate.success, true);
  assert.strictEqual(duplicate.idempotent, true);

  const conflicting = B.createProfile({
    userId: 'boundary-test-user',
    type: 'attribute',
    subject: 'niche',
    value: 'different niche',
    provenance: { sourceType: 'user', sourceId: 'msg-conflict', sourceVersion: '1.0' }
  });
  assert.strictEqual(conflicting.success, false);
  assert.strictEqual(conflicting.conflict, true);

  const fetched = B.getProfile(created.profile.id, 'boundary-test-user');
  assert.strictEqual(fetched.success, true);
  assert.strictEqual(fetched.profile.value, 'fitness');

  const listed = B.getProfilesByUser('boundary-test-user');
  assert.strictEqual(listed.success, true);
  assert.strictEqual(listed.profiles.length, 1);

  const updated = B.updateProfile(
    { id: created.profile.id, value: 'fitness content' },
    'boundary-test-user'
  );
  assert.strictEqual(updated.success, true);
  assert.strictEqual(updated.profile.value, 'fitness content');

  const lifecycle = B.transitionProfileLifecycle(
    created.profile.id, 'active', 'boundary-test-user'
  );
  assert.strictEqual(lifecycle.success, true);
  assert.strictEqual(lifecycle.profile.lifecycle, 'active');

  const foreignRead = B.getProfile(created.profile.id, 'other-user');
  assert.strictEqual(foreignRead.success, false);
  assert.strictEqual(foreignRead.error, 'Profile ownership violation.');

  console.log('✓ Profile operational boundary');

  const saved = P.saveProfile(p);
  assert.strictEqual(saved.success, true);

  const got = P.getProfile(p.id);
  assert.ok(got);
  assert.strictEqual(got.id, p.id);
  assert.deepStrictEqual(got.provenance, p.provenance);

  const dup = P.saveProfile(p);
  assert.strictEqual(dup.success, true);
  assert.strictEqual(dup.idempotent, true);

  const owner = P.updateProfile(p.id, {userId:'different-user'});
  assert.strictEqual(owner.success, false);
  assert.strictEqual(P.getProfile(p.id).userId,
    'profile-test-user');

  console.log('✓ Profile persistence');

  const reg = R.registerProfile(p);
  assert.strictEqual(reg.registered, true);

  const rgot = R.getRegisteredProfile(
    p.id, 'profile-test-user'
  );
  assert.ok(rgot);
  assert.strictEqual(rgot.id, p.id);
  assert.deepStrictEqual(rgot.provenance, p.provenance);

  const rdup = R.registerProfile(
    profile({id:'registry-conflict', value:'Other'})
  );
  assert.strictEqual(rdup.registered, false);
  assert.strictEqual(rdup.conflict, true);

  console.log('✓ Profile registry');

  const active = L.transitionProfile(p, 'active');
  assert.strictEqual(active.success, true);
  assert.strictEqual(active.profile.lifecycle, 'active');

  const repeat = L.transitionProfile(active.profile, 'active');
  assert.strictEqual(repeat.success, true);
  assert.strictEqual(repeat.idempotent, true);

  const bad = L.transitionProfile(active.profile, 'proposed');
  assert.strictEqual(bad.success, false);

  const superseded = L.transitionProfile(active.profile, 'superseded');
  assert.strictEqual(superseded.success, true);
  assert.strictEqual(superseded.profile.lifecycle, 'superseded');

  const terminal = L.transitionProfile(superseded.profile, 'active');
  assert.strictEqual(terminal.success, false);

  console.log('✓ Profile lifecycle transitions');
  console.log('\n=== ALL PROFILE FOUNDATION TESTS PASSED ===\n');
}

runTests();
