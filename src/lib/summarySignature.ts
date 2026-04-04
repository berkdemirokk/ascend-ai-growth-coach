import { DailyTask, UserProfile } from '../types';

function normalizeTaskSignature(task: DailyTask) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    category: task.category,
    priority: task.priority,
    reminderTime: task.reminderTime ?? null,
    completed: task.completed,
    completedAt: task.completedAt ?? null,
    createdAt: task.createdAt ?? null,
    source: task.source,
  };
}

export function buildUserStateSignature(profile: UserProfile, tasks: DailyTask[]) {
  return JSON.stringify({
    profile: {
      name: profile.name,
      selectedPath: profile.selectedPath,
      goals: profile.goals,
      notificationsEnabled: profile.notificationsEnabled,
      reminderTime: profile.reminderTime ?? null,
      theme: profile.theme ?? null,
      personality: profile.personality ?? null,
      height: profile.height ?? null,
      weight: profile.weight ?? null,
      hobbies: profile.hobbies ?? [],
      analysis: profile.analysis ?? null,
      currentLevel: profile.currentLevel ?? null,
      intensity: profile.intensity ?? null,
      dailyTime: profile.dailyTime ?? null,
      level: profile.level,
      experience: profile.experience,
      streak: profile.streak,
      lastCompletedDate: profile.lastCompletedDate ?? null,
      isPremium: profile.isPremium,
    },
    tasks: [...tasks]
      .map(normalizeTaskSignature)
      .sort((left, right) => left.id.localeCompare(right.id, 'tr-TR')),
  });
}
