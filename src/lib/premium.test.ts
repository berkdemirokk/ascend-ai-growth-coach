import test from 'node:test';
import assert from 'node:assert/strict';
import { DailyTask, UserProfile } from '../types';
import { ensureDailyMission } from './missionEngine';
import { getPreviousDayKey, getDayKey } from './day';
import { getWeeklyReviewSummary } from './weeklyReview';

const createProfile = (planTier: UserProfile['planTier']): UserProfile => ({
  name: 'Berk',
  selectedPath: 'fitness',
  goals: [],
  planTier,
  level: 1,
  experience: 0,
  streak: 0,
  lastCompletedDayKey: null,
});

const createTask = (reflection: string): DailyTask => ({
  id: `task-${Math.random().toString(36).slice(2, 8)}`,
  lessonId: 'fit-history',
  unitId: 'fitness-unit-1',
  unitTitle: 'Hareket Temeli',
  unitOrder: 1,
  missionKind: 'lesson',
  adaptationMode: 'standard',
  planFocus: 'standard',
  title: 'Mikro hareket baslangici',
  description: 'Test',
  teaching: 'Test teaching',
  reflectionPrompt: 'Ne ogrendin?',
  completed: true,
  category: 'fitness',
  createdAt: Date.now(),
  completedAt: Date.now(),
  rewardGranted: true,
  dayKey: getPreviousDayKey(getDayKey()),
  reflection,
  source: 'curriculum',
});

test('free plan keeps mission adaptation on standard even when reflections ask for support', () => {
  const profile = createProfile('free');
  const { todayMission } = ensureDailyMission(profile, [createTask('Bugun cok zorlandim ve erteledim.')]);

  assert.equal(todayMission.adaptationMode, 'standard');
});

test('premium weekly review summarizes recent progress', () => {
  const profile = createProfile('premium');
  const summary = getWeeklyReviewSummary(profile, [
    createTask('iyi gitti'),
    createTask('yine iyiydi'),
    createTask('zor ama bitti'),
  ]);

  assert.equal(summary.completedThisWeek, 3);
  assert.equal(summary.consistencyDays, 1);
  assert.ok(summary.memorySummary.includes('3 görev'));
});

test('free plan keeps standard curriculum sequencing even when premium branch would prefer support', () => {
  const profile = createProfile('free');
  const tasks: DailyTask[] = [
    {
      ...createTask('tamamlandi'),
      lessonId: 'gen-1',
      unitId: 'general-unit-1',
      unitTitle: 'Gunluk Temel',
      unitOrder: 1,
      category: 'general',
    },
    {
      ...createTask('tamamlandi'),
      lessonId: 'gen-2',
      unitId: 'general-unit-1',
      unitTitle: 'Gunluk Temel',
      unitOrder: 1,
      category: 'general',
    },
    {
      ...createTask('tamamlandi'),
      lessonId: 'gen-3',
      unitId: 'general-unit-1',
      unitTitle: 'Gunluk Temel',
      unitOrder: 1,
      category: 'general',
    },
    {
      ...createTask('tamamlandi'),
      lessonId: 'gen-4',
      unitId: 'general-unit-1',
      unitTitle: 'Gunluk Temel',
      unitOrder: 1,
      category: 'general',
    },
    {
      ...createTask('tamamlandi'),
      lessonId: 'gen-5',
      unitId: 'general-unit-1',
      unitTitle: 'Gunluk Temel',
      unitOrder: 1,
      category: 'general',
    },
    {
      ...createTask('tamamlandi'),
      lessonId: 'gen-6',
      unitId: 'general-unit-1',
      unitTitle: 'Gunluk Temel',
      unitOrder: 1,
      category: 'general',
    },
    {
      ...createTask('tamamlandi'),
      lessonId: 'gen-7',
      unitId: 'general-unit-1',
      unitTitle: 'Gunluk Temel',
      unitOrder: 1,
      category: 'general',
    },
    {
      ...createTask('unit review'),
      lessonId: 'general-unit-1-checkpoint',
      unitId: 'general-unit-1',
      unitTitle: 'Gunluk Temel',
      unitOrder: 1,
      missionKind: 'checkpoint',
      category: 'general',
    },
    {
      ...createTask('tamam'),
      lessonId: 'gen-8',
      unitId: 'general-unit-2',
      unitTitle: 'Sistem Kur',
      unitOrder: 2,
      category: 'general',
    },
    {
      ...createTask('tamam'),
      lessonId: 'gen-9',
      unitId: 'general-unit-2',
      unitTitle: 'Sistem Kur',
      unitOrder: 2,
      category: 'general',
    },
    {
      ...createTask('zorlandim ve dagildim'),
      lessonId: 'gen-history',
      unitId: 'general-unit-2',
      unitTitle: 'Sistem Kur',
      unitOrder: 2,
      category: 'general',
    },
  ];

  const { todayMission } = ensureDailyMission({ ...profile, selectedPath: 'general', level: 4 }, tasks);

  assert.equal(todayMission.lessonId, 'gen-10');
  assert.equal(todayMission.planFocus, 'standard');
});
