import test from 'node:test';
import assert from 'node:assert/strict';
import { DailyTask, UserProfile } from '../types';
import { getAdaptivePlanSummary } from './adaptivePlan';

const createProfile = (): UserProfile => ({
  name: 'Berk',
  selectedPath: 'general',
  goals: [],
  planTier: 'premium',
  level: 2,
  experience: 35,
  streak: 2,
  lastCompletedDayKey: null,
});

const createTask = (completed: boolean, reflection: string | null, dayKey: string): DailyTask => ({
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
  completed,
  category: 'general',
  createdAt: Date.now(),
  completedAt: completed ? Date.now() : null,
  rewardGranted: completed,
  dayKey,
  reflection,
  source: 'curriculum',
});

test('adaptive plan recommends support when recent momentum is stalled', () => {
  const plan = getAdaptivePlanSummary(createProfile(), [createTask(true, 'zorlandim', '2026-04-08')]);

  assert.equal(plan.focusTitle, 'Sistemi sadeleştir');
});

test('adaptive plan recommends push when momentum is strong', () => {
  const tasks = [
    createTask(true, 'cok kolaydi hazirim', '2026-04-01'),
    createTask(true, 'hazirim', '2026-04-02'),
    createTask(true, 'kolaydi', '2026-04-03'),
    createTask(true, 'iyi gitti', '2026-04-04'),
    createTask(true, 'rahatti', '2026-04-05'),
  ];

  const plan = getAdaptivePlanSummary(createProfile(), tasks);

  assert.equal(plan.focusTitle, 'Seviyeyi yükselt');
});
