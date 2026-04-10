import { DailyTask, UserProfile } from '../types';

export interface WeeklyReviewSummary {
  completedThisWeek: number;
  completedCheckpointsThisWeek: number;
  reflectionCount: number;
  dominantUnitTitle: string | null;
  consistencyDays: number;
  momentum: 'building' | 'steady' | 'stalled';
  insights: string[];
  memorySummary: string;
}

const getRecentTasks = (tasks: DailyTask[]) =>
  tasks
    .filter((task) => task.source === 'curriculum')
    .sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt))
    .slice(0, 7);

export const getWeeklyReviewSummary = (profile: UserProfile, tasks: DailyTask[]): WeeklyReviewSummary => {
  const recentTasks = getRecentTasks(tasks);
  const completed = recentTasks.filter((task) => task.completed);
  const reflections = completed.filter((task) => task.reflection);
  const dominantUnitTitle =
    completed
      .map((task) => task.unitTitle)
      .sort(
        (a, b) =>
          completed.filter((task) => task.unitTitle === b).length - completed.filter((task) => task.unitTitle === a).length,
      )[0] ?? null;

  const uniqueDays = [...new Set(completed.map((task) => task.dayKey))];
  const momentum: WeeklyReviewSummary['momentum'] =
    completed.length >= 5 ? 'building' : completed.length >= 3 ? 'steady' : 'stalled';

  const insights = [
    completed.length > 0
      ? `Bu hafta ${completed.length} plan görevi tamamlandı.`
      : 'Bu hafta henüz tamamlanan plan görevi yok.',
    dominantUnitTitle
      ? `En çok çalışılan alan: ${dominantUnitTitle}.`
      : 'Bu hafta baskın bir alan oluşmadı.',
    reflections.length > 0
      ? `Yansıtma disiplini ${reflections.length} görevde korundu.`
      : 'Bu hafta yansıtma alışkanlığı zayıf kaldı.',
  ];

  return {
    completedThisWeek: completed.length,
    completedCheckpointsThisWeek: completed.filter((task) => task.missionKind === 'checkpoint').length,
    reflectionCount: reflections.length,
    dominantUnitTitle,
    consistencyDays: uniqueDays.length,
    momentum,
    insights,
    memorySummary: `${profile.name} bu hafta ${completed.length} görev tamamladı, ${uniqueDays.length} gün aktif kaldı ve odak olarak ${dominantUnitTitle ?? 'dağınık ilerleme'} üzerinde çalıştı.`,
  };
};
