import { DailyTask, UserProfile } from '../types';
import { getLessonById } from './curriculum';

const PROFILE_KEY = 'ascend_profile';
const TASKS_KEY = 'ascend_tasks';
const ACCOUNT_KEY = 'ascend_account_id';
const ACCOUNT_TOKEN_KEY = 'ascend_account_token';
const ACCOUNT_EMAIL_KEY = 'ascend_account_email';

const isPath = (value: unknown): value is UserProfile['selectedPath'] =>
  value === null ||
  value === 'fitness' ||
  value === 'culture' ||
  value === 'social' ||
  value === 'entertainment' ||
  value === 'career' ||
  value === 'general';

const isOnboardingTempo = (value: unknown): value is NonNullable<UserProfile['onboardingTempo']> =>
  value === 'calm' || value === 'steady' || value === 'focused';

const isDailyMinutes = (value: unknown): value is NonNullable<UserProfile['dailyMinutes']> =>
  value === 15 || value === 25 || value === 40;

export const readProfile = (): UserProfile | null => {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    if (
      typeof parsed.name !== 'string' ||
      !Array.isArray(parsed.goals) ||
      !isPath(parsed.selectedPath) ||
      typeof parsed.level !== 'number' ||
      typeof parsed.experience !== 'number'
    ) {
      return null;
    }

    return {
      name: parsed.name,
      selectedPath: parsed.selectedPath,
      goals: parsed.goals.filter((goal): goal is string => typeof goal === 'string'),
      planTier: parsed.planTier === 'premium' ? 'premium' : 'free',
      ...(isOnboardingTempo(parsed.onboardingTempo) ? { onboardingTempo: parsed.onboardingTempo } : {}),
      ...(isDailyMinutes(parsed.dailyMinutes) ? { dailyMinutes: parsed.dailyMinutes } : {}),
      level: Math.max(1, Math.floor(parsed.level)),
      experience: Math.min(99, Math.max(0, Math.floor(parsed.experience))),
      streak: typeof parsed.streak === 'number' ? Math.max(0, Math.floor(parsed.streak)) : 0,
      lastCompletedDayKey: typeof parsed.lastCompletedDayKey === 'string' ? parsed.lastCompletedDayKey : null,
    };
  } catch {
    return null;
  }
};

export const writeProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const readAccountId = () => {
  const raw = localStorage.getItem(ACCOUNT_KEY);
  return typeof raw === 'string' && raw.trim() ? raw : null;
};

export const writeAccountId = (accountId: string) => {
  localStorage.setItem(ACCOUNT_KEY, accountId);
};

export const readAccountToken = () => {
  const raw = localStorage.getItem(ACCOUNT_TOKEN_KEY);
  return typeof raw === 'string' && raw.trim() ? raw : null;
};

export const writeAccountToken = (accountToken: string) => {
  localStorage.setItem(ACCOUNT_TOKEN_KEY, accountToken);
};

export const readAccountEmail = () => {
  const raw = localStorage.getItem(ACCOUNT_EMAIL_KEY);
  return typeof raw === 'string' && raw.trim() ? raw : null;
};

export const writeAccountEmail = (accountEmail: string) => {
  localStorage.setItem(ACCOUNT_EMAIL_KEY, accountEmail);
};

export const createAccountId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `account-${Math.random().toString(36).slice(2, 11)}`;

export const ensureAccountId = () => {
  const existing = readAccountId();
  if (existing) {
    return existing;
  }

  const nextId = createAccountId();
  writeAccountId(nextId);
  return nextId;
};

const normalizeTask = (task: Partial<DailyTask>): DailyTask | null => {
  if (
    typeof task.id !== 'string' ||
    typeof task.title !== 'string' ||
    typeof task.description !== 'string' ||
    typeof task.completed !== 'boolean' ||
    !isPath(task.category)
  ) {
    return null;
  }

  const lesson = typeof task.lessonId === 'string' ? getLessonById(task.lessonId) : null;
  const derivedUnitId = lesson?.unitId ?? 'legacy';
  const derivedUnitTitle = lesson?.unitTitle ?? 'Geçmiş Görevler';
  const derivedUnitOrder = lesson?.unitOrder ?? 99;

  return {
    id: task.id,
    lessonId: typeof task.lessonId === 'string' ? task.lessonId : task.id,
    unitId: typeof task.unitId === 'string' ? task.unitId : derivedUnitId,
    unitTitle: typeof task.unitTitle === 'string' ? task.unitTitle : derivedUnitTitle,
    unitOrder: typeof task.unitOrder === 'number' ? task.unitOrder : derivedUnitOrder,
    missionKind:
      task.missionKind === 'lesson' || task.missionKind === 'checkpoint' || task.missionKind === 'legacy'
        ? task.missionKind
        : task.source === 'curriculum'
          ? 'lesson'
          : 'legacy',
    adaptationMode:
      task.adaptationMode === 'support' ||
      task.adaptationMode === 'standard' ||
      task.adaptationMode === 'stretch' ||
      task.adaptationMode === 'legacy'
        ? task.adaptationMode
        : task.source === 'curriculum'
          ? 'standard'
          : 'legacy',
    planFocus:
      task.planFocus === 'support' ||
      task.planFocus === 'standard' ||
      task.planFocus === 'stretch' ||
      task.planFocus === 'legacy'
        ? task.planFocus
        : task.source === 'curriculum'
          ? 'standard'
          : 'legacy',
    title: task.title,
    description: task.description,
    teaching: typeof task.teaching === 'string' ? task.teaching : task.description,
      reflectionPrompt:
        typeof task.reflectionPrompt === 'string'
          ? task.reflectionPrompt
          : 'Bu görev sana ne öğretti ve yarın neyi daha iyi yapabilirsin?',
    completed: task.completed,
    category: task.category ?? 'general',
    createdAt: typeof task.createdAt === 'number' ? task.createdAt : Date.now(),
    completedAt: typeof task.completedAt === 'number' ? task.completedAt : null,
    rewardGranted: typeof task.rewardGranted === 'boolean' ? task.rewardGranted : Boolean(task.completed),
    dayKey: typeof task.dayKey === 'string' ? task.dayKey : 'legacy',
    reflection: typeof task.reflection === 'string' ? task.reflection : null,
    source: task.source === 'curriculum' ? 'curriculum' : 'legacy',
  };
};

export const readTasks = (): DailyTask[] => {
  const raw = localStorage.getItem(TASKS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeTask).filter((task): task is DailyTask => task !== null);
  } catch {
    return [];
  }
};

export const writeTasks = (tasks: DailyTask[]) => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const clearAppStorage = () => {
  localStorage.removeItem(ACCOUNT_KEY);
  localStorage.removeItem(ACCOUNT_TOKEN_KEY);
  localStorage.removeItem(ACCOUNT_EMAIL_KEY);
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(TASKS_KEY);
};
