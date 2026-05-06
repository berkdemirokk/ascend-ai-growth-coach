// Paywall A/B variants — randomly assigned per user, persisted across sessions.
// Each variant has different copy, layout, social proof, and value props
// to test conversion optimization.

import AsyncStorage from '@react-native-async-storage/async-storage';

const VARIANT_KEY = '@ascend/paywall_variant_v1';

export const PAYWALL_VARIANTS = {
  // Variant A: Original — discipline-focused, minimalist
  // CTA + subheadline are deliberately action-focused, not free-trial-led:
  // Apple Guideline 3.1.2(c) requires the billed amount to be the most
  // conspicuous pricing element. Free trial info lives in the small
  // disclosure under the price.
  A: {
    id: 'A',
    headline: 'paywall.titleA',           // "TAM MONK MODE"
    subheadline: 'paywall.subtitleA',      // "Tüm özellikleri aç"
    heroEmoji: '🔥',
    showSocialProof: false,
    showCountdown: false,
    ctaText: 'paywall.ctaSubscribeA',      // "Premium'a Geç"
    features: ['hearts', 'paths', 'ads', 'sync', 'achievements'],
    bestValueBadge: 'paywall.bestValueA',  // "EN İYİ FİYAT"
    yearlyHighlight: true,
  },
  // Variant B: Urgency-driven (no fake social proof — Apple guideline 5.1.1
  // forbids inflated user counts. Re-enable showSocialProof only after the
  // app has the real install base to back the claim.)
  B: {
    id: 'B',
    headline: 'paywall.titleB',           // "BU FIRSATI KAÇIRMA"
    subheadline: 'paywall.subtitleB',      // "Disiplin yolculuğunu hızlandır"
    heroEmoji: '⚡',
    showSocialProof: false,
    showCountdown: false,                   // countdown timer also misleading without real offer
    ctaText: 'paywall.ctaSubscribeB',      // "Premium'a Geç"
    features: ['hearts', 'paths', 'ads', 'sync', 'achievements'],
    bestValueBadge: 'paywall.bestValueB',  // "%70 KAZANÇ"
    yearlyHighlight: true,
  },
  // Variant C: Outcome-focused, transformation
  C: {
    id: 'C',
    headline: 'paywall.titleC',           // "DİSİPLİN MASTER OL"
    subheadline: 'paywall.subtitleC',      // "50 günde yeni sen"
    heroEmoji: '🧘',
    showSocialProof: false,
    showCountdown: false,
    ctaText: 'paywall.ctaSubscribeC',      // "Master yolculuğunu başlat"
    features: ['hearts', 'paths', 'ads', 'sync', 'achievements'],
    bestValueBadge: 'paywall.bestValueC',  // "MASTER PAKETİ"
    yearlyHighlight: true,
  },
};

const VARIANT_KEYS = ['A', 'B', 'C'];

// Deterministic random based on user ID/installation, persists across sessions.
async function pickVariantOnce() {
  try {
    const existing = await AsyncStorage.getItem(VARIANT_KEY);
    if (existing && PAYWALL_VARIANTS[existing]) return existing;

    // Equal-distribution random pick
    const random = VARIANT_KEYS[Math.floor(Math.random() * VARIANT_KEYS.length)];
    await AsyncStorage.setItem(VARIANT_KEY, random);
    return random;
  } catch {
    return 'A'; // safe default
  }
}

export async function getPaywallVariant() {
  const id = await pickVariantOnce();
  return PAYWALL_VARIANTS[id] || PAYWALL_VARIANTS.A;
}

// Force a specific variant (admin/dev only)
export async function setPaywallVariant(id) {
  if (PAYWALL_VARIANTS[id]) {
    await AsyncStorage.setItem(VARIANT_KEY, id);
  }
}

// Track which variant the user saw + whether they purchased.
// Logged to console only in dev — production silently no-ops until we
// pipe to a real analytics provider.
export function logPaywallEvent(variantId, event, meta = {}) {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[PAYWALL_AB]', JSON.stringify({
      variant: variantId,
      event,
      ...meta,
      ts: Date.now(),
    }));
  }
}
