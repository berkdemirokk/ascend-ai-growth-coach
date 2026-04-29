// Monk Mode: ads fully removed. Premium subscription is the only monetization.
// All exports are no-ops kept for compatibility with existing imports.
import { Platform } from 'react-native';

// ─── Module state ────────────────────────────────────────────────────────────
// We lazy-require `react-native-google-mobile-ads` so the rest of the app keeps
// working even if the native module isn't present (JS-only Metro dev, bare
// Snack link, forgotten `pod install`, etc.).

let gma = null; // the imported module, or null if unavailable
let adsReady = false;

let interstitial = null;
let interstitialLoaded = false;

let rewarded = null;
let rewardedLoaded = false;

// ─── Ad unit resolution ──────────────────────────────────────────────────────

const getInterstitialId = () => {
  if (Platform.OS !== 'ios') {
    return ADMOB_IDS.TEST_INTERSTITIAL_ANDROID;
  }
  // Google recommends test ads in __DEV__ to avoid invalid-traffic flags on
  // live ad units.
  return __DEV__
    ? ADMOB_IDS.TEST_INTERSTITIAL_IOS
    : ADMOB_IDS.INTERSTITIAL_IOS;
};

const getRewardedId = () => {
  if (Platform.OS !== 'ios') return null;
  return __DEV__ ? ADMOB_IDS.TEST_REWARDED_IOS : ADMOB_IDS.REWARDED_IOS;
};

// ─── ATT + init ──────────────────────────────────────────────────────────────

/**
 * Request App Tracking Transparency before initializing ads. On iOS 14.5+ this
 * is required by Apple policy for personalized ads. Denial just downgrades us
 * to non-personalized ads — it isn't a fatal error.
 */
const requestTrackingPermissionIfNeeded = async () => {
  if (Platform.OS !== 'ios') return;
  try {
    const mod = await import('expo-tracking-transparency').catch(() => null);
    if (!mod) return;
    const { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } = mod;
    const existing = await getTrackingPermissionsAsync();
    if (existing?.status === 'undetermined') {
      await requestTrackingPermissionsAsync();
    }
  } catch (e) {
    // ATT is best-effort; failures just mean we serve non-personalized ads.
    console.warn('ATT request skipped:', e?.message);
  }
};

// Hybrid monetization: free users see ads, premium users don't.
// AdMob is shown after every 2-3 lesson completions.
const ADS_ENABLED = true;

export const initAds = async () => {
  if (!ADS_ENABLED) {
    adsReady = false;
    return;
  }
  try {
    // On iOS we request ATT first so the SDK picks up the user's choice.
    await requestTrackingPermissionIfNeeded();

    gma = await import('react-native-google-mobile-ads').catch(() => null);
    if (!gma) {
      adsReady = false;
      return;
    }

    // `mobileAds()` is the default export in v14+. Initialize it once.
    if (typeof gma.default === 'function') {
      await gma.default().initialize();
    }
    adsReady = true;
  } catch (e) {
    console.warn('Ads init error:', e?.message);
    adsReady = false;
  }
};

// ─── Interstitial ────────────────────────────────────────────────────────────

export const loadInterstitial = async () => {
  if (!adsReady || !gma?.InterstitialAd || !gma?.AdEventType) return;
  try {
    const adUnitId = getInterstitialId();
    interstitial = gma.InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    await new Promise((resolve, reject) => {
      const offLoaded = interstitial.addAdEventListener(
        gma.AdEventType.LOADED,
        () => {
          interstitialLoaded = true;
          offLoaded?.();
          offError?.();
          resolve();
        },
      );
      const offError = interstitial.addAdEventListener(
        gma.AdEventType.ERROR,
        (err) => {
          interstitialLoaded = false;
          offLoaded?.();
          offError?.();
          reject(err);
        },
      );
      interstitial.load();
    });
  } catch (e) {
    console.warn('Load interstitial error:', e?.message);
    interstitialLoaded = false;
  }
};

export const showInterstitial = async () => {
  if (!adsReady || !interstitialLoaded || !interstitial) return false;
  try {
    await interstitial.show();
    interstitialLoaded = false;
    // Preload the next one in the background so the following completion is
    // ready to show immediately.
    loadInterstitial().catch(() => {});
    return true;
  } catch (e) {
    console.warn('Show interstitial error:', e?.message);
    return false;
  }
};

// ─── Rewarded ────────────────────────────────────────────────────────────────

export const loadRewarded = async () => {
  if (!adsReady || !gma?.RewardedAd || !gma?.RewardedAdEventType) return;
  const adUnitId = getRewardedId();
  if (!adUnitId) return;
  try {
    rewarded = gma.RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });
    await new Promise((resolve, reject) => {
      const offLoaded = rewarded.addAdEventListener(
        gma.RewardedAdEventType.LOADED,
        () => {
          rewardedLoaded = true;
          offLoaded?.();
          offError?.();
          resolve();
        },
      );
      const offError = rewarded.addAdEventListener(
        gma.AdEventType.ERROR,
        (err) => {
          rewardedLoaded = false;
          offLoaded?.();
          offError?.();
          reject(err);
        },
      );
      rewarded.load();
    });
  } catch (e) {
    console.warn('Load rewarded error:', e?.message);
    rewardedLoaded = false;
  }
};

/**
 * Show a rewarded ad. Resolves with `true` if the user earned the reward
 * (watched the ad through), `false` if they bailed early or ads are
 * unavailable.
 */
export const showRewarded = async () => {
  if (!adsReady || !rewardedLoaded || !rewarded || !gma?.RewardedAdEventType) {
    return false;
  }
  return new Promise((resolve) => {
    let earned = false;
    const offEarned = rewarded.addAdEventListener(
      gma.RewardedAdEventType.EARNED_REWARD,
      () => {
        earned = true;
      },
    );
    const offClosed = rewarded.addAdEventListener(
      gma.AdEventType.CLOSED,
      () => {
        offEarned?.();
        offClosed?.();
        rewardedLoaded = false;
        // Preload the next rewarded ad for the next reward moment.
        loadRewarded().catch(() => {});
        resolve(earned);
      },
    );
    rewarded.show().catch((e) => {
      console.warn('Show rewarded error:', e?.message);
      offEarned?.();
      offClosed?.();
      resolve(false);
    });
  });
};

// ─── Frequency capping ───────────────────────────────────────────────────────
// In-memory counter that decides whether this completion triggers an ad.
// Persists only for the current session — acceptable since the worst case is
// the first action of a new session not showing an ad.

let actionsSinceLastAd = 0;
const AD_FREQUENCY = 2;

export const shouldShowAd = (isPremium) => {
  if (isPremium) return false;
  actionsSinceLastAd += 1;
  if (actionsSinceLastAd >= AD_FREQUENCY) {
    actionsSinceLastAd = 0;
    return true;
  }
  return false;
};

export const resetAdCounter = () => {
  actionsSinceLastAd = 0;
};
