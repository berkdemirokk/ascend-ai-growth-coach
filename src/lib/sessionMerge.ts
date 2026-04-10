import { DailyTask, PlannedMission, UserProfile, WeeklyPlanSnapshot } from '../types';

const laterDayKey = (left: string | null, right: string | null) => {
  if (!left) return right;
  if (!right) return left;
  return left >= right ? left : right;
};

export const mergeProfiles = (localProfile: UserProfile, remoteProfile: UserProfile): UserProfile => ({
  name: localProfile.name || remoteProfile.name,
  selectedPath: localProfile.selectedPath ?? remoteProfile.selectedPath,
  goals: [...new Set([...remoteProfile.goals, ...localProfile.goals])],
  planTier: remoteProfile.planTier,
  onboardingTempo: localProfile.onboardingTempo ?? remoteProfile.onboardingTempo,
  dailyMinutes: localProfile.dailyMinutes ?? remoteProfile.dailyMinutes,
  level: Math.max(localProfile.level, remoteProfile.level),
  experience: Math.max(localProfile.experience, remoteProfile.experience),
  streak: Math.max(localProfile.streak, remoteProfile.streak),
  lastCompletedDayKey: laterDayKey(localProfile.lastCompletedDayKey, remoteProfile.lastCompletedDayKey),
});

const mergeTask = (localTask: DailyTask, remoteTask: DailyTask): DailyTask => ({
  ...remoteTask,
  ...localTask,
  completed: localTask.completed || remoteTask.completed,
  completedAt: Math.max(localTask.completedAt ?? 0, remoteTask.completedAt ?? 0) || null,
  rewardGranted: localTask.rewardGranted || remoteTask.rewardGranted,
  reflection: localTask.reflection ?? remoteTask.reflection ?? null,
  createdAt: Math.max(localTask.createdAt, remoteTask.createdAt),
  dayKey: laterDayKey(localTask.dayKey, remoteTask.dayKey) ?? localTask.dayKey,
});

export const mergeTasks = (localTasks: DailyTask[], remoteTasks: DailyTask[]) => {
  const merged = new Map<string, DailyTask>();

  for (const remoteTask of remoteTasks) {
    merged.set(remoteTask.id, remoteTask);
  }

  for (const localTask of localTasks) {
    const existing = merged.get(localTask.id);
    merged.set(localTask.id, existing ? mergeTask(localTask, existing) : localTask);
  }

  return [...merged.values()].sort((left, right) => left.createdAt - right.createdAt);
};

export const mergeWeeklyPlanSnapshots = (
  localSnapshot: WeeklyPlanSnapshot | null,
  remoteSnapshot: WeeklyPlanSnapshot | null,
) => {
  if (!localSnapshot) return remoteSnapshot;
  if (!remoteSnapshot) return localSnapshot;
  return localSnapshot.createdAt >= remoteSnapshot.createdAt ? localSnapshot : remoteSnapshot;
};

export const mergePlannedMissions = (localMissions: PlannedMission[], remoteMissions: PlannedMission[]) => {
  const merged = new Map<string, PlannedMission>();

  for (const remoteMission of remoteMissions) {
    merged.set(`${remoteMission.dayKey}:${remoteMission.lessonId}`, remoteMission);
  }

  for (const localMission of localMissions) {
    merged.set(`${localMission.dayKey}:${localMission.lessonId}`, localMission);
  }

  return [...merged.values()].sort((left, right) => left.dayKey.localeCompare(right.dayKey));
};
