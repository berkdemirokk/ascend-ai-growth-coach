// Material 3 design tokens — aligned with Stitch DESIGN.md.
// Dark theme: primary is the LIGHT version of the color, used on dark surfaces.
export const M3 = {
  // Surfaces (tonal layers)
  background: '#13131b',
  surface: '#13131b',
  surfaceContainerLowest: '#0d0d15',
  surfaceContainerLow: '#1b1b23',
  surfaceContainer: '#1f1f27',
  surfaceContainerHigh: '#292932',
  surfaceContainerHighest: '#34343d',
  surfaceVariant: '#34343d',
  surfaceBright: '#393841',
  // Text on surfaces
  onSurface: '#e4e1ed',
  onSurfaceVariant: '#c7c4d7',
  outline: '#908fa0',
  outlineVariant: '#464554',
  // Primary (indigo)
  primary: '#c0c1ff',
  onPrimary: '#1000a9',
  primaryContainer: '#8083ff',
  onPrimaryContainer: '#0d0096',
  inversePrimary: '#494bd6',
  // Secondary (purple)
  secondary: '#d0bcff',
  onSecondary: '#3c0091',
  secondaryContainer: '#571bc1',
  onSecondaryContainer: '#c4abff',
  // Tertiary (gold/amber)
  tertiary: '#ffb783',
  onTertiary: '#4f2500',
  tertiaryContainer: '#d97721',
  onTertiaryContainer: '#452000',
  // Error
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
};

// Legacy COLORS export — kept for compatibility but now mapped to M3 tokens.
// New code should use M3 directly.
export const COLORS = {
  primary: '#6366F1',          // Brand gradient start (legacy, kept for CTA gradients)
  primaryDark: '#4F46E5',
  accent: '#8B5CF6',           // Brand gradient end
  accentDark: '#7C3AED',
  background: M3.background,
  surface: M3.surfaceContainer,
  surfaceLight: M3.surfaceContainerHigh,
  border: M3.outlineVariant,
  text: M3.onSurface,
  textSecondary: M3.onSurfaceVariant,
  textMuted: M3.outline,
  success: '#10B981',
  warning: '#F59E0B',
  error: M3.error,
  gold: '#FDE047',
  // Path colors (kept for backward compat)
  health: '#10B981',
  career: '#3B82F6',
  mindfulness: '#8B5CF6',
  relationships: '#EC4899',
  finance: '#F59E0B',
};

export const XP_REWARDS = {
  ACTION_COMPLETE: 10,
  FIRST_TIME_BONUS: 5,
  STREAK_10: 25,
  STREAK_30: 100,
  STREAK_100: 500,
};

export const LEVEL_THRESHOLDS = [
  { level: 1, title: 'Beginner', xpRequired: 0, isPremium: false },
  { level: 2, title: 'Committed', xpRequired: 100, isPremium: false },
  { level: 3, title: 'Dedicated', xpRequired: 300, isPremium: false },
  { level: 4, title: 'Advanced', xpRequired: 600, isPremium: false },
  { level: 5, title: 'Elite', xpRequired: 1000, isPremium: false },
  { level: 6, title: 'Master', xpRequired: 1500, isPremium: false },
  { level: 7, title: 'Legendary', xpRequired: 2500, isPremium: true },
];

export const getLevelForXP = (xp) => {
  let current = LEVEL_THRESHOLDS[0];
  for (const t of LEVEL_THRESHOLDS) {
    if (xp >= t.xpRequired) current = t;
  }
  return current;
};

export const getNextLevel = (currentLevel) => {
  return LEVEL_THRESHOLDS.find((l) => l.level === currentLevel + 1) || null;
};

export const checkLevelUp = (newTotalXP, currentLevel) => {
  const next = getNextLevel(currentLevel);
  if (next && newTotalXP >= next.xpRequired) {
    return next.level;
  }
  return currentLevel;
};

export const CATEGORIES = [
  { id: 'health', label: 'Health', icon: '💪', color: COLORS.health, description: 'Physical fitness & wellbeing' },
  { id: 'career', label: 'Career', icon: '🚀', color: COLORS.career, description: 'Work, skills, and growth' },
  { id: 'mindfulness', label: 'Mindfulness', icon: '🧘', color: COLORS.mindfulness, description: 'Mental clarity & peace' },
  { id: 'relationships', label: 'Relationships', icon: '❤️', color: COLORS.relationships, description: 'Family, friends & love' },
  { id: 'finance', label: 'Finance', icon: '💰', color: COLORS.finance, description: 'Money, savings & wealth' },
];

export const DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner', description: 'Easy, 5-10 min per day', icon: '🌱' },
  { id: 'intermediate', label: 'Intermediate', description: 'Moderate, 10-30 min per day', icon: '⚡' },
  { id: 'advanced', label: 'Advanced', description: 'Challenging, 30+ min per day', icon: '🔥' },
];

export const STORAGE_KEYS = {
  USER_STATE: '@ascend/user_state_v1',
  ONBOARDED: '@ascend/onboarded_v1',
  AD_COUNTER: '@ascend/ad_counter_v1',
};

export const REVENUECAT_CONFIG = {
  API_KEY_IOS: 'appl_GdTXEiIwMXBaFuHLGjwBhzlrruB',
  ENTITLEMENT_ID: 'premium',
  OFFERING_ID: 'default',
  // Match App Store Connect product IDs (verified via ASC API)
  PRODUCT_ID_MONTHLY: 'com.ascend.premium.monthly',
  PRODUCT_ID_YEARLY: 'com.ascend.premium.yearly',
  PRODUCT_ID: 'com.ascend.premium.monthly',
};

export const ADMOB_IDS = {
  // Real production IDs from the AdMob console for the "Ascend ai growth
  // coach" app (publisher pub-9898903071826160).
  APP_ID_IOS: 'ca-app-pub-9898903071826160~9553442066',
  INTERSTITIAL_IOS: 'ca-app-pub-9898903071826160/9449500287',
  REWARDED_IOS: 'ca-app-pub-9898903071826160/6183162364',
  // Real banner ad unit (Ascend Banner Bottom).
  BANNER_IOS: 'ca-app-pub-9898903071826160/3140191894',
  // Google-provided test IDs — use these only when __DEV__ to avoid invalid
  // traffic flags on live ad units during development.
  TEST_INTERSTITIAL_IOS: 'ca-app-pub-3940256099942544/4411468910',
  TEST_REWARDED_IOS: 'ca-app-pub-3940256099942544/1712485313',
  TEST_BANNER_IOS: 'ca-app-pub-3940256099942544/2934735716',
  TEST_INTERSTITIAL_ANDROID: 'ca-app-pub-3940256099942544/1033173712',

  // ⚠️ TESTFLIGHT TOGGLE — set to false before App Store submission!
  // While true, app uses Google's guaranteed-fill test ads in release
  // builds too. Necessary for TestFlight verification because new AdMob
  // accounts have ~0% fill rate before going live on App Store.
  USE_TEST_ADS_IN_RELEASE: true,
};

export const PAYWALL_FEATURES = [
  { icon: '🚫', title: 'Ad-Free Experience', description: 'Remove all advertisements' },
  { icon: '❄️', title: 'Streak Freeze', description: 'Miss a day without losing your streak' },
  { icon: '👑', title: 'Legendary Levels', description: 'Unlock level 7 and beyond' },
  { icon: '📊', title: 'Advanced Stats', description: 'Deep insights into your progress' },
  { icon: '🎯', title: 'Unlimited History', description: 'Full timeline of every action' },
  { icon: '✨', title: 'Exclusive Badges', description: 'Show off your premium status' },
];

export const LEGAL = {
  PRIVACY_URL: 'https://berkdemirokk.github.io/ascend-ai-growth-coach/privacy.html',
  TERMS_URL: 'https://berkdemirokk.github.io/ascend-ai-growth-coach/terms.html',
  SUPPORT_EMAIL: 'berkdemirok@icloud.com',
};
