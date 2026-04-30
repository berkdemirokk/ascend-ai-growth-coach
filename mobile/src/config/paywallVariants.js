// Paywall A/B variants — randomly assigned per user, persisted across sessions.
// Each variant has different copy, layout, social proof, and value props
// to test conversion optimization.

import AsyncStorage from '@react-native-async-storage/async-storage';

const VARIANT_KEY = '@ascend/paywall_variant_v1';

export const PAYWALL_VARIANTS = {
  // Variant A: Original — discipline-focused, minimalist
  A: {
    id: 'A',
    headline: 'paywall.titleA',           // "TAM MONK MODE"
    subheadline: 'paywall.subtitleA',      // "İlk 7 gün ücretsiz"
    heroEmoji: '🔥',
    showSocialProof: false,
    showCountdown: false,
    ctaText: 'paywall.ctaTrialA',          // "7 gün ücretsiz başla"
    features: ['hearts', 'paths', 'ads', 'sync', 'achievements'],
    bestValueBadge: 'paywall.bestValueA',  // "EN İYİ FİYAT"
    yearlyHighlight: true,
  },
  // Variant B: Urgency-driven, social proof
  B: {
    id: 'B',
    headline: 'paywall.titleB',           // "BU FIRSATI KAÇIRMA"
    subheadline: 'paywall.subtitleB',      // "Premium'la 3x daha hızlı ilerle"
    heroEmoji: '⚡',
    showSocialProof: true,                  // "10,000+ disiplinli kullanıcı"
    showCountdown: true,                    // 24h offer countdown
    ctaText: 'paywall.ctaTrialB',          // "Bana özel teklifi al"
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
    showSocialProof: true,
    showCountdown: false,
    ctaText: 'paywall.ctaTrialC',          // "Master yolculuğunu başlat"
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
// Cleanly logged to console for now (can pipe to analytics later).
export function logPaywallEvent(variantId, event, meta = {}) {
  console.log('[PAYWALL_AB]', JSON.stringify({
    variant: variantId,
    event,         // 'view' | 'select_yearly' | 'select_monthly' | 'purchase' | 'restore' | 'close'
    ...meta,
    ts: Date.now(),
  }));
}
