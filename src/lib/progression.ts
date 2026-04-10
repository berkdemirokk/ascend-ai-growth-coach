import { DailyTask, UserProfile } from '../types';
import { getPreviousDayKey } from './day';

const EXPERIENCE_PER_TASK = 10;
const EXPERIENCE_PER_LEVEL = 100;

export const createTaskId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

export const createTask = (
  input: Pick<DailyTask, 'title' | 'description' | 'category'>,
): DailyTask => ({
    ...input,
    id: createTaskId(),
    lessonId: createTaskId(),
    unitId: 'legacy',
    unitTitle: 'Geçmiş Görevler',
  unitOrder: 99,
  missionKind: 'legacy',
  adaptationMode: 'legacy',
  planFocus: 'legacy',
  teaching: input.description,
    reflectionPrompt: 'Bu görev sana ne öğretti ve yarın neyi daha iyi yapabilirsin?',
  completed: false,
  createdAt: Date.now(),
  completedAt: null,
  rewardGranted: false,
  dayKey: 'legacy',
  reflection: null,
  source: 'legacy',
});

export const toggleTaskWithProgression = (
  tasks: DailyTask[],
  profile: UserProfile,
  taskId: string,
) => {
  let nextProfile = profile;

  const nextTasks = tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    const nextCompleted = !task.completed;
    const shouldAwardReward = nextCompleted && !task.rewardGranted;

    if (shouldAwardReward) {
      const totalExperience = profile.experience + EXPERIENCE_PER_TASK;
      const streak =
        profile.lastCompletedDayKey === task.dayKey
          ? profile.streak
          : profile.lastCompletedDayKey === getPreviousDayKey(task.dayKey)
            ? profile.streak + 1
            : 1;

      nextProfile = {
        ...profile,
        level: profile.level + Math.floor(totalExperience / EXPERIENCE_PER_LEVEL),
        experience: totalExperience % EXPERIENCE_PER_LEVEL,
        streak,
        lastCompletedDayKey: task.dayKey,
      };
    }

    return {
      ...task,
      completed: nextCompleted,
      completedAt: nextCompleted ? task.completedAt ?? Date.now() : task.completedAt,
      rewardGranted: task.rewardGranted || shouldAwardReward,
    };
  });

  return { nextTasks, nextProfile };
};
