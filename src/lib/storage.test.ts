import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  clearAppStorage,
  ensureAccountId,
  readAccountEmail,
  readAccountId,
  readAccountToken,
  readProfile,
  readTasks,
  writeAccountId,
  writeAccountEmail,
  writeAccountToken,
  writeProfile,
  writeTasks,
} from './storage';
import { UserProfile, DailyTask } from '../types';

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

const memoryStorage = new MemoryStorage();

Object.defineProperty(globalThis, 'localStorage', {
  value: memoryStorage,
  configurable: true,
});

afterEach(() => {
  memoryStorage.clear();
});

const profile: UserProfile = {
  name: 'Berk',
  selectedPath: 'general',
  goals: ['growth'],
  planTier: 'free',
  level: 2,
  experience: 25,
  streak: 3,
  lastCompletedDayKey: '2026-04-09',
};

const task: DailyTask = {
  id: 'task-1',
  lessonId: 'gen-1',
  unitId: 'general-unit-1',
  unitTitle: 'Gunluk Temel',
  unitOrder: 1,
  missionKind: 'lesson',
  adaptationMode: 'stretch',
  planFocus: 'stretch',
  title: 'Tek odak',
  description: 'Bugun tek bir ise odaklan.',
  teaching: 'Tek odak daha guclu ilerleme yaratir.',
  reflectionPrompt: 'Ne ogrendin?',
  completed: true,
  category: 'general',
  createdAt: 1,
  completedAt: 2,
  rewardGranted: true,
  dayKey: '2026-04-09',
  reflection: 'kolaydi',
  source: 'curriculum',
};

test('writeProfile/readProfile round-trips trusted profile fields', () => {
  writeProfile(profile);

  const stored = readProfile();

  assert.deepEqual(stored, profile);
});

test('readProfile returns null for malformed profile payload', () => {
  localStorage.setItem(
    'ascend_profile',
    JSON.stringify({
      name: 'Berk',
      selectedPath: 'not-a-path',
      goals: [],
      level: 1,
      experience: 0,
    }),
  );

  assert.equal(readProfile(), null);
});

test('readTasks normalizes missing adaptation and unit fields from legacy curriculum task', () => {
  localStorage.setItem(
    'ascend_tasks',
    JSON.stringify([
      {
        id: 'legacy-curriculum-task',
        lessonId: 'gen-1',
        title: 'Tek odak',
        description: 'Bugun hayatini ilerletecek tek bir seyi sec ve 15 dakika ayir.',
        completed: false,
        category: 'general',
        source: 'curriculum',
      },
    ]),
  );

  const tasks = readTasks();

  assert.equal(tasks.length, 1);
  assert.equal(tasks[0]?.unitId, 'general-unit-1');
  assert.equal(tasks[0]?.unitTitle, 'Gunluk Temel');
  assert.equal(tasks[0]?.missionKind, 'lesson');
  assert.equal(tasks[0]?.adaptationMode, 'standard');
  assert.equal(tasks[0]?.planFocus, 'standard');
});

test('writeTasks/readTasks preserve enriched task model and clearAppStorage removes app keys', () => {
  writeTasks([task]);
  assert.deepEqual(readTasks(), [task]);

  clearAppStorage();

  assert.equal(readProfile(), null);
  assert.deepEqual(readTasks(), []);
});

test('account id is generated once and can be overwritten explicitly', () => {
  const first = ensureAccountId();
  const second = ensureAccountId();

  assert.equal(first, second);
  assert.equal(readAccountId(), first);

  writeAccountId('account-fixed');
  assert.equal(readAccountId(), 'account-fixed');
});

test('account token can be stored and is cleared with app storage', () => {
  writeAccountToken('token-fixed');
  assert.equal(readAccountToken(), 'token-fixed');

  clearAppStorage();

  assert.equal(readAccountToken(), null);
});

test('account email can be stored and is cleared with app storage', () => {
  writeAccountEmail('berk@example.com');
  assert.equal(readAccountEmail(), 'berk@example.com');

  clearAppStorage();

  assert.equal(readAccountEmail(), null);
});
