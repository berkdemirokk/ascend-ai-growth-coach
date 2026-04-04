import { StoredUserProfile } from '../types';

export const OWNER_PROFILE_FIELDS = [
  'name',
  'selectedPath',
  'goals',
  'notificationsEnabled',
  'reminderTime',
  'theme',
  'personality',
  'height',
  'weight',
  'hobbies',
  'analysis',
  'currentLevel',
  'intensity',
  'dailyTime',
] as const;

export const LEGACY_PROTECTED_PROFILE_FIELDS = [
  'isPremium',
  'level',
  'experience',
  'streak',
  'lastCompletedDate',
  'badges',
  'role',
] as const;

type OwnerProfileField = (typeof OWNER_PROFILE_FIELDS)[number];

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

export function createStoredProfile(input: Partial<StoredUserProfile>): StoredUserProfile {
  return {
    name: readString(input.name) ?? 'Ascend Kullanıcısı',
    selectedPath: input.selectedPath ?? null,
    goals: readStringArray(input.goals),
    notificationsEnabled: input.notificationsEnabled ?? true,
    reminderTime: readString(input.reminderTime) ?? '09:00',
    theme: input.theme === 'dark' ? 'dark' : 'light',
    personality: readString(input.personality),
    height: typeof input.height === 'number' ? input.height : undefined,
    weight: typeof input.weight === 'number' ? input.weight : undefined,
    hobbies: readStringArray(input.hobbies),
    analysis: readString(input.analysis),
    currentLevel: input.currentLevel,
    intensity: input.intensity,
    dailyTime: input.dailyTime,
  };
}

export function sanitizeOwnerProfileUpdates(updates: Partial<StoredUserProfile>) {
  const sanitized: Partial<StoredUserProfile> = {};
  const typedUpdates = updates as Record<string, StoredUserProfile[keyof StoredUserProfile]>;

  OWNER_PROFILE_FIELDS.forEach((field) => {
    if (field in updates) {
      (sanitized as Record<string, StoredUserProfile[keyof StoredUserProfile]>)[field] = typedUpdates[field];
    }
  });

  return sanitized;
}
