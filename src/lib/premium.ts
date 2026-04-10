import { DailyTask, PlanTier, UserProfile } from '../types';
import { getAdaptationSignal } from './adaptation';
import { PLAN_TIER_LABELS } from './productCopy';

export const isPremiumProfile = (profile: UserProfile) => profile.planTier === 'premium';

export const getPlanTierLabel = (tier: PlanTier) => PLAN_TIER_LABELS[tier];

export const getMissionAdaptationSignal = (profile: UserProfile, tasks: DailyTask[]) =>
  isPremiumProfile(profile) ? getAdaptationSignal(tasks) : 'steady';

export const getCoachMemoryTasks = (profile: UserProfile, tasks: DailyTask[]) =>
  tasks
    .filter((task) => task.completed && task.reflection)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
    .slice(0, isPremiumProfile(profile) ? 5 : 1);
