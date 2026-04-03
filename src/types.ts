export type Path = 'fitness' | 'culture' | 'social' | 'entertainment' | 'career' | 'general';

export interface UserProfile {
  name: string;
  selectedPath: Path | null;
  goals: string[];
  level: number;
  experience: number;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: Path;
  reminderTime?: string; // ISO string or HH:mm format
}
