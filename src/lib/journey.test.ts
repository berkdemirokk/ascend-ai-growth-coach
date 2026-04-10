import test from 'node:test';
import assert from 'node:assert/strict';
import { DailyTask, UserProfile } from '../types';
import { getJourneySummary } from './journey';
import { getDayKey, getPreviousDayKey } from './day';

const createProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  name: 'Berk',
  selectedPath: 'general',
  goals: [],
  planTier: 'premium',
  level: 4,
  experience: 20,
  streak: 2,
  lastCompletedDayKey: null,
  ...overrides,
});

const createTask = (overrides: Partial<DailyTask> = {}): DailyTask => ({
  id: overrides.id ?? `task-${Math.random().toString(36).slice(2, 8)}`,
  lessonId: overrides.lessonId ?? 'gen-1',
  unitId: overrides.unitId ?? 'general-unit-1',
  unitTitle: overrides.unitTitle ?? 'Gunluk Temel',
  unitOrder: overrides.unitOrder ?? 1,
  missionKind: overrides.missionKind ?? 'lesson',
  adaptationMode: overrides.adaptationMode ?? 'standard',
  planFocus: overrides.planFocus ?? 'standard',
  title: overrides.title ?? 'Tek odak',
  description: overrides.description ?? 'Test',
  teaching: overrides.teaching ?? 'Test teaching',
  reflectionPrompt: overrides.reflectionPrompt ?? 'Test',
  completed: overrides.completed ?? true,
  category: overrides.category ?? 'general',
  createdAt: overrides.createdAt ?? Date.now(),
  completedAt: overrides.completedAt ?? Date.now(),
  rewardGranted: overrides.rewardGranted ?? true,
  dayKey: overrides.dayKey ?? getPreviousDayKey(getDayKey()),
  reflection: overrides.reflection ?? 'iyi gitti',
  source: overrides.source ?? 'curriculum',
});

test('premium journey summary exposes support route guidance', () => {
  const summary = getJourneySummary(createProfile(), [
    createTask({ reflection: 'Bugun zorlandim ve biraz erteledim.' }),
    createTask({ id: 'task-2', lessonId: 'gen-2', reflection: 'Ritim aksatti ve yine zor geldi.' }),
    createTask({ id: 'task-3', lessonId: 'gen-3', reflection: 'Biraz dagildim ama tamamladim.' }),
  ]);

  assert.equal(summary.premiumRoute?.direction, 'support');
  assert.equal(summary.premiumRoute?.focusTitle, 'Sistemi sadeleştir');
});

test('free journey summary hides premium route guidance', () => {
  const summary = getJourneySummary(createProfile({ planTier: 'free' }), [createTask()]);

  assert.equal(summary.premiumRoute, null);
});
