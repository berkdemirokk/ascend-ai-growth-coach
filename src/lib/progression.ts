import { Badge, DailyTask, StoredUserProfile, TaskSource, TrustedEntitlements, UserProfile } from '../types';

export const PROGRESSION_POLICY = {
  qualifyingSources: ['generated', 'migrated'] as TaskSource[],
  dailyQualifiedCompletionCap: 3,
  xpPerQualifiedCompletion: 20,
  xpPerLevel: 100,
} as const;

function toLocalDateKey(dateInput: string | number | Date) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeTitle(title: string) {
  return title.trim().toLocaleLowerCase('tr-TR');
}

function isQualifyingSource(source: TaskSource) {
  return PROGRESSION_POLICY.qualifyingSources.includes(source);
}

function getQualifiedCompletionHistory(tasks: DailyTask[]) {
  const seenTaskIds = new Set<string>();
  const seenDailyTitleKeys = new Set<string>();
  const perDayQualifiedCount = new Map<string, number>();

  return tasks
    .filter(
      (task) =>
        typeof task.completedAt === 'string' &&
        task.completedAt.length > 0 &&
        isQualifyingSource(task.source),
    )
    .map((task) => ({
      id: task.id,
      completedAt: task.completedAt as string,
      completedDate: toLocalDateKey(task.completedAt as string),
      title: task.title,
      source: task.source,
    }))
    .sort((left, right) => new Date(left.completedAt).getTime() - new Date(right.completedAt).getTime())
    .filter((completion) => {
      if (seenTaskIds.has(completion.id)) {
        return false;
      }

      const dailyTitleKey = `${completion.completedDate}:${normalizeTitle(completion.title)}`;
      const dayCount = perDayQualifiedCount.get(completion.completedDate) ?? 0;
      if (seenDailyTitleKeys.has(dailyTitleKey) || dayCount >= PROGRESSION_POLICY.dailyQualifiedCompletionCap) {
        return false;
      }

      seenTaskIds.add(completion.id);
      seenDailyTitleKeys.add(dailyTitleKey);
      perDayQualifiedCount.set(completion.completedDate, dayCount + 1);
      return true;
    });
}

function buildBadgeList(
  completionHistory: ReturnType<typeof getQualifiedCompletionHistory>,
  level: number,
  streak: number,
): Badge[] {
  if (completionHistory.length === 0) {
    return [];
  }

  const badges: Badge[] = [];
  const latestCompletion = completionHistory[completionHistory.length - 1];

  badges.push({
    id: 'first_task',
    title: 'İlk Adım',
    icon: 'target',
    description: 'İlk görevini tamamladın. İvme başladı.',
    earnedAt: new Date(completionHistory[0].completedAt).getTime(),
  });

  if (completionHistory.length >= 5) {
    badges.push({
      id: 'completed_5',
      title: 'Azimli',
      icon: 'zap',
      description: 'Beş görevi tamamlayarak ritmini kurdun.',
      earnedAt: new Date(completionHistory[4].completedAt).getTime(),
    });
  }

  if (level >= 2) {
    const levelTwoMoment = completionHistory[Math.min(4, completionHistory.length - 1)] ?? latestCompletion;
    badges.push({
      id: 'level_2',
      title: 'Yükselen Yıldız',
      icon: 'star',
      description: 'Seviye 2’ye ulaştın ve düzenli ilerlediğini kanıtladın.',
      earnedAt: new Date(levelTwoMoment.completedAt).getTime(),
    });
  }

  if (streak >= 3) {
    badges.push({
      id: 'streak_3',
      title: 'İstikrar Abidesi',
      icon: 'award',
      description: 'Üç günlük seriyi korudun. Disiplinin görünür hale geldi.',
      earnedAt: new Date(latestCompletion.completedAt).getTime(),
    });
  }

  return badges;
}

function calculateStreak(completionHistory: ReturnType<typeof getQualifiedCompletionHistory>) {
  const uniqueDays = Array.from(new Set(completionHistory.map((entry) => entry.completedDate)));
  if (uniqueDays.length === 0) {
    return {
      streak: 0,
      lastCompletedDate: undefined,
    };
  }

  let streak = 1;
  for (let index = uniqueDays.length - 1; index > 0; index -= 1) {
    const current = new Date(`${uniqueDays[index]}T00:00:00`);
    const previous = new Date(`${uniqueDays[index - 1]}T00:00:00`);
    const difference = Math.round((current.getTime() - previous.getTime()) / 86400000);

    if (difference === 1) {
      streak += 1;
      continue;
    }

    break;
  }

  return {
    streak,
    lastCompletedDate: uniqueDays[uniqueDays.length - 1],
  };
}

export function deriveUserProfile(
  uid: string,
  storedProfile: StoredUserProfile,
  tasks: DailyTask[],
  entitlements: TrustedEntitlements,
): UserProfile {
  const completionHistory = getQualifiedCompletionHistory(tasks);
  const completionCount = completionHistory.length;
  const totalXp = completionCount * PROGRESSION_POLICY.xpPerQualifiedCompletion;
  const level = Math.floor(totalXp / PROGRESSION_POLICY.xpPerLevel) + 1;
  const experience = totalXp % PROGRESSION_POLICY.xpPerLevel;
  const { streak, lastCompletedDate } = calculateStreak(completionHistory);

  return {
    ...storedProfile,
    uid,
    isPremium: entitlements.isPremium,
    level,
    experience,
    streak,
    lastCompletedDate,
    badges: buildBadgeList(completionHistory, level, streak),
  };
}
