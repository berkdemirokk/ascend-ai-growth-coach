import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlannedMissionQueue, ensureDailyMission, getTomorrowMissionPreview, getUpcomingMissionPreview } from './missionEngine';
import { getDayKey, getPreviousDayKey } from './day';
import { DailyTask, UserProfile } from '../types';
import { getJourneySummary } from './journey';
import { createWeeklyPlanSnapshot } from './weeklyPlan';

const createProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  name: 'Berk',
  selectedPath: 'general',
  goals: ['growth'],
  planTier: 'premium',
  level: 1,
  experience: 0,
  streak: 0,
  lastCompletedDayKey: null,
  ...overrides,
});

const createCurriculumTask = (overrides: Partial<DailyTask>): DailyTask => ({
  id: overrides.id ?? `task-${Math.random().toString(36).slice(2, 8)}`,
  lessonId: overrides.lessonId ?? 'gen-1',
  unitId: overrides.unitId ?? 'general-unit-1',
  unitTitle: overrides.unitTitle ?? 'Gunluk Temel',
  unitOrder: overrides.unitOrder ?? 1,
  missionKind: overrides.missionKind ?? 'lesson',
  adaptationMode: overrides.adaptationMode ?? 'standard',
  planFocus: overrides.planFocus ?? 'standard',
  title: overrides.title ?? 'Test Gorevi',
  description: overrides.description ?? 'Test aciklamasi',
  teaching: overrides.teaching ?? 'Test teaching',
  reflectionPrompt: overrides.reflectionPrompt ?? 'Ne ogrendin?',
  completed: overrides.completed ?? false,
  category: overrides.category ?? 'general',
  createdAt: overrides.createdAt ?? Date.now(),
  completedAt: overrides.completedAt ?? null,
  rewardGranted: overrides.rewardGranted ?? Boolean(overrides.completed),
  dayKey: overrides.dayKey ?? getDayKey(),
  reflection: overrides.reflection ?? null,
  source: overrides.source ?? 'curriculum',
});

const createCompletedUnitTasks = (lessonIds: string[], unitId: string, unitTitle: string, dayKey: string): DailyTask[] =>
  lessonIds.map((lessonId, index) =>
    createCurriculumTask({
      id: `task-${lessonId}`,
      lessonId,
      title: lessonId,
      unitId,
      unitTitle,
      completed: true,
      completedAt: Date.now() - (lessonIds.length - index) * 1000,
      rewardGranted: true,
      dayKey,
      reflection: 'iyi gitti',
    }),
  );

test('ensureDailyMission produces unit checkpoint before next unit lesson', () => {
  const profile = createProfile({ level: 3, selectedPath: 'general' });
  const previousDay = getPreviousDayKey(getDayKey());
  const tasks = createCompletedUnitTasks(
    ['gen-1', 'gen-2', 'gen-3', 'gen-4', 'gen-5', 'gen-6', 'gen-7'],
    'general-unit-1',
    'Gunluk Temel',
    previousDay,
  );

  const { todayMission } = ensureDailyMission(profile, tasks);

  assert.equal(todayMission.missionKind, 'checkpoint');
  assert.equal(todayMission.lessonId, 'general-unit-1-checkpoint');
  assert.equal(todayMission.unitTitle, 'Gunluk Temel');
});

test('support reflections produce easier lesson variants', () => {
  const profile = createProfile({ selectedPath: 'fitness', level: 1 });
  const tasks: DailyTask[] = [
    createCurriculumTask({
      lessonId: 'fit-history',
      unitId: 'fitness-unit-1',
      unitTitle: 'Hareket Temeli',
      category: 'fitness',
      dayKey: getPreviousDayKey(getDayKey()),
      completed: true,
      completedAt: Date.now() - 1000,
      rewardGranted: true,
      reflection: 'Bugun zorlandim ve biraz erteledim.',
    }),
  ];

  const { todayMission } = ensureDailyMission(profile, tasks);

  assert.equal(todayMission.missionKind, 'lesson');
  assert.equal(todayMission.adaptationMode, 'support');
  assert.match(todayMission.description, /5 dakikalik tempolu yuruyus/i);
});

test('stretch reflections produce harder lesson variants and journey exposes current tempo', () => {
  const profile = createProfile({ selectedPath: 'general', level: 1 });
  const tasks: DailyTask[] = [
    createCurriculumTask({
      lessonId: 'gen-history',
      unitId: 'general-unit-1',
      unitTitle: 'Gunluk Temel',
      dayKey: getPreviousDayKey(getDayKey()),
      completed: true,
      completedAt: Date.now() - 1000,
      rewardGranted: true,
      reflection: 'Bu cok kolaydi, hazirim ve gayet rahatti.',
    }),
  ];

  const { tasks: nextTasks, todayMission } = ensureDailyMission(profile, tasks);
  const summary = getJourneySummary(profile, nextTasks);

  assert.equal(todayMission.adaptationMode, 'stretch');
  assert.match(todayMission.description, /25 dakikalik odak blogunda tamamla/i);
  assert.equal(summary.units[0]?.recentAdaptationMode, 'stretch');
});

test('journey marks unit as review_ready until checkpoint is completed', () => {
  const profile = createProfile({ level: 3, selectedPath: 'general' });
  const previousDay = getPreviousDayKey(getDayKey());
  const tasks = createCompletedUnitTasks(
    ['gen-1', 'gen-2', 'gen-3', 'gen-4', 'gen-5', 'gen-6', 'gen-7'],
    'general-unit-1',
    'Gunluk Temel',
    previousDay,
  );

  const summary = getJourneySummary(profile, tasks);
  const tomorrow = getTomorrowMissionPreview(profile, tasks);

  assert.equal(summary.units[0]?.state, 'review_ready');
  assert.equal(summary.pendingCheckpointCount, 1);
  assert.equal(tomorrow.missionKind, 'checkpoint');
});

test('premium support plan can pull a support-tagged lesson slightly forward inside the unit', () => {
  const profile = createProfile({ selectedPath: 'general', level: 4, planTier: 'premium' });
  const tasks = createCompletedUnitTasks(
    ['gen-1', 'gen-2', 'gen-3', 'gen-4', 'gen-5', 'gen-6', 'gen-7', 'gen-8', 'gen-9'],
    'general-unit-2',
    'Sistem Kur',
    getPreviousDayKey(getDayKey()),
  ).concat([
    createCurriculumTask({
      id: 'unit-1-checkpoint',
      lessonId: 'general-unit-1-checkpoint',
      unitId: 'general-unit-1',
      unitTitle: 'Gunluk Temel',
      unitOrder: 1,
      missionKind: 'checkpoint',
      dayKey: getPreviousDayKey(getDayKey()),
      completed: true,
      completedAt: Date.now() - 120,
      rewardGranted: true,
      reflection: 'Unit review tamamlandi.',
    }),
    createCurriculumTask({
      id: 'support-history-1',
      lessonId: 'gen-history-1',
      unitId: 'general-unit-2',
      unitTitle: 'Sistem Kur',
      unitOrder: 2,
      dayKey: getPreviousDayKey(getDayKey()),
      completed: true,
      completedAt: Date.now() - 100,
      rewardGranted: true,
      reflection: 'Son iki gun zorlandim ve biraz dagildim.',
    }),
    createCurriculumTask({
      id: 'support-history-2',
      lessonId: 'gen-history-2',
      unitId: 'general-unit-2',
      unitTitle: 'Sistem Kur',
      unitOrder: 2,
      dayKey: getPreviousDayKey(getDayKey()),
      completed: true,
      completedAt: Date.now() - 90,
      rewardGranted: true,
      reflection: 'Bugun de biraz erteledim ve zor geldi.',
    }),
    createCurriculumTask({
      id: 'support-history-3',
      lessonId: 'gen-history-3',
      unitId: 'general-unit-2',
      unitTitle: 'Sistem Kur',
      unitOrder: 2,
      dayKey: getPreviousDayKey(getDayKey()),
      completed: true,
      completedAt: Date.now() - 80,
      rewardGranted: true,
      reflection: 'Ritim aksatti, yine zorlandim.',
    }),
  ]);

  const { todayMission } = ensureDailyMission(profile, tasks);

  assert.equal(todayMission.lessonId, 'gen-11');
  assert.equal(todayMission.planFocus, 'support');
});

test('premium stretch plan can pull a stretch-tagged lesson slightly forward inside the unit', () => {
  const profile = createProfile({ selectedPath: 'general', level: 4, planTier: 'premium' });
  const tasks = createCompletedUnitTasks(
    ['gen-1', 'gen-2', 'gen-3', 'gen-4', 'gen-5', 'gen-6', 'gen-7', 'gen-8', 'gen-9'],
    'general-unit-2',
    'Sistem Kur',
    getPreviousDayKey(getDayKey()),
  ).concat([
    createCurriculumTask({
      id: 'unit-1-checkpoint',
      lessonId: 'general-unit-1-checkpoint',
      unitId: 'general-unit-1',
      unitTitle: 'Gunluk Temel',
      unitOrder: 1,
      missionKind: 'checkpoint',
      dayKey: getPreviousDayKey(getDayKey()),
      completed: true,
      completedAt: Date.now() - 120,
      rewardGranted: true,
      reflection: 'Unit review tamamlandi.',
    }),
    createCurriculumTask({
      id: 'stretch-history-1',
      lessonId: 'gen-history-1',
      unitId: 'general-unit-2',
      unitTitle: 'Sistem Kur',
      unitOrder: 2,
      dayKey: getPreviousDayKey(getDayKey()),
      completed: true,
      completedAt: Date.now() - 100,
      rewardGranted: true,
      reflection: 'Cok kolay geldi, daha fazlasina hazirim ve ritim iyi.',
    }),
    createCurriculumTask({
      id: 'stretch-history-2',
      lessonId: 'gen-history-2',
      unitId: 'general-unit-2',
      unitTitle: 'Sistem Kur',
      unitOrder: 2,
      dayKey: getPreviousDayKey(getDayKey()),
      completed: true,
      completedAt: Date.now() - 90,
      rewardGranted: true,
      reflection: 'Bugun da rahatti, netti ve hazirim.',
    }),
    createCurriculumTask({
      id: 'stretch-history-3',
      lessonId: 'gen-history-3',
      unitId: 'general-unit-2',
      unitTitle: 'Sistem Kur',
      unitOrder: 2,
      dayKey: getPreviousDayKey(getDayKey()),
      completed: true,
      completedAt: Date.now() - 80,
      rewardGranted: true,
      reflection: 'Iyi gitti, biraz daha yuklenebilirim.',
    }),
  ]);

  const { todayMission } = ensureDailyMission(profile, tasks);

  assert.equal(todayMission.lessonId, 'gen-12');
  assert.equal(todayMission.planFocus, 'stretch');
});

test('premium upcoming preview returns the next 3 routed missions', () => {
  const profile = createProfile({ selectedPath: 'general', level: 4, planTier: 'premium' });
  const tasks = createCompletedUnitTasks(
    ['gen-1', 'gen-2', 'gen-3', 'gen-4', 'gen-5', 'gen-6', 'gen-7', 'gen-8', 'gen-9'],
    'general-unit-2',
    'Sistem Kur',
    getPreviousDayKey(getDayKey()),
  ).concat([
    createCurriculumTask({
      id: 'unit-1-checkpoint',
      lessonId: 'general-unit-1-checkpoint',
      unitId: 'general-unit-1',
      unitTitle: 'Gunluk Temel',
      unitOrder: 1,
      missionKind: 'checkpoint',
      dayKey: getPreviousDayKey(getDayKey()),
      completed: true,
      completedAt: Date.now() - 120,
      rewardGranted: true,
      reflection: 'Unit review tamamlandi.',
    }),
    createCurriculumTask({
      id: 'stretch-history-1',
      lessonId: 'gen-history-1',
      unitId: 'general-unit-2',
      unitTitle: 'Sistem Kur',
      unitOrder: 2,
      dayKey: getPreviousDayKey(getDayKey()),
      completed: true,
      completedAt: Date.now() - 100,
      rewardGranted: true,
      reflection: 'Cok kolay geldi, daha fazlasina hazirim ve ritim iyi.',
    }),
    createCurriculumTask({
      id: 'stretch-history-2',
      lessonId: 'gen-history-2',
      unitId: 'general-unit-2',
      unitTitle: 'Sistem Kur',
      unitOrder: 2,
      dayKey: getPreviousDayKey(getDayKey()),
      completed: true,
      completedAt: Date.now() - 90,
      rewardGranted: true,
      reflection: 'Bugun da rahatti, netti ve hazirim.',
    }),
    createCurriculumTask({
      id: 'stretch-history-3',
      lessonId: 'gen-history-3',
      unitId: 'general-unit-2',
      unitTitle: 'Sistem Kur',
      unitOrder: 2,
      dayKey: getPreviousDayKey(getDayKey()),
      completed: true,
      completedAt: Date.now() - 80,
      rewardGranted: true,
      reflection: 'Iyi gitti, biraz daha yuklenebilirim.',
    }),
  ]);

  const preview = getUpcomingMissionPreview(profile, tasks);

  assert.equal(preview.length, 3);
  assert.equal(preview[0]?.planFocus, 'stretch');
  assert.equal(preview[0]?.title, 'Birakma tetikleyicisi');
});

test('planned mission queue can seed a concrete mission for the scheduled day', () => {
  const profile = createProfile({ selectedPath: 'general', level: 4, planTier: 'premium' });
  const tasks = createCompletedUnitTasks(
    ['gen-1', 'gen-2', 'gen-3', 'gen-4', 'gen-5', 'gen-6', 'gen-7', 'gen-8', 'gen-9'],
    'general-unit-2',
    'Sistem Kur',
    getPreviousDayKey(getDayKey()),
  );
  const snapshot = createWeeklyPlanSnapshot(profile, tasks);
  const tomorrowQueue = buildPlannedMissionQueue(profile, tasks, snapshot, 3);
  const todayQueue = tomorrowQueue.map((mission, index) => ({
    ...mission,
    dayKey: index === 0 ? getDayKey() : mission.dayKey,
  }));

  const { todayMission } = ensureDailyMission(profile, tasks, snapshot, todayQueue);

  assert.equal(todayMission.lessonId, todayQueue[0]?.lessonId);
  assert.equal(todayMission.title, todayQueue[0]?.title);
  assert.equal(todayMission.planFocus, todayQueue[0]?.planFocus);
});
