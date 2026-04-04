export type Path = 'fitness' | 'culture' | 'social' | 'entertainment' | 'career' | 'general';

export interface Badge {
  id: string;
  title: string;
  icon: string;
  description: string;
  earnedAt: number;
}

export interface StoredUserProfile {
  name: string;
  selectedPath: Path | null;
  goals: string[];
  notificationsEnabled: boolean;
  reminderTime?: string; // HH:mm
  theme?: 'light' | 'dark';
  personality?: string;
  height?: number;
  weight?: number;
  hobbies?: string[];
  analysis?: string;
  currentLevel?: 'beginner' | 'intermediate' | 'advanced';
  intensity?: 'casual' | 'regular' | 'intense';
  dailyTime?: '15m' | '30m' | '1h' | '2h+';
}

export interface TrustedEntitlements {
  isPremium: boolean;
}

export interface UserProfile extends StoredUserProfile {
  uid: string;
  level: number;
  experience: number;
  badges: Badge[];
  streak: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  isPremium: boolean;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type Priority = 'high' | 'medium' | 'low';
export type TaskSource = 'generated' | 'custom' | 'migrated' | 'preview';

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: Path;
  priority: Priority;
  reminderTime?: string; // HH:mm format
  createdAt?: string | null; // ISO string
  completedAt?: string | null; // ISO string
  source: TaskSource;
}

export type TaskDraft = Omit<DailyTask, 'id' | 'completed' | 'completedAt' | 'createdAt'>;
