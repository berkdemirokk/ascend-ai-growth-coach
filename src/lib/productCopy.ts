import { Path, PlanTier, UserProfile } from '../types';

export const PATH_LABELS: Record<Path, string> = {
  fitness: 'Spor ve Sağlık',
  culture: 'Genel Kültür',
  social: 'Sosyal İlişkiler',
  entertainment: 'Kültür ve Sanat',
  career: 'Kariyer',
  general: 'Genel Gelişim',
};

export const PATH_SHORT_DESCRIPTIONS: Record<Path, string> = {
  fitness: 'Hareket, enerji ve sürdürülebilir sağlık alışkanlıkları.',
  culture: 'Öğrenme disiplini ve düzenli bilgi üretimi.',
  social: 'İletişim kalitesi ve sosyal özgüven gelişimi.',
  entertainment: 'Bilinçli tüketim ve yaratıcı üretim odağı.',
  career: 'İş disiplini, odak ve görünür çıktı üretimi.',
  general: 'Hayat düzenini güçlendiren günlük sistem adımları.',
};

export const PLAN_TIER_LABELS: Record<PlanTier, string> = {
  free: 'Temel Plan',
  premium: 'Premium Plan',
};

export const TEMPO_LABELS: Record<NonNullable<UserProfile['onboardingTempo']>, string> = {
  calm: 'Sakin tempo',
  steady: 'Dengeli tempo',
  focused: 'Yüksek odak',
};

export const DAILY_MINUTES_LABELS: Record<NonNullable<UserProfile['dailyMinutes']>, string> = {
  15: '15 dakika',
  25: '25 dakika',
  40: '40 dakika',
};

export const getPathLabel = (path: Path | null) => PATH_LABELS[path ?? 'general'];
export const getPathShortDescription = (path: Path | null) => PATH_SHORT_DESCRIPTIONS[path ?? 'general'];
export const getPlanTierLabel = (planTier: PlanTier) => PLAN_TIER_LABELS[planTier];
