import { supabase, SUPABASE_CONFIGURED } from './supabase';

const TABLE = 'user_state';

// Fields we persist to the cloud. We skip transient/UI-only fields
// (_loaded, todayCompleted, actionsSinceLastAd) and premium status
// (authoritative source is the store/purchase server).
const SYNCED_KEYS = [
  'selectedCategories',
  'difficulty',
  'onboarded',
  'userProfile',
  'totalXP',
  'level',
  'currentStreak',
  'longestStreak',
  'lastCompletedDate',
  'streakFreezes',
  'history',
  'unlockedAchievements',
  'activeSprint',
  'sprintTaskCompletions',
  'sprintHistory',
  'claimedChallenges',
  'maintenance',
  'lessonCompletions',
  'readFactIds',
];

export function pickSyncableState(state) {
  const out = {};
  for (const k of SYNCED_KEYS) {
    if (state[k] !== undefined) out[k] = state[k];
  }
  return out;
}

/**
 * Pull the user's cloud snapshot.
 * Returns { data, error }. data is null if no row exists yet.
 */
export async function pullState(userId) {
  if (!SUPABASE_CONFIGURED) return { data: null, error: null };
  if (!userId) return { data: null, error: new Error('no userId') };
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('payload, updated_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) return { data: null, error };
    return { data: data || null, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

/**
 * Push a state snapshot. Uses upsert so the single row per user
 * is created on first save.
 */
export async function pushState(userId, state) {
  if (!SUPABASE_CONFIGURED) return { error: null };
  if (!userId) return { error: new Error('no userId') };
  try {
    const payload = pickSyncableState(state);
    const { error } = await supabase.from(TABLE).upsert(
      {
        user_id: userId,
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
    return { error };
  } catch (e) {
    return { error: e };
  }
}

/**
 * Decide which snapshot wins when local and cloud disagree.
 * Strategy: total XP + history length as tiebreakers, then newest
 * `lastCompletedDate`. Returns 'local' | 'cloud'.
 */
export function chooseWinner(localState, cloudPayload) {
  if (!cloudPayload) return 'local';
  const localScore =
    (localState.totalXP || 0) * 1000 + (localState.history?.length || 0);
  const cloudScore =
    (cloudPayload.totalXP || 0) * 1000 + (cloudPayload.history?.length || 0);
  if (cloudScore > localScore) return 'cloud';
  if (localScore > cloudScore) return 'local';
  const localDate = localState.lastCompletedDate || '';
  const cloudDate = cloudPayload.lastCompletedDate || '';
  return cloudDate > localDate ? 'cloud' : 'local';
}
