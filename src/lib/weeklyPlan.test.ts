import test from 'node:test';
import assert from 'node:assert/strict';
import { DailyTask, UserProfile } from '../types';
import { createWeeklyPlanSnapshot, ensureWeeklyPlanSnapshot, getCurrentWeeklyPlanDay, getWeeklyPlanPreview } from './weeklyPlan';

const createProfile = (): UserProfile => ({
  name: 'Berk',
  selectedPath: 'general',
  goals: [],
  planTier: 'premium',
  level: 4,
  experience: 40,
  streak: 3,
  lastCompletedDayKey: null,
});

const createTask = (dayKey: string, reflection: string): DailyTask => ({
  id: `${dayKey}-${Math.random().toString(36).slice(2, 8)}`,
  lessonId: 'gen-1',
  unitId: 'general-unit-1',
  unitTitle: 'Gunluk Temel',
  unitOrder: 1,
  missionKind: 'lesson',
  adaptationMode: 'standard',
  planFocus: 'standard',
  title: 'Tek odak',
  description: 'Test',
  teaching: 'Test teaching',
  reflectionPrompt: 'Test',
  completed: true,
  category: 'general',
  createdAt: Date.now(),
  completedAt: Date.now(),
  rewardGranted: true,
  dayKey,
  reflection,
  source: 'curriculum',
});

test('weekly plan preview returns support route when recent reflections struggle', () => {
  const plan = getWeeklyPlanPreview(createProfile(), [
    createTask('2026-04-01', 'Bugun zorlandim ve dagildim.'),
    createTask('2026-04-02', 'Biraz erteledim ve ritim aksatti.'),
    createTask('2026-04-03', 'Yine zor geldi ama tamamladim.'),
  ]);

  assert.equal(plan.direction, 'support');
  assert.equal(plan.days.length, 7);
  assert.equal(plan.days[0]?.title, 'Baslangici kucult');
});

test('weekly plan preview returns stretch route when momentum is strong', () => {
  const plan = getWeeklyPlanPreview(createProfile(), [
    createTask('2026-04-01', 'Cok kolaydi ve hazirim.'),
    createTask('2026-04-02', 'Iyi gitti, rahat ve netti.'),
    createTask('2026-04-03', 'Rahatti, biraz daha fazlasina hazirim.'),
    createTask('2026-04-04', 'Kolaydi ve duzenli ilerledi.'),
    createTask('2026-04-05', 'Hazirim, gayet iyi gitti.'),
  ]);

  assert.equal(plan.direction, 'stretch');
  assert.equal(plan.days.length, 7);
  assert.equal(plan.days[0]?.title, 'Cikiyi buyut');
});

test('current weekly plan day keeps support branch active across support route', () => {
  const currentDay = getCurrentWeeklyPlanDay(createProfile(), [
    createTask('2026-04-01', 'Bugun zorlandim ve dagildim.'),
    createTask('2026-04-02', 'Biraz erteledim ve ritim aksatti.'),
    createTask('2026-04-03', 'Yine zor geldi ama tamamladim.'),
  ]);

  assert.equal(currentDay.branchFocus, 'support');
});

test('current weekly plan day keeps stretch branch active across stretch route', () => {
  const currentDay = getCurrentWeeklyPlanDay(createProfile(), [
    createTask('2026-04-01', 'Cok kolaydi ve hazirim.'),
    createTask('2026-04-02', 'Iyi gitti, rahat ve netti.'),
    createTask('2026-04-03', 'Rahatti, biraz daha fazlasina hazirim.'),
    createTask('2026-04-04', 'Kolaydi ve duzenli ilerledi.'),
    createTask('2026-04-05', 'Hazirim, gayet iyi gitti.'),
  ]);

  assert.equal(currentDay.branchFocus, 'stretch');
});

test('weekly plan snapshot is reused inside the same week instead of recalculating', () => {
  const tasks = [
    createTask('2026-04-01', 'Bugun zorlandim ve dagildim.'),
    createTask('2026-04-02', 'Biraz erteledim ve ritim aksatti.'),
  ];
  const snapshot = createWeeklyPlanSnapshot(createProfile(), tasks, Date.parse('2026-04-10T10:00:00Z'));
  const reusedSnapshot = ensureWeeklyPlanSnapshot(
    createProfile(),
    [...tasks, createTask('2026-04-10', 'Bugun gayet kolaydi ama snapshot ayni kalmali.')],
    snapshot,
    Date.parse('2026-04-11T09:00:00Z'),
  );

  assert.equal(reusedSnapshot?.weekKey, snapshot.weekKey);
  assert.equal(reusedSnapshot?.direction, snapshot.direction);
});
