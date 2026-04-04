import test from 'node:test';
import assert from 'node:assert/strict';
import { createStoredProfile, sanitizeOwnerProfileUpdates } from './profileStorage';

test('createStoredProfile ignores polluted protected business fields from legacy input', () => {
  const profile = createStoredProfile({
    name: 'Berk',
    notificationsEnabled: true,
    reminderTime: '09:00',
    theme: 'light',
    dailyTime: '30m',
    selectedPath: 'career',
    goals: [],
    analysis: 'hazır',
    currentLevel: 'intermediate',
    intensity: 'regular',
    isPremium: true,
    level: 99,
    experience: 999,
  } as never);

  assert.equal('isPremium' in profile, false);
  assert.equal('level' in profile, false);
  assert.equal(profile.name, 'Berk');
});

test('sanitizeOwnerProfileUpdates strips protected business fields from profile writes', () => {
  const sanitized = sanitizeOwnerProfileUpdates({
    theme: 'dark',
    notificationsEnabled: false,
    isPremium: true,
    level: 5,
    badges: [],
  } as never);

  assert.deepEqual(sanitized, {
    theme: 'dark',
    notificationsEnabled: false,
  });
});
