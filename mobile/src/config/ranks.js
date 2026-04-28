// Prestige ranks — earned by completing sprints. Shown on Profile and used
// for social proof. Pure data + a resolver function.

export const RANKS = [
  {
    id: 'novice',
    title: 'Novice',
    subtitle: 'Yolculuk başlıyor',
    emoji: '🌱',
    minSprints: 0,
    color: '#6B6B85',
  },
  {
    id: 'disciple',
    title: 'Disciple',
    subtitle: 'İlk sprint tamamlandı',
    emoji: '⚡',
    minSprints: 1,
    color: '#3B82F6',
  },
  {
    id: 'warrior',
    title: 'Warrior',
    subtitle: 'Savaşçı zihniyeti',
    emoji: '⚔️',
    minSprints: 3,
    color: '#8B5CF6',
  },
  {
    id: 'monk',
    title: 'Monk',
    subtitle: 'Disiplin zirvede',
    emoji: '🧘',
    minSprints: 6,
    color: '#10B981',
  },
  {
    id: 'master',
    title: 'Master',
    subtitle: 'Usta',
    emoji: '👑',
    minSprints: 10,
    color: '#FBBF24',
  },
  {
    id: 'legend',
    title: 'Legend',
    subtitle: 'Efsane',
    emoji: '🔥',
    minSprints: 20,
    color: '#EF4444',
  },
];

export const getRank = (completedSprintCount = 0) => {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (completedSprintCount >= r.minSprints) current = r;
  }
  return current;
};

export const getNextRank = (completedSprintCount = 0) => {
  return RANKS.find((r) => r.minSprints > completedSprintCount) || null;
};
