// Review prompt service — uses native StoreReview (Apple SKStoreReviewController).
// Apple silently rate-limits (max 3 prompts/year per user), so we add our own
// trigger logic to maximize chance of success without spamming.
//
// Trigger rules:
//   - User must complete >= 3 lessons total
//   - >= 24 hours since last prompt attempt
//   - Streak >= 2 (positive emotional state)
//   - Never prompt during onboarding
//
// Apple's own throttling decides whether the prompt actually appears, but
// we hand them clean signals.

import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_PROMPT_KEY = '@ascend/review_last_prompt_at_v1';
const PROMPT_COUNT_KEY = '@ascend/review_prompt_count_v1';
const MIN_LESSONS_BEFORE_PROMPT = 3;
const MIN_STREAK_FOR_PROMPT = 2;
const MIN_HOURS_BETWEEN_PROMPTS = 24;

let StoreReview = null;
let loadAttempted = false;

const loadModule = async () => {
  if (loadAttempted) return StoreReview;
  loadAttempted = true;
  try {
    const mod = await import('expo-store-review');
    StoreReview = mod;
  } catch {
    StoreReview = null;
  }
  return StoreReview;
};

/**
 * Check if conditions are met to show review prompt.
 * Returns true if we should attempt a prompt now.
 */
export async function shouldRequestReview({ lessonsCompleted, streak }) {
  if ((lessonsCompleted || 0) < MIN_LESSONS_BEFORE_PROMPT) return false;
  if ((streak || 0) < MIN_STREAK_FOR_PROMPT) return false;

  try {
    const last = await AsyncStorage.getItem(LAST_PROMPT_KEY);
    if (last) {
      const lastMs = parseInt(last, 10);
      const hoursSince = (Date.now() - lastMs) / (1000 * 60 * 60);
      if (hoursSince < MIN_HOURS_BETWEEN_PROMPTS) return false;
    }
  } catch {
    // ignore — fall through to allow prompt
  }
  return true;
}

/**
 * Show the native review prompt if available + supported.
 * Apple's StoreReview decides whether the actual prompt UI appears.
 */
export async function requestReviewIfAppropriate(context = {}) {
  const eligible = await shouldRequestReview(context);
  if (!eligible) return false;

  const mod = await loadModule();
  if (!mod || !mod.requestReview) return false;

  try {
    const isAvail = await mod.isAvailableAsync?.();
    if (!isAvail) return false;
    await mod.requestReview();
    // Track our attempt regardless of whether Apple actually showed it
    await AsyncStorage.setItem(LAST_PROMPT_KEY, String(Date.now()));
    const count = parseInt(
      (await AsyncStorage.getItem(PROMPT_COUNT_KEY)) || '0',
      10,
    );
    await AsyncStorage.setItem(PROMPT_COUNT_KEY, String(count + 1));
    return true;
  } catch (e) {
    console.warn('[review] requestReview failed:', e?.message);
    return false;
  }
}

/**
 * Get the App Store review URL for fallback "Rate the app" buttons in Settings.
 */
export function getStoreReviewUrl(appStoreId = '6761607644') {
  return `https://apps.apple.com/app/id${appStoreId}?action=write-review`;
}
