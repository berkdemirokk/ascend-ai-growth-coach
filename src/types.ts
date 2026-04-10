export type Path =
  | 'fitness'
  | 'culture'
  | 'social'
  | 'entertainment'
  | 'career'
  | 'general';

export type PlanTier = 'free' | 'premium';
export type SessionSyncState = 'idle' | 'syncing' | 'synced' | 'conflict_resolved' | 'degraded';
export type OnboardingTempo = 'calm' | 'steady' | 'focused';
export type DailyCommitmentMinutes = 15 | 25 | 40;

export interface AccountIdentity {
  accountId: string;
  accountToken: string | null;
  accountEmail: string | null;
}

export type SubscriptionStatus = 'free' | 'premium';

export interface WeeklyPlanDaySnapshot {
  day: number;
  title: string;
  focus: string;
  checkpoint: string;
  branchFocus: 'support' | 'standard' | 'stretch';
}

export interface WeeklyPlanSnapshot {
  weekKey: string;
  direction: 'support' | 'standard' | 'stretch';
  title: string;
  summary: string;
  days: WeeklyPlanDaySnapshot[];
  createdAt: number;
}

export interface PlannedMission {
  dayKey: string;
  lessonId: string;
  unitTitle: string;
  title: string;
  teaching: string;
  missionKind: 'lesson' | 'checkpoint' | 'legacy';
  adaptationMode: 'support' | 'standard' | 'stretch' | 'legacy';
  planFocus: 'support' | 'standard' | 'stretch' | 'legacy';
}

export interface UserProfile {
  name: string;
  selectedPath: Path | null;
  goals: string[];
  planTier: PlanTier;
  onboardingTempo?: OnboardingTempo;
  dailyMinutes?: DailyCommitmentMinutes;
  level: number;
  experience: number;
  streak: number;
  lastCompletedDayKey: string | null;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface MissionDefinition {
  id: string;
  path: Path;
  minLevel: number;
  unitId: string;
  unitTitle: string;
  unitOrder: number;
  premiumPlanTag?: 'support' | 'stretch';
  title: string;
  teaching: string;
  action: string;
  variantTeaching?: {
    support?: string;
    stretch?: string;
  };
  variantActions?: {
    support?: string;
    stretch?: string;
  };
  reflectionPrompt: string;
  rewardXp: number;
}

export interface DailyTask {
  id: string;
  lessonId: string;
  unitId: string;
  unitTitle: string;
  unitOrder: number;
  missionKind: 'lesson' | 'checkpoint' | 'legacy';
  adaptationMode: 'support' | 'standard' | 'stretch' | 'legacy';
  planFocus: 'support' | 'standard' | 'stretch' | 'legacy';
  title: string;
  description: string;
  teaching: string;
  reflectionPrompt: string;
  completed: boolean;
  category: Path;
  createdAt: number;
  completedAt: number | null;
  rewardGranted: boolean;
  dayKey: string;
  reflection: string | null;
  source: 'curriculum' | 'legacy';
}
