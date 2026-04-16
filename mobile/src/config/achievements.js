export const ACHIEVEMENTS = [
  // ===== STREAK-BASED =====
  { id: 'first_flame', title: 'First Flame', description: 'Reach a 3-day streak', icon: '🔥', type: 'streak', target: 3, rarity: 'common' },
  { id: 'hot_streak', title: 'Hot Streak', description: 'Reach a 7-day streak', icon: '🔥', type: 'streak', target: 7, rarity: 'common' },
  { id: 'two_weeks', title: 'Two Week Warrior', description: 'Reach a 14-day streak', icon: '⚔️', type: 'streak', target: 14, rarity: 'uncommon' },
  { id: 'on_fire', title: 'On Fire', description: 'Reach a 30-day streak', icon: '🔥', type: 'streak', target: 30, rarity: 'rare' },
  { id: 'unstoppable', title: 'Unstoppable', description: 'Reach a 100-day streak', icon: '⚡', type: 'streak', target: 100, rarity: 'epic' },
  { id: 'legend', title: 'Legend', description: 'Reach a 365-day streak', icon: '👑', type: 'streak', target: 365, rarity: 'legendary' },

  // ===== TOTAL ACTIONS =====
  { id: 'getting_started', title: 'Getting Started', description: 'Complete 10 actions', icon: '🌱', type: 'total', target: 10, rarity: 'common' },
  { id: 'committed', title: 'Committed', description: 'Complete 50 actions', icon: '💎', type: 'total', target: 50, rarity: 'uncommon' },
  { id: 'centurion', title: 'Centurion', description: 'Complete 100 actions', icon: '🏆', type: 'total', target: 100, rarity: 'rare' },
  { id: 'marathoner', title: 'Marathoner', description: 'Complete 250 actions', icon: '🏅', type: 'total', target: 250, rarity: 'epic' },
  { id: 'grandmaster', title: 'Grandmaster', description: 'Complete 500 actions', icon: '⭐', type: 'total', target: 500, rarity: 'legendary' },

  // ===== CATEGORY-BASED =====
  { id: 'health_champion', title: 'Health Champion', description: 'Complete 30 health actions', icon: '💪', type: 'category', category: 'health', target: 30, rarity: 'uncommon' },
  { id: 'career_climber', title: 'Career Climber', description: 'Complete 30 career actions', icon: '🚀', type: 'category', category: 'career', target: 30, rarity: 'uncommon' },
  { id: 'zen_master', title: 'Zen Master', description: 'Complete 30 mindfulness actions', icon: '🧘', type: 'category', category: 'mindfulness', target: 30, rarity: 'uncommon' },
  { id: 'heart_of_gold', title: 'Heart of Gold', description: 'Complete 30 relationship actions', icon: '❤️', type: 'category', category: 'relationships', target: 30, rarity: 'uncommon' },
  { id: 'money_mogul', title: 'Money Mogul', description: 'Complete 30 finance actions', icon: '💰', type: 'category', category: 'finance', target: 30, rarity: 'uncommon' },

  // ===== LEVEL-BASED =====
  { id: 'level_committed', title: 'Committed Climber', description: 'Reach level 2', icon: '🥉', type: 'level', target: 2, rarity: 'common' },
  { id: 'level_elite', title: 'Elite Status', description: 'Reach level 5', icon: '🥈', type: 'level', target: 5, rarity: 'rare' },
  { id: 'level_master', title: 'Master Achieved', description: 'Reach level 6', icon: '🥇', type: 'level', target: 6, rarity: 'epic' },

  // ===== XP-BASED =====
  { id: 'xp_hunter', title: 'XP Hunter', description: 'Earn 1,000 XP', icon: '✨', type: 'xp', target: 1000, rarity: 'uncommon' },
  { id: 'xp_collector', title: 'XP Collector', description: 'Earn 5,000 XP', icon: '💫', type: 'xp', target: 5000, rarity: 'epic' },
];

export const RARITY_COLORS = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#FBBF24',
};

export const checkAchievements = (state) => {
  const unlockedIds = state.unlockedAchievements || [];
  const history = state.history || [];
  const newlyUnlocked = [];

  for (const ach of ACHIEVEMENTS) {
    if (unlockedIds.includes(ach.id)) continue;
    let met = false;
    switch (ach.type) {
      case 'streak':
        met = (state.currentStreak || 0) >= ach.target;
        break;
      case 'total':
        met = history.length >= ach.target;
        break;
      case 'category':
        met = history.filter((h) => h.category === ach.category).length >= ach.target;
        break;
      case 'level':
        met = (state.level || 1) >= ach.target;
        break;
      case 'xp':
        met = (state.totalXP || 0) >= ach.target;
        break;
      default:
        break;
    }
    if (met) newlyUnlocked.push(ach);
  }

  return newlyUnlocked;
};
