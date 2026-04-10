import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionSeedFromRemotePayload } from './sessionBootstrap';
import { PlannedMission, UserProfile, WeeklyPlanSnapshot } from '../types';

const profile: UserProfile = {
  name: 'Berk',
  selectedPath: 'general',
  goals: ['Rutin'],
  planTier: 'premium',
  level: 4,
  experience: 35,
  streak: 2,
  lastCompletedDayKey: '2026-04-09',
};

const weeklyPlanSnapshot: WeeklyPlanSnapshot = {
  weekKey: '2026-04-07',
  direction: 'stretch',
  title: '7 gunluk ileri rota',
  summary: 'Bu hafta ritmi biraz yukseltiyorsun.',
  createdAt: 123456,
  days: [
    {
      day: 1,
      title: 'Cikiyi buyut',
      focus: 'Bugun standardin biraz ustune cik.',
      checkpoint: 'Neyi buyutebildin?',
      branchFocus: 'stretch',
    },
  ],
};

const plannedMissions: PlannedMission[] = [
  {
    dayKey: '2026-04-11',
    lessonId: 'gen-11',
    unitTitle: 'Ritim Kur',
    title: 'Cikiyi buyut',
    teaching: 'Siniri biraz ileri tasimayi dene.',
    missionKind: 'lesson',
    adaptationMode: 'stretch',
    planFocus: 'stretch',
  },
];

test('createSessionSeedFromRemotePayload preserves remote weekly plan, queue, and revision', () => {
  const seed = createSessionSeedFromRemotePayload({
    accountId: 'account-1',
    accountToken: 'token-1',
    accountEmail: 'berk@example.com',
    profile,
    tasks: [],
    weeklyPlanSnapshot,
    plannedMissions,
    revision: 7,
  });

  assert.equal(seed.accountId, 'account-1');
  assert.equal(seed.accountToken, 'token-1');
  assert.equal(seed.accountEmail, 'berk@example.com');
  assert.equal(seed.sessionRevision, 7);
  assert.equal(seed.weeklyPlanSnapshot?.direction, 'stretch');
  assert.equal(seed.plannedMissions[0]?.lessonId, 'gen-11');
});
