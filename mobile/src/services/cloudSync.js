import { supabase, SUPABASE_CONFIGURED } from './supabase';

const TABLE = 'user_state';

// Fields persisted to cloud. Skip transient/UI/premium (premium = store-authoritative).
const SYNCED_KEYS = [
  'onboarded',
  'userProfile',
  'totalXP',
  'level',
  'currentStreak',
  'longestStreak',
  'lastCompletedDate',
  'streakFreezes',
  'unlockedAchievements',
  'hearts',
  'heartsRefillAt',
  'pathProgress',
  'activePathId',
];

export function pickSyncableState(state) {
  const out = {};
  for (const k of SYNCED_KEYS) {
    if (state[k] !== undefined) out[k] = state[k];
  }
  return out;
}

/**
 * Pull the user's cloud state. Returns the payload object or null.
 */
export async function pullState(userId) {
  if (!SUPABASE_CONFIGURED) return null;
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('payload, updated_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      console.warn('[cloudSync] pull error:', error.message);
      return null;
    }
    return data?.payload || null;
  } catch (e) {
    console.warn('[cloudSync] pull exception:', e?.message);
    return null;
  }
}

/**
 * Push a state snapshot. Upsert single row per user.
 */
export async function pushState(userId, state) {
  if (!SUPABASE_CONFIGURED) return null;
  if (!userId) return null;
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
    if (error) {
      console.warn('[cloudSync] push error:', error.message);
    }
    return error;
  } catch (e) {
    console.warn('[cloudSync] push exception:', e?.message);
    return e;
  }
}

/**
 * Compare local vs cloud snapshots; return whichever has more progress.
 * Returns the winning payload (local or cloud).
 */
export function chooseWinner(localState, cloudPayload) {
  if (!cloudPayload) return localState;
  const localLessons = countLessons(localState.pathProgress);
  const cloudLessons = countLessons(cloudPayload.pathProgress);
  if (cloudLessons > localLessons) return cloudPayload;
  if (localLessons > cloudLessons) return localState;
  // Tie: most recent lastCompletedDate wins
  const localDate = localState.lastCompletedDate || '';
  const cloudDate = cloudPayload.lastCompletedDate || '';
  return cloudDate > localDate ? cloudPayload : localState;
}

function countLessons(pathProgress) {
  if (!pathProgress) return 0;
  return Object.values(pathProgress).reduce(
    (sum, p) => sum + (p?.completed?.length || 0),
    0,
  );
}
