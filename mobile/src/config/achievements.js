// Path-based achievements (Discipline Academy)
// Triggered by: total lessons completed, streak milestones, level

export const ACHIEVEMENTS = [
  // ===== STREAK =====
  { id: 'first_flame', title: 'İlk Alev', description: '3 günlük seri', icon: '🔥', type: 'streak', target: 3, rarity: 'common' },
  { id: 'hot_streak', title: 'Sıcak Seri', description: '7 günlük seri', icon: '🔥', type: 'streak', target: 7, rarity: 'common' },
  { id: 'two_weeks', title: 'İki Hafta Savaşçısı', description: '14 günlük seri', icon: '⚔️', type: 'streak', target: 14, rarity: 'uncommon' },
  { id: 'on_fire', title: 'Yanıyorsun', description: '30 günlük seri', icon: '🔥', type: 'streak', target: 30, rarity: 'rare' },
  { id: 'unstoppable', title: 'Durdurulamaz', description: '100 günlük seri', icon: '⚡', type: 'streak', target: 100, rarity: 'epic' },
  // Premium-locked: even at 365 days the icon shows but the badge stays
  // greyed out until the user has Premium. The "almost there" effect is the
  // hook — they see how close they are to a legendary badge and convert.
  { id: 'legend', title: 'Efsane', description: '365 günlük seri', icon: '👑', type: 'streak', target: 365, rarity: 'legendary', premiumOnly: true },

  // ===== LESSON COUNT =====
  { id: 'getting_started', title: 'Başlangıç', description: '10 ders tamamla', icon: '🌱', type: 'lessons', target: 10, rarity: 'common' },
  { id: 'committed', title: 'Kararlı', description: '30 ders tamamla', icon: '💎', type: 'lessons', target: 30, rarity: 'uncommon' },
  { id: 'centurion', title: 'Yüzbaşı', description: '100 ders tamamla', icon: '🏆', type: 'lessons', target: 100, rarity: 'rare' },
  { id: 'marathoner', title: 'Maratoncu', description: '250 ders tamamla', icon: '🏅', type: 'lessons', target: 250, rarity: 'epic', premiumOnly: true },

  // ===== LEVEL =====
  { id: 'level_2', title: 'Tırmanışta', description: 'Seviye 2', icon: '🥉', type: 'level', target: 2, rarity: 'common' },
  { id: 'level_5', title: 'Elit', description: 'Seviye 5', icon: '🥈', type: 'level', target: 5, rarity: 'rare' },
  { id: 'level_8', title: 'Usta', description: 'Seviye 8', icon: '🥇', type: 'level', target: 8, rarity: 'epic', premiumOnly: true },
];

export const RARITY_COLORS = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
};

/**
 * Returns array of newly unlocked achievement IDs. Premium-only achievements
 * stay locked for free users even when their target is reached — the UI shows
 * them as "Premium ile aç" so the user sees how close they were and converts.
 *
 * @param {Object} ctx
 * @param {number} ctx.totalLessonsCompleted
 * @param {number} ctx.streak
 * @param {number} ctx.level
 * @param {string[]} ctx.unlocked - already-unlocked IDs
 * @param {boolean} ctx.isPremium
 * @returns {string[]}
 */
export function checkAchievements(ctx) {
  const {
    totalLessonsCompleted = 0,
    streak = 0,
    level = 1,
    unlocked = [],
    isPremium = false,
  } = ctx;
  const newlyUnlocked = [];

  for (const a of ACHIEVEMENTS) {
    if (unlocked.includes(a.id)) continue;
    if (a.premiumOnly && !isPremium) continue;
    let met = false;
    if (a.type === 'streak' && streak >= a.target) met = true;
    if (a.type === 'lessons' && totalLessonsCompleted >= a.target) met = true;
    if (a.type === 'level' && level >= a.target) met = true;
    if (met) newlyUnlocked.push(a.id);
  }
  return newlyUnlocked;
}

/**
 * For an achievement the user *would* have earned by progress alone but is
 * gated behind Premium, returns true. Used by the achievements grid to show
 * a "Premium ile aç" overlay instead of a generic locked state.
 */
export function isPremiumGated(achievement, ctx) {
  if (!achievement?.premiumOnly) return false;
  if (ctx?.isPremium) return false;
  const { totalLessonsCompleted = 0, streak = 0, level = 1 } = ctx || {};
  if (achievement.type === 'streak') return streak >= achievement.target;
  if (achievement.type === 'lessons')
    return totalLessonsCompleted >= achievement.target;
  if (achievement.type === 'level') return level >= achievement.target;
  return false;
}
