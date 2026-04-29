// Path-based achievements (Discipline Academy)
// Triggered by: total lessons completed, streak milestones, level

export const ACHIEVEMENTS = [
  // ===== STREAK =====
  { id: 'first_flame', title: 'İlk Alev', description: '3 günlük seri', icon: '🔥', type: 'streak', target: 3, rarity: 'common' },
  { id: 'hot_streak', title: 'Sıcak Seri', description: '7 günlük seri', icon: '🔥', type: 'streak', target: 7, rarity: 'common' },
  { id: 'two_weeks', title: 'İki Hafta Savaşçısı', description: '14 günlük seri', icon: '⚔️', type: 'streak', target: 14, rarity: 'uncommon' },
  { id: 'on_fire', title: 'Yanıyorsun', description: '30 günlük seri', icon: '🔥', type: 'streak', target: 30, rarity: 'rare' },
  { id: 'unstoppable', title: 'Durdurulamaz', description: '100 günlük seri', icon: '⚡', type: 'streak', target: 100, rarity: 'epic' },
  { id: 'legend', title: 'Efsane', description: '365 günlük seri', icon: '👑', type: 'streak', target: 365, rarity: 'legendary' },

  // ===== LESSON COUNT =====
  { id: 'getting_started', title: 'Başlangıç', description: '10 ders tamamla', icon: '🌱', type: 'lessons', target: 10, rarity: 'common' },
  { id: 'committed', title: 'Kararlı', description: '30 ders tamamla', icon: '💎', type: 'lessons', target: 30, rarity: 'uncommon' },
  { id: 'centurion', title: 'Yüzbaşı', description: '100 ders tamamla', icon: '🏆', type: 'lessons', target: 100, rarity: 'rare' },
  { id: 'marathoner', title: 'Maratoncu', description: '250 ders tamamla', icon: '🏅', type: 'lessons', target: 250, rarity: 'epic' },

  // ===== LEVEL =====
  { id: 'level_2', title: 'Tırmanışta', description: 'Seviye 2', icon: '🥉', type: 'level', target: 2, rarity: 'common' },
  { id: 'level_5', title: 'Elit', description: 'Seviye 5', icon: '🥈', type: 'level', target: 5, rarity: 'rare' },
  { id: 'level_8', title: 'Usta', description: 'Seviye 8', icon: '🥇', type: 'level', target: 8, rarity: 'epic' },
];

export const RARITY_COLORS = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
};

/**
 * Returns array of newly unlocked achievement IDs.
 *
 * @param {Object} ctx
 * @param {number} ctx.totalLessonsCompleted
 * @param {number} ctx.streak
 * @param {number} ctx.level
 * @param {string[]} ctx.unlocked - already-unlocked IDs
 * @returns {string[]}
 */
export function checkAchievements(ctx) {
  const { totalLessonsCompleted = 0, streak = 0, level = 1, unlocked = [] } = ctx;
  const newlyUnlocked = [];

  for (const a of ACHIEVEMENTS) {
    if (unlocked.includes(a.id)) continue;
    let met = false;
    if (a.type === 'streak' && streak >= a.target) met = true;
    if (a.type === 'lessons' && totalLessonsCompleted >= a.target) met = true;
    if (a.type === 'level' && level >= a.target) met = true;
    if (met) newlyUnlocked.push(a.id);
  }
  return newlyUnlocked;
}
