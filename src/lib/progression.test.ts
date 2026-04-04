import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveUserProfile, PROGRESSION_POLICY } from './progression';
import { DailyTask, StoredUserProfile, TrustedEntitlements } from '../types';

const baseProfile: StoredUserProfile = {
  name: 'Berk',
  selectedPath: 'career',
  goals: [],
  notificationsEnabled: true,
  reminderTime: '09:00',
  theme: 'light',
  currentLevel: 'intermediate',
  intensity: 'regular',
  dailyTime: '30m',
};

const premiumEntitlements: TrustedEntitlements = {
  isPremium: true,
};

const defaultEntitlements: TrustedEntitlements = {
  isPremium: false,
};

test('deriveUserProfile counts a task only once when completedAt is already set', () => {
  const tasks: DailyTask[] = [
    {
      id: 'task-1',
      title: 'İlk görev',
      description: '',
      category: 'career',
      priority: 'high',
      completed: false,
      createdAt: '2026-04-01T07:00:00.000Z',
      completedAt: '2026-04-01T08:00:00.000Z',
      source: 'generated',
    },
  ];

  const profile = deriveUserProfile('user-1', baseProfile, tasks, defaultEntitlements);

  assert.equal(profile.level, 1);
  assert.equal(profile.experience, 20);
  assert.equal(profile.badges.length, 1);
  assert.equal(profile.badges[0].id, 'first_task');
});

test('deriveUserProfile calculates streak and level from unique completions', () => {
  const tasks: DailyTask[] = [
    {
      id: 'task-1',
      title: 'Görev 1',
      description: '',
      category: 'career',
      priority: 'high',
      completed: true,
      createdAt: '2026-04-01T07:00:00.000Z',
      completedAt: '2026-04-01T09:00:00.000Z',
      source: 'generated',
    },
    {
      id: 'task-2',
      title: 'Görev 2',
      description: '',
      category: 'career',
      priority: 'high',
      completed: true,
      createdAt: '2026-04-02T07:00:00.000Z',
      completedAt: '2026-04-02T09:00:00.000Z',
      source: 'generated',
    },
    {
      id: 'task-3',
      title: 'Görev 3',
      description: '',
      category: 'career',
      priority: 'high',
      completed: true,
      createdAt: '2026-04-03T07:00:00.000Z',
      completedAt: '2026-04-03T09:00:00.000Z',
      source: 'generated',
    },
    {
      id: 'task-4',
      title: 'Görev 4',
      description: '',
      category: 'career',
      priority: 'high',
      completed: true,
      createdAt: '2026-04-04T07:00:00.000Z',
      completedAt: '2026-04-04T09:00:00.000Z',
      source: 'generated',
    },
    {
      id: 'task-5',
      title: 'Görev 5',
      description: '',
      category: 'career',
      priority: 'high',
      completed: true,
      createdAt: '2026-04-05T07:00:00.000Z',
      completedAt: '2026-04-05T09:00:00.000Z',
      source: 'generated',
    },
  ];

  const profile = deriveUserProfile('user-1', baseProfile, tasks, defaultEntitlements);

  assert.equal(profile.level, 2);
  assert.equal(profile.experience, 0);
  assert.equal(profile.streak, 5);
  assert.deepEqual(
    profile.badges.map((badge) => badge.id),
    ['first_task', 'completed_5', 'level_2', 'streak_3'],
  );
});

test('deriveUserProfile ignores custom-task completions for progression', () => {
  const tasks: DailyTask[] = [
    {
      id: 'custom-1',
      title: 'Kendi görevim',
      description: '',
      category: 'general',
      priority: 'medium',
      completed: true,
      createdAt: '2026-04-01T07:00:00.000Z',
      completedAt: '2026-04-01T08:00:00.000Z',
      source: 'custom',
    },
    {
      id: 'generated-1',
      title: 'Plan görevi',
      description: '',
      category: 'career',
      priority: 'high',
      completed: true,
      createdAt: '2026-04-02T07:00:00.000Z',
      completedAt: '2026-04-02T08:00:00.000Z',
      source: 'generated',
    },
  ];

  const profile = deriveUserProfile('user-1', baseProfile, tasks, defaultEntitlements);

  assert.equal(profile.experience, PROGRESSION_POLICY.xpPerQualifiedCompletion);
  assert.equal(profile.level, 1);
  assert.deepEqual(profile.badges.map((badge) => badge.id), ['first_task']);
});

test('deriveUserProfile caps qualified completions per day and deduplicates same-title legacy tasks', () => {
  const tasks: DailyTask[] = [
    {
      id: 'generated-1',
      title: 'Odak bloğu',
      description: '',
      category: 'career',
      priority: 'high',
      completed: true,
      createdAt: '2026-04-10T07:00:00.000Z',
      completedAt: '2026-04-10T08:00:00.000Z',
      source: 'generated',
    },
    {
      id: 'generated-2',
      title: 'Odak bloğu',
      description: '',
      category: 'career',
      priority: 'high',
      completed: true,
      createdAt: '2026-04-10T07:30:00.000Z',
      completedAt: '2026-04-10T08:30:00.000Z',
      source: 'generated',
    },
    {
      id: 'generated-3',
      title: 'İnce iş',
      description: '',
      category: 'career',
      priority: 'high',
      completed: true,
      createdAt: '2026-04-10T09:00:00.000Z',
      completedAt: '2026-04-10T10:00:00.000Z',
      source: 'generated',
    },
    {
      id: 'generated-4',
      title: 'Takip',
      description: '',
      category: 'career',
      priority: 'high',
      completed: true,
      createdAt: '2026-04-10T10:00:00.000Z',
      completedAt: '2026-04-10T11:00:00.000Z',
      source: 'generated',
    },
    {
      id: 'generated-5',
      title: 'Ek görev',
      description: '',
      category: 'career',
      priority: 'high',
      completed: true,
      createdAt: '2026-04-10T11:00:00.000Z',
      completedAt: '2026-04-10T12:00:00.000Z',
      source: 'generated',
    },
    {
      id: 'legacy-1',
      title: 'Eski plan',
      description: '',
      category: 'career',
      priority: 'high',
      completed: true,
      completedAt: '2026-04-11T09:00:00.000Z',
      source: 'migrated',
    },
  ];

  const profile = deriveUserProfile('user-1', baseProfile, tasks, defaultEntitlements);

  assert.equal(
    profile.experience,
    PROGRESSION_POLICY.xpPerQualifiedCompletion * (PROGRESSION_POLICY.dailyQualifiedCompletionCap + 1),
  );
  assert.equal(profile.streak, 2);
});

test('deriveUserProfile uses trusted entitlements instead of polluted profile fields', () => {
  const pollutedProfile = {
    ...baseProfile,
    isPremium: true,
  } as StoredUserProfile;

  const profile = deriveUserProfile('user-1', pollutedProfile, [], defaultEntitlements);
  const premiumProfile = deriveUserProfile('user-1', baseProfile, [], premiumEntitlements);

  assert.equal(profile.isPremium, false);
  assert.equal(premiumProfile.isPremium, true);
});
