import { Platform } from 'react-native';
import { ADMOB_IDS } from '../config/constants';

// AdMob is optional - wraps calls safely so the app works without it installed
let AdMobInterstitial = null;
let adsReady = false;

export const initAds = async () => {
  try {
    // expo-ads-admob was deprecated; use react-native-google-mobile-ads if available
    const mod = await import('react-native-google-mobile-ads').catch(() => null);
    if (mod) {
      AdMobInterstitial = mod.InterstitialAd;
    }
    adsReady = !!AdMobInterstitial;
  } catch {
    adsReady = false;
  }
};

let interstitialLoaded = false;
let interstitialAd = null;

export const loadInterstitial = async () => {
  if (!adsReady || !AdMobInterstitial) return;
  try {
    const adUnitId =
      Platform.OS === 'ios'
        ? ADMOB_IDS.INTERSTITIAL_IOS
        : ADMOB_IDS.INTERSTITIAL_ANDROID;
    interstitialAd = AdMobInterstitial.createForAdRequest(adUnitId);
    await new Promise((resolve, reject) => {
      interstitialAd.addAdEventListener('loaded', () => {
        interstitialLoaded = true;
        resolve();
      });
      interstitialAd.addAdEventListener('error', reject);
      interstitialAd.load();
    });
  } catch (e) {
    console.warn('Load interstitial error:', e?.message);
    interstitialLoaded = false;
  }
};

export const showInterstitial = async () => {
  if (!adsReady || !interstitialLoaded || !interstitialAd) {
    // Silently skip if ads not available
    return false;
  }
  try {
    await interstitialAd.show();
    interstitialLoaded = false;
    // Preload next ad
    loadInterstitial().catch(() => {});
    return true;
  } catch (e) {
    console.warn('Show interstitial error:', e?.message);
    return false;
  }
};

// Counter-based ad logic: show every N completions
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
