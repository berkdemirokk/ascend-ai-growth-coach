import { DailyTask } from '../types';

export type AdaptationSignal = 'steady' | 'needs_support' | 'ready_to_push';

const SUPPORT_PATTERNS = [
  'zor',
  'zorlandi',
  'zorlandim',
  'ertele',
  'dagildi',
  'yapamad',
  'aksatti',
  'unut',
];

const PUSH_PATTERNS = [
  'kolay',
  'rahat',
  'iyi gitti',
  'tamamladim',
  'netti',
  'hazirim',
  'guven',
];

export const getAdaptationSignal = (tasks: DailyTask[]): AdaptationSignal => {
  const recentReflections = tasks
    .filter((task) => task.completed && task.reflection)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
    .slice(0, 3)
    .map((task) => task.reflection?.toLowerCase() ?? '');

  if (recentReflections.length === 0) {
    return 'steady';
  }

  const supportHits = recentReflections.reduce(
    (count, reflection) => count + SUPPORT_PATTERNS.filter((pattern) => reflection.includes(pattern)).length,
    0,
  );
  const pushHits = recentReflections.reduce(
    (count, reflection) => count + PUSH_PATTERNS.filter((pattern) => reflection.includes(pattern)).length,
    0,
  );

  if (supportHits >= pushHits + 1) {
    return 'needs_support';
  }

  if (pushHits >= supportHits + 2) {
    return 'ready_to_push';
  }

  return 'steady';
};

export const getSignalLabel = (signal: AdaptationSignal) => {
  switch (signal) {
    case 'needs_support':
      return 'Daha kolay mod';
    case 'ready_to_push':
      return 'İleri adım modu';
    default:
      return 'Dengeli tempo';
  }
};

export const adaptTeaching = (teaching: string, signal: AdaptationSignal) => {
  switch (signal) {
    case 'needs_support':
      return `Bugün ritmi korumak, kusursuz olmaktan daha değerli. ${teaching}`;
    case 'ready_to_push':
      return `Bugün bir adım daha ileri gidebilirsin. ${teaching}`;
    default:
      return teaching;
  }
};

export const adaptAction = (action: string, signal: AdaptationSignal) => {
  switch (signal) {
    case 'needs_support':
      return `Görevi daha küçük parçaya bölmek serbest. Başlangıç için: ${action}`;
    case 'ready_to_push':
      return `Bugün bunu biraz daha bilinçli ve net yap: ${action}`;
    default:
      return action;
  }
};
