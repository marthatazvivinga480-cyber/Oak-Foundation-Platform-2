import test from 'node:test';
import assert from 'node:assert/strict';
import { coordinatorAccess } from '../src/lib/coordinator-access';
test('Supabase access cannot be granted by a self-selected role', () => {
  for (const role of [null, 'Partner', 'OAK Staff', 'Coordination Team', 'Presenter', 'Observer']) {
    assert.equal(coordinatorAccess(true, false, role), false);
  }
});
test('approved staff have coordinator access independently of registration', () => {
  assert.equal(coordinatorAccess(true, true, null), true);
  assert.equal(coordinatorAccess(true, true, 'Partner'), true);
});
test('local demo retains role-based coordinator access', () => {
  assert.equal(coordinatorAccess(false, false, 'Coordination Team'), true);
  assert.equal(coordinatorAccess(false, false, 'Partner'), false);
  assert.equal(coordinatorAccess(false, false, null), false);
});
