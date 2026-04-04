import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { deriveUserProfile } from '../src/lib/progression';
import { createStoredProfile } from '../src/lib/profileStorage';
import { type DailyTask } from '../src/types';

const projectId = 'demo-ascend-growth';
const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf-8');

let testEnvironment: RulesTestEnvironment;

async function seedEntitlement(userId: string, isPremium: boolean) {
  const adminContext = testEnvironment.authenticatedContext('admin-user', {
    email: 'berkkdemirok@gmail.com',
    email_verified: true,
  });

  await adminContext.firestore().doc(`userEntitlements/${userId}`).set({
    isPremium,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

test.before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: { rules },
  });
});

test.after(async () => {
  await testEnvironment.cleanup();
});

test.afterEach(async () => {
  await testEnvironment.clearFirestore();
});

test('owner profile writes allow safe fields but reject premium/progression fields', async () => {
  const ownerDb = testEnvironment.authenticatedContext('user-1').firestore();

  await assertSucceeds(
    ownerDb.doc('users/user-1').set({
      name: 'Berk',
      notificationsEnabled: true,
      selectedPath: 'career',
      currentLevel: 'beginner',
      intensity: 'regular',
      dailyTime: '30m',
    }),
  );

  await assertFails(
    ownerDb.doc('users/user-1').update({
      isPremium: true,
    }),
  );

  await assertFails(
    ownerDb.doc('users/user-1').update({
      level: 9,
    }),
  );
});

test('task rules enforce immutable provenance and one-way completion timestamp semantics', async () => {
  const ownerDb = testEnvironment.authenticatedContext('user-2').firestore();
  const userRef = ownerDb.doc('users/user-2');
  const taskRef = ownerDb.doc('users/user-2/tasks/task-1');

  await assertSucceeds(
    userRef.set({
      name: 'Berk',
      notificationsEnabled: true,
    }),
  );

  await assertSucceeds(
    taskRef.set({
      id: 'task-1',
      title: 'Preview task',
      description: '',
      completed: false,
      category: 'career',
      priority: 'medium',
      source: 'preview',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    }),
  );

  await assertFails(
    taskRef.update({
      source: 'generated',
    }),
  );

  await assertSucceeds(
    taskRef.update({
      completed: true,
      completedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }),
  );

  await assertFails(
    taskRef.update({
      completed: true,
      completedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }),
  );
});

test('legacy polluted profile fields do not reactivate premium behavior when trusted entitlements stay false', async () => {
  const ownerDb = testEnvironment.authenticatedContext('user-3').firestore();

  await assertSucceeds(
    ownerDb.doc('users/user-3').set({
      name: 'Berk',
      notificationsEnabled: true,
    }),
  );

  const pollutedProfile = createStoredProfile({
    name: 'Berk',
    notificationsEnabled: true,
    selectedPath: 'general',
    isPremium: true,
  } as unknown as Parameters<typeof createStoredProfile>[0]);

  const profile = deriveUserProfile('user-3', pollutedProfile, [], { isPremium: false });
  assert.equal(profile.isPremium, false);

  await seedEntitlement('user-3', true);
  const entitlementSnapshot = await ownerDb.doc('userEntitlements/user-3').get();
  assert.equal(entitlementSnapshot.data()?.isPremium, true);
});

test('custom and preview tasks do not qualify for verified progression the way generated tasks do', () => {
  const storedProfile = createStoredProfile({
    name: 'Berk',
    notificationsEnabled: true,
    selectedPath: 'career',
  });

  const tasks: DailyTask[] = [
    {
      id: 'custom-1',
      title: 'Custom task',
      description: '',
      completed: true,
      category: 'career',
      priority: 'medium',
      source: 'custom',
      createdAt: '2026-04-01T08:00:00.000Z',
      completedAt: '2026-04-01T09:00:00.000Z',
    },
    {
      id: 'preview-1',
      title: 'Preview task',
      description: '',
      completed: true,
      category: 'career',
      priority: 'medium',
      source: 'preview',
      createdAt: '2026-04-01T08:30:00.000Z',
      completedAt: '2026-04-01T09:30:00.000Z',
    },
    {
      id: 'generated-1',
      title: 'Generated task',
      description: '',
      completed: true,
      category: 'career',
      priority: 'medium',
      source: 'generated',
      createdAt: '2026-04-01T07:30:00.000Z',
      completedAt: '2026-04-01T10:00:00.000Z',
    },
  ];

  const profile = deriveUserProfile('user-4', storedProfile, tasks, { isPremium: false });

  assert.equal(profile.level, 1);
  assert.equal(profile.experience, 20);
  assert.equal(profile.badges.some((badge) => badge.id === 'first_task'), true);
});
