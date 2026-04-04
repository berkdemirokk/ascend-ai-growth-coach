import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf-8');

function getOwnerProfileFieldBlock() {
  const match = rules.match(/function ownerProfileFields\(\)\s*\{\s*return \[(.*?)\];\s*\}/s);
  assert.ok(match, 'ownerProfileFields block should exist');
  return match[1];
}

test('rules keep premium and progression fields out of owner profile writes', () => {
  const ownerFields = getOwnerProfileFieldBlock();

  assert.ok(!ownerFields.includes("'isPremium'"));
  assert.ok(!ownerFields.includes("'level'"));
  assert.ok(!ownerFields.includes("'experience'"));
  assert.ok(!ownerFields.includes("'streak'"));
  assert.ok(!ownerFields.includes("'badges'"));
  assert.ok(!ownerFields.includes("'role'"));
  assert.ok(rules.includes('request.resource.data.diff(resource.data).affectedKeys().hasOnly(ownerProfileFields())'));
});

test('rules require immutable task provenance and server-set timestamps for owner-created tasks', () => {
  assert.ok(rules.includes("return ['id', 'title', 'description', 'completed', 'createdAt', 'completedAt', 'category', 'priority', 'reminderTime', 'source'];"));
  assert.ok(rules.includes("data.source in ['generated', 'custom', 'preview']"));
  assert.ok(rules.includes("data.source in ['generated', 'custom', 'migrated', 'preview']"));
  assert.ok(rules.includes("data.createdAt == request.time"));
  assert.ok(rules.includes('isValidTaskSourceTransition()'));
  assert.ok(rules.includes('isValidTaskCreatedAtTransition()'));
  assert.ok(rules.includes('isValidTaskCompletionTransition()'));
});

test('rules isolate trusted entitlements in a separate admin-managed collection', () => {
  assert.ok(rules.includes('match /userEntitlements/{userId}'));
  assert.ok(rules.includes('allow read: if isOwner(userId) || isAdmin();'));
  assert.ok(rules.includes('allow create, update: if isAdmin() && isValidEntitlements(request.resource.data);'));
});
