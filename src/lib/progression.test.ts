import test from 'node:test';
import assert from 'node:assert/strict';
import { toggleTaskWithProgression } from './progression';
import { DailyTask, UserProfile } from '../types';
import { getDayKey, getPreviousDayKey } from './day';

const createProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  name: 'Berk',
  selectedPath: 'general',
  goals: ['growth'],
  planTier: 'free',
  level: 1,
  experience: 0,
  streak: 0,
  lastCompletedDayKey: null,
  ...overrides,
});

const createTask = (overrides: Partial<DailyTask> = {}): DailyTask => ({
  id: overrides.id ?? 'task-1',
  lessonId: overrides.lessonId ?? 'gen-1',
  unitId: overrides.unitId ?? 'general-unit-1',
  unitTitle: overrides.unitTitle ?? 'Gunluk Temel',
  unitOrder: overrides.unitOrder ?? 1,
  missionKind: overrides.missionKind ?? 'lesson',
  adaptationMode: overrides.adaptationMode ?? 'standard',
  planFocus: overrides.planFocus ?? 'standard',
  title: overrides.title ?? 'Tek odak',
  description: overrides.description ?? 'Bugun tek bir ise odaklan.',
  teaching: overrides.teaching ?? 'Tek odak daha guclu ilerleme yaratir.',
  reflectionPrompt: overrides.reflectionPrompt ?? 'Ne ogrendin?',
  completed: overrides.completed ?? false,
  category: overrides.category ?? 'general',
  createdAt: overrides.createdAt ?? Date.now(),
  completedAt: overrides.completedAt ?? null,
  rewardGranted: overrides.rewardGranted ?? false,
  dayKey: overrides.dayKey ?? getDayKey(),
  reflection: overrides.reflection ?? null,
  source: overrides.source ?? 'curriculum',
});

test('first completion awards xp and starts streak', () => {
  const profile = createProfile();
  const tasks = [createTask()];

  const { nextTasks, nextProfile } = toggleTaskWithProgression(tasks, profile, 'task-1');

  assert.equal(nextTasks[0]?.completed, true);
  assert.equal(nextTasks[0]?.rewardGranted, true);
  assert.equal(nextProfile.experience, 10);
  assert.equal(nextProfile.level, 1);
  assert.equal(nextProfile.streak, 1);
  assert.equal(nextProfile.lastCompletedDayKey, tasks[0]?.dayKey);
});

test('same task cannot mint xp twice after undo and re-complete', () => {
  const dayKey = getDayKey();
  const initialProfile = createProfile({
    experience: 10,
    streak: 1,
    lastCompletedDayKey: dayKey,
  });
  const completedTask = createTask({
    completed: true,
    rewardGranted: true,
    completedAt: Date.now() - 1000,
    dayKey,
  });

  const undoResult = toggleTaskWithProgression([completedTask], initialProfile, 'task-1');
  const redoResult = toggleTaskWithProgression(undoResult.nextTasks, undoResult.nextProfile, 'task-1');

  assert.equal(redoResult.nextProfile.experience, 10);
  assert.equal(redoResult.nextProfile.streak, 1);
  assert.equal(redoResult.nextTasks[0]?.rewardGranted, true);
});

test('next-day completion increments streak', () => {
  const todayKey = getDayKey();
  const yesterdayKey = getPreviousDayKey(todayKey);
  const profile = createProfile({
    streak: 2,
    lastCompletedDayKey: yesterdayKey,
  });

  const { nextProfile } = toggleTaskWithProgression([createTask({ dayKey: todayKey })], profile, 'task-1');

  assert.equal(nextProfile.streak, 3);
  assert.equal(nextProfile.lastCompletedDayKey, todayKey);
});

test('completion over xp threshold levels up and wraps experience', () => {
  const profile = createProfile({
    level: 2,
    experience: 95,
  });

  const { nextProfile } = toggleTaskWithProgression([createTask()], profile, 'task-1');

  assert.equal(nextProfile.level, 3);
  assert.equal(nextProfile.experience, 5);
});
