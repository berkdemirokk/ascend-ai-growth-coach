// Anonymous public streak leaderboard.
// One row per signed-in user; the row stores an anon_username (never the real
// name) plus current/longest streak and total XP for ranking. RLS only lets
// each user write their own row, but everyone can read.
//
// New rows are created lazily on the first push, so the leaderboard never
// gets an entry for users who haven't done a single lesson yet.

import { supabase, SUPABASE_CONFIGURED } from './supabase';

const TABLE = 'streak_leaderboard';

// Lightweight, no-PII handle: monk_<random4digits>. Stable for the user's
// lifetime once generated — re-using the same name across devices.
export const generateAnonUsername = () => {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `monk_${n}`;
};

/**
 * Upsert the user's leaderboard row from the latest local state.
 * Safe to call on every app open or after a streak change — Supabase upserts
 * keep the row pinned to the user_id.
 */
export const pushLeaderboardEntry = async (userId, payload) => {
  if (!SUPABASE_CONFIGURED || !userId) return false;
  const { anonUsername, currentStreak, longestStreak, totalXP } = payload || {};
  if (!anonUsername) return false;
  try {
    const { error } = await supabase.from(TABLE).upsert(
      {
        user_id: userId,
        anon_username: anonUsername,
        current_streak: currentStreak || 0,
        longest_streak: longestStreak || 0,
        total_xp: totalXP || 0,
      },
      { onConflict: 'user_id' },
    );
    if (error) {
      console.warn('[leaderboard] push error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[leaderboard] push exception:', e?.message || e);
    return false;
  }
};

/**
 * Fetch the top N rows by current_streak, breaking ties by total_xp.
 */
export const fetchTopLeaderboard = async (limit = 50) => {
  if (!SUPABASE_CONFIGURED) return [];
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('user_id, anon_username, current_streak, longest_streak, total_xp, updated_at')
      .order('current_streak', { ascending: false })
      .order('total_xp', { ascending: false })
      .limit(limit);
    if (error) {
      console.warn('[leaderboard] fetch error:', error.message);
      return [];
    }
    return data || [];
  } catch (e) {
    console.warn('[leaderboard] fetch exception:', e?.message || e);
    return [];
  }
};
