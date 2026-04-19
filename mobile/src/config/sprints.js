// Monk Mode sprint catalog.
//
// Each sprint is a time-bounded program with a finite duration, daily tasks
// drawn from a rotating pool, and rules. Completing a sprint earns a
// certificate, meta-XP, and unlocks the next tier on subsequent runs.
//
// Task/rule IDs are stable — renaming them breaks persisted state.

import { COLORS } from './constants';

// ---------- helpers ----------

const hash = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const pickN = (pool, n, seed) => {
  if (!pool?.length) return [];
  const count = Math.min(n, pool.length);
  const picked = [];
  const used = new Set();
  let s = hash(String(seed));
  while (picked.length < count) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const idx = s % pool.length;
    if (used.has(idx)) continue;
    used.add(idx);
    picked.push(pool[idx]);
  }
  return picked;
};

const ymd = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// ---------- tiers ----------

export const TIERS = {
  1: { tasksPerDay: 4, xpMultiplier: 1.0, label: 'Tier I', badge: '🥉' },
  2: { tasksPerDay: 5, xpMultiplier: 1.5, label: 'Tier II', badge: '🥈' },
  3: { tasksPerDay: 6, xpMultiplier: 2.0, label: 'Tier III', badge: '🥇' },
};

export const getTierConfig = (tier) => TIERS[tier] || TIERS[1];

// ---------- sprints ----------

export const SPRINTS = [
  {
    id: 'dopamine_detox_30',
    title: 'Dopamine Detox',
    subtitle: '30 Gün Temizlik',
    duration: 30,
    icon: '🧘',
    color: COLORS.mindfulness,
    description:
      'Beynini sıfırla. Sosyal medya, porno, kısa video yok. Odaklanma geri geliyor.',
    recommendedFor: ['focus', 'social_media', 'anxiety', 'stress'],
    rules: [
      { id: 'no_social', text: 'Sosyal medya yok (Instagram, TikTok, X, YouTube Shorts)' },
      { id: 'no_porn', text: 'Porno yok' },
      { id: 'no_sugar', text: 'İşlenmiş şeker yok' },
    ],
    taskPool: [
      { id: 'meditate_10', title: '10 dakika meditasyon', xp: 15 },
      { id: 'meditate_20', title: '20 dakika meditasyon', xp: 20 },
      { id: 'read_20', title: '20 dakika kitap oku', xp: 15 },
      { id: 'read_30', title: '30 dakika kitap oku', xp: 20 },
      { id: 'walk_30', title: '30 dakika yürü (telefonsuz)', xp: 15 },
      { id: 'walk_60', title: '60 dakika yürü (telefonsuz)', xp: 25 },
      { id: 'journal', title: 'Gün sonu 3 satır günlük yaz', xp: 10 },
      { id: 'gratitude_3', title: '3 şükür listesi yaz', xp: 10 },
      { id: 'breathwork', title: '5 dakika nefes egzersizi (box breathing)', xp: 10 },
      { id: 'no_phone_hour', title: '1 saat telefonsuz zaman', xp: 15 },
      { id: 'cold_face', title: 'Soğuk su ile yüzünü yıka (1 dk)', xp: 10 },
      { id: 'make_bed', title: 'Yatağını topla', xp: 5 },
      { id: 'sunlight_15', title: '15 dakika güneş ışığı al', xp: 10 },
      { id: 'handwrite_goals', title: 'Hedeflerini el yazısıyla yaz', xp: 10 },
      { id: 'call_family', title: 'Aile/yakın biriyle 10 dk konuş', xp: 10 },
      { id: 'clean_space', title: '15 dk odanı/çalışma alanını topla', xp: 10 },
      { id: 'analog_hobby', title: '30 dk analog hobi (çizim, enstrüman)', xp: 20 },
      { id: 'digital_sunset', title: '22:00 sonrası ekran yok', xp: 20 },
      { id: 'silent_meal', title: 'Bir öğünü telefonsuz ye', xp: 10 },
      { id: 'pray_reflect', title: '5 dk iç muhasebe / dua', xp: 10 },
      { id: 'walk_nature', title: 'Doğada 20 dk yürü', xp: 15 },
      { id: 'stretch_10', title: '10 dk esneme', xp: 10 },
      { id: 'no_music_walk', title: 'Sessiz yürüyüş (müziksiz)', xp: 15 },
      { id: 'nap_reset', title: '20 dk power nap', xp: 10 },
      { id: 'write_letter', title: 'Biri için el yazısı mektup yaz', xp: 15 },
    ],
    maintenanceTasks: [
      { id: 'meditate_10', title: '10 dakika meditasyon', xp: 10 },
      { id: 'walk_30', title: '30 dakika yürü (telefonsuz)', xp: 10 },
      { id: 'digital_sunset', title: '22:00 sonrası ekran yok', xp: 10 },
    ],
  },
  {
    id: 'fitness_60',
    title: 'Fitness Sprint',
    subtitle: '60 Gün Dönüşüm',
    duration: 60,
    icon: '💪',
    color: COLORS.health,
    description:
      '60 gün sonra aynanın karşısında farklı birini göreceksin. Antrenman ve beslenme disiplini.',
    recommendedFor: ['body', 'energy', 'confidence', 'health'],
    rules: [
      { id: 'no_alcohol', text: 'Alkol yok' },
      { id: 'no_fastfood', text: 'Fast food yok' },
      { id: 'no_skip', text: 'Antrenman atlanmaz' },
    ],
    taskPool: [
      { id: 'workout_45', title: '45 dakika antrenman', xp: 20 },
      { id: 'workout_60', title: '60 dakika antrenman', xp: 25 },
      { id: 'cardio_30', title: '30 dk kardiyo (koşu/bike)', xp: 20 },
      { id: 'hiit_20', title: '20 dk HIIT', xp: 20 },
      { id: 'protein', title: 'Günlük protein hedefi (vücut ağırlığı × 1.6g)', xp: 15 },
      { id: 'water_3l', title: '3 litre su', xp: 10 },
      { id: 'water_4l', title: '4 litre su', xp: 15 },
      { id: 'sleep_7h', title: '7+ saat uyku', xp: 15 },
      { id: 'sleep_8h', title: '8+ saat uyku', xp: 20 },
      { id: 'no_sugar_day', title: 'Bugün şeker yok', xp: 15 },
      { id: 'veggies_3', title: '3 porsiyon sebze', xp: 10 },
      { id: 'weigh_in', title: 'Sabah tartıl ve kaydet', xp: 5 },
      { id: 'progress_photo', title: 'Gelişim fotoğrafı çek', xp: 10 },
      { id: 'stretch_15', title: '15 dk mobility/esneme', xp: 10 },
      { id: 'walk_10k', title: '10,000 adım', xp: 15 },
      { id: 'walk_15k', title: '15,000 adım', xp: 25 },
      { id: 'meal_prep', title: 'Ertesi güne yemek hazırla', xp: 15 },
      { id: 'track_calories', title: 'Kalori takibi yap', xp: 10 },
      { id: 'creatine', title: 'Creatine al (5g)', xp: 5 },
      { id: 'no_sugar_drink', title: 'Şekerli içecek yok', xp: 10 },
      { id: 'posture_check', title: 'Postür / mobility rutini', xp: 10 },
      { id: 'cold_shower_fitness', title: 'Soğuk duş (2 dk)', xp: 15 },
      { id: 'abs_10', title: '10 dk karın antrenmanı', xp: 10 },
      { id: 'pullups', title: '50 şınav / barfiks (set halinde)', xp: 15 },
      { id: 'no_snacking', title: 'Öğün arası atıştırma yok', xp: 10 },
    ],
    maintenanceTasks: [
      { id: 'workout_45', title: '45 dk antrenman', xp: 15 },
      { id: 'water_3l', title: '3 litre su', xp: 5 },
      { id: 'protein', title: 'Protein hedefi', xp: 10 },
      { id: 'walk_10k', title: '10,000 adım', xp: 10 },
    ],
  },
  {
    id: 'business_90',
    title: 'Business Builder',
    subtitle: '90 Gün Girişimcilik',
    duration: 90,
    icon: '🚀',
    color: COLORS.career,
    description:
      '90 gün sonra ya işin başlamış olacak ya da kesin olarak "olmayacağını" biliyor olacaksın.',
    recommendedFor: ['career', 'money', 'skills', 'freedom'],
    rules: [
      { id: 'no_netflix', text: 'Netflix / dizi yok' },
      { id: 'no_gaming', text: 'Oyun yok' },
      { id: 'deep_work', text: 'Günde 4 saat derin çalışma' },
    ],
    taskPool: [
      { id: 'ship_something', title: 'Projeye somut katkı (kod, içerik, satış)', xp: 25 },
      { id: 'ship_feature', title: '1 feature/post canlıya al', xp: 30 },
      { id: 'learn_1h', title: '1 saat yeni beceri öğren', xp: 15 },
      { id: 'learn_2h', title: '2 saat odaklı öğrenme', xp: 25 },
      { id: 'outreach', title: '3 kişiyle iletişime geç (müşteri/partner)', xp: 20 },
      { id: 'outreach_10', title: '10 cold outreach mesajı', xp: 30 },
      { id: 'plan_tomorrow', title: 'Yarının planını yaz', xp: 10 },
      { id: 'deep_work_2', title: '2 saat telefonsuz deep work', xp: 20 },
      { id: 'deep_work_4', title: '4 saat deep work (pomodoro)', xp: 35 },
      { id: 'content_post', title: '1 içerik paylaş (X/LinkedIn/YT)', xp: 20 },
      { id: 'analytics_check', title: 'Metrikleri incele, 1 insight yaz', xp: 10 },
      { id: 'competitor_study', title: 'Bir rakibi 30 dk incele', xp: 15 },
      { id: 'customer_call', title: '1 kullanıcı/müşteri görüşmesi', xp: 30 },
      { id: 'write_sales', title: 'Satış sayfası/copy iyileştir', xp: 20 },
      { id: 'read_business', title: '30 dk iş kitabı / makale', xp: 15 },
      { id: 'podcast_learn', title: '30 dk podcast (not al)', xp: 10 },
      { id: 'networking', title: '1 yeni bağlantı kur', xp: 15 },
      { id: 'financial_review', title: 'Gelir-gider incele', xp: 10 },
      { id: 'ship_mvp_piece', title: 'MVP\'ye 1 parça ekle', xp: 25 },
      { id: 'fix_1_bug', title: '1 bug/iyileştirme tamamla', xp: 15 },
      { id: 'testimonial', title: 'Referans/yorum topla', xp: 15 },
      { id: 'email_cleanup', title: 'Inbox zero (30 dk)', xp: 10 },
      { id: 'pitch_practice', title: '2 dk pitch prova et', xp: 10 },
      { id: 'noon_review', title: 'Gün ortası hızlı review', xp: 5 },
      { id: 'eod_journal', title: 'Gün sonu kazanım + öğrenim yaz', xp: 10 },
    ],
    maintenanceTasks: [
      { id: 'deep_work_2', title: '2 saat deep work', xp: 15 },
      { id: 'content_post', title: '1 içerik paylaş', xp: 15 },
      { id: 'outreach', title: '3 outreach mesajı', xp: 15 },
      { id: 'learn_1h', title: '1 saat öğrenme', xp: 10 },
    ],
  },
  {
    id: 'early_riser_30',
    title: 'Early Riser',
    subtitle: '30 Gün 5AM Club',
    duration: 30,
    icon: '🌅',
    color: COLORS.warning,
    description:
      'Gününü güneş doğmadan kazan. 30 gün sonra "sabah insanı" olmuş olacaksın.',
    recommendedFor: ['discipline', 'energy', 'focus', 'time'],
    rules: [
      { id: 'wake_5am', text: "Saat 05:00'te kalk" },
      { id: 'sleep_2230', text: "Saat 22:30'da yatakta ol" },
      { id: 'no_phone_morning', text: 'İlk saat telefon yok' },
    ],
    taskPool: [
      { id: 'cold_shower', title: 'Soğuk duş', xp: 15 },
      { id: 'morning_workout', title: 'Sabah 20 dakika egzersiz', xp: 15 },
      { id: 'morning_workout_45', title: 'Sabah 45 dk antrenman', xp: 25 },
      { id: 'morning_read', title: '30 dakika okuma', xp: 15 },
      { id: 'morning_read_60', title: '60 dakika sabah okuma', xp: 25 },
      { id: 'plan_day', title: 'Gününü planla (3 hedef)', xp: 10 },
      { id: 'meditate_morning', title: 'Sabah 10 dk meditasyon', xp: 15 },
      { id: 'sunlight_morning', title: 'İlk 30 dk içinde güneş ışığı', xp: 15 },
      { id: 'water_wake', title: 'Uyanınca 500ml su', xp: 5 },
      { id: 'no_phone_first_hour', title: 'İlk 1 saat telefon yok', xp: 20 },
      { id: 'journal_morning', title: 'Sabah 3 satır günlük', xp: 10 },
      { id: 'stretch_morning', title: '10 dk sabah esnemesi', xp: 10 },
      { id: 'gratitude_morning', title: '3 şükür', xp: 5 },
      { id: 'visualize', title: '5 dk günü görselleştir', xp: 10 },
      { id: 'breathwork_wim', title: 'Wim Hof / kutu nefes', xp: 10 },
      { id: 'morning_walk', title: 'Sabah 20 dk yürüyüş', xp: 15 },
      { id: 'no_snooze', title: 'Snooze basma', xp: 10 },
      { id: 'no_caffeine_90', title: 'Uyanır uyanmaz kahve yok (90 dk bekle)', xp: 10 },
      { id: 'pre_sleep_routine', title: '22:00 wind-down rutini', xp: 15 },
      { id: 'read_pre_sleep', title: 'Yatmadan 20 dk okuma', xp: 10 },
      { id: 'no_screen_bed', title: 'Yatakta ekran yok', xp: 15 },
      { id: 'cool_bedroom', title: 'Yatak odası 18-20°C', xp: 5 },
      { id: 'evening_review', title: 'Gün sonu 3 kazanım yaz', xp: 10 },
      { id: 'weekly_sleep_avg', title: '7+ saat uyku ortalaması', xp: 15 },
    ],
    maintenanceTasks: [
      { id: 'no_snooze', title: 'Snooze basma', xp: 10 },
      { id: 'morning_workout', title: '20 dk sabah egzersizi', xp: 10 },
      { id: 'plan_day', title: 'Gün planı', xp: 10 },
    ],
  },
  {
    id: 'money_60',
    title: 'Money Discipline',
    subtitle: '60 Gün Para Disiplini',
    duration: 60,
    icon: '💰',
    color: COLORS.finance,
    description:
      'Gereksiz harcamayı kes, birikimi oturt. 60 gün sonra finansal kontrol sende.',
    recommendedFor: ['money', 'freedom', 'discipline', 'future'],
    rules: [
      { id: 'no_impulse', text: 'Dürtüsel alışveriş yok (48 saat bekle kuralı)' },
      { id: 'no_delivery', text: 'Yemek siparişi yok' },
      { id: 'no_subscriptions', text: 'Yeni abonelik yok' },
    ],
    taskPool: [
      { id: 'track_spending', title: 'Her harcamayı kaydet', xp: 15 },
      { id: 'save_today', title: 'Günlük tasarrufu hesaba at', xp: 20 },
      { id: 'save_10pct', title: 'Günlük gelirin %10\'unu kenara ayır', xp: 25 },
      { id: 'learn_finance', title: '15 dk finansal okuryazarlık', xp: 10 },
      { id: 'learn_invest', title: '30 dk yatırım öğrenme', xp: 20 },
      { id: 'meal_prep_money', title: 'Ev yemeği hazırla', xp: 15 },
      { id: 'budget_review', title: 'Haftalık bütçe review', xp: 10 },
      { id: 'cancel_sub', title: 'Kullanmadığın 1 aboneliği iptal et', xp: 20 },
      { id: 'no_spend_day', title: 'Bugün 0 harcama günü', xp: 30 },
      { id: 'price_compare', title: 'Büyük alım için 3 fiyat karşılaştır', xp: 10 },
      { id: 'coffee_home', title: 'Kahveyi evde yap', xp: 10 },
      { id: 'net_worth', title: 'Net değerini güncelle', xp: 10 },
      { id: 'read_finance_book', title: '20 dk finans kitabı', xp: 15 },
      { id: 'side_income', title: 'Ek gelir için 30 dk çalış', xp: 25 },
      { id: 'review_bills', title: 'Faturaları gözden geçir', xp: 10 },
      { id: 'emergency_fund', title: 'Acil fon hesabına katkı', xp: 20 },
      { id: 'invest_auto', title: 'Otomatik yatırım kontrol et', xp: 10 },
      { id: 'sell_unused', title: '1 kullanmadığın eşyayı sat', xp: 25 },
      { id: 'grocery_list', title: 'Market listesine sadık kal', xp: 10 },
      { id: 'no_delivery_day', title: 'Sipariş yok (ev yemeği)', xp: 15 },
      { id: 'financial_goal', title: 'Finansal hedefini yaz', xp: 5 },
      { id: 'skill_invest', title: 'Kazanç getirecek beceriye 30 dk', xp: 20 },
    ],
    maintenanceTasks: [
      { id: 'track_spending', title: 'Harcama takibi', xp: 10 },
      { id: 'save_today', title: 'Günlük tasarruf', xp: 15 },
      { id: 'coffee_home', title: 'Kahve evde', xp: 5 },
    ],
  },
  {
    id: 'reading_30',
    title: 'Reading Sprint',
    subtitle: '30 Gün 3 Kitap',
    duration: 30,
    icon: '📚',
    color: COLORS.primary,
    description:
      'Telefon yerine kitap. 30 gün, 3 kitap. Yeni bir beyinle çıkacaksın.',
    recommendedFor: ['focus', 'social_media', 'skills', 'anxiety'],
    rules: [
      { id: 'no_shorts', text: 'Kısa video yok (TikTok, Reels, Shorts)' },
      { id: 'no_doom_scroll', text: 'Amaçsız telefon scroll yok' },
      { id: 'book_first', text: 'Önce kitap, sonra ekran' },
    ],
    taskPool: [
      { id: 'read_60', title: '60 dakika kitap oku', xp: 25 },
      { id: 'read_90', title: '90 dakika kitap oku', xp: 35 },
      { id: 'read_30_min', title: '30 dk kitap oku', xp: 15 },
      { id: 'notes', title: 'Not al (3 cümle)', xp: 10 },
      { id: 'summarize', title: 'Okuduğunu bir cümlede özetle', xp: 10 },
      { id: 'no_screen_bed', title: 'Yatakta ekran yok', xp: 15 },
      { id: 'highlight_5', title: '5 kritik cümleyi işaretle', xp: 10 },
      { id: 'book_goal_today', title: 'Bugünkü sayfa hedefini bitir', xp: 20 },
      { id: 'read_morning', title: 'Sabah kitap oku', xp: 15 },
      { id: 'read_commute', title: 'Yolda kitap (telefonsuz)', xp: 15 },
      { id: 'share_insight', title: 'Öğrendiğini biriyle paylaş', xp: 10 },
      { id: 'apply_insight', title: 'Kitaptan 1 şeyi hayata geçir', xp: 25 },
      { id: 'library_hour', title: 'Kütüphanede/kafede 1 saat oku', xp: 20 },
      { id: 'no_shorts_day', title: 'Bugün kısa video yok', xp: 15 },
      { id: 'offline_hour', title: '1 saat uçak modu', xp: 15 },
      { id: 'reread_chapter', title: 'Bir bölümü tekrar oku', xp: 10 },
      { id: 'read_outside', title: 'Dışarıda kitap oku', xp: 15 },
      { id: 'book_review', title: 'Bitirdiğin kitap için mini review yaz', xp: 20 },
      { id: 'analog_notes', title: 'El yazısıyla not tut', xp: 10 },
      { id: 'no_doom', title: 'Doom scroll yok (tamamen)', xp: 20 },
    ],
    maintenanceTasks: [
      { id: 'read_30_min', title: '30 dk kitap oku', xp: 10 },
      { id: 'notes', title: '3 cümle not al', xp: 5 },
      { id: 'no_shorts_day', title: 'Kısa video yok', xp: 10 },
    ],
  },
];

// ---------- public API ----------

export const getSprintById = (id) => SPRINTS.find((s) => s.id === id) || null;

/**
 * Current 1-indexed day of an active sprint, capped at duration.
 * @param {{startedAt: string, sprintId: string}} activeSprint
 */
export const getSprintDay = (activeSprint) => {
  if (!activeSprint?.startedAt) return 1;
  const sprint = getSprintById(activeSprint.sprintId);
  if (!sprint) return 1;
  const start = new Date(activeSprint.startedAt);
  const now = new Date();
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((today.getTime() - startDate.getTime()) / 86400000);
  return Math.min(Math.max(diffDays + 1, 1), sprint.duration);
};

export const isSprintFinished = (activeSprint) => {
  if (!activeSprint) return false;
  const sprint = getSprintById(activeSprint.sprintId);
  if (!sprint) return false;
  return getSprintDay(activeSprint) >= sprint.duration;
};

/**
 * Deterministically pick the day's tasks from the sprint's pool based on
 * sprintId + date + tier. Same inputs → same tasks, so progress is stable
 * across app restarts within the same day.
 *
 * @param {{sprintId: string, tier?: number, startedAt?: string}} activeSprint
 * @returns {Array<{id: string, title: string, xp: number}>}
 */
export const getTodaysTasks = (activeSprint) => {
  if (!activeSprint) return [];
  const sprint = getSprintById(activeSprint.sprintId);
  if (!sprint) return [];
  const tier = activeSprint.tier || 1;
  const { tasksPerDay, xpMultiplier } = getTierConfig(tier);
  const pool = sprint.taskPool || sprint.dailyTasks || [];
  const seed = `${sprint.id}-${tier}-${ymd(new Date())}`;
  const picked = pickN(pool, tasksPerDay, seed);
  return picked.map((t) => ({ ...t, xp: Math.round(t.xp * xpMultiplier) }));
};

/**
 * Maintenance mode tasks — a lighter daily set shown after a sprint completes
 * so users keep the habit without starting a new sprint.
 */
export const getMaintenanceTasks = (sprintId) => {
  const sprint = getSprintById(sprintId);
  if (!sprint) return [];
  return sprint.maintenanceTasks || [];
};

/**
 * Tier a user has unlocked for a given sprint based on past completions.
 * - 1 completion → tier 2 unlocked
 * - 2 completions → tier 3 unlocked
 * Max 3.
 */
export const getUnlockedTier = (sprintId, sprintHistory = []) => {
  const completed = sprintHistory.filter(
    (h) => h?.sprintId === sprintId && h?.status === 'completed',
  ).length;
  if (completed >= 2) return 3;
  if (completed >= 1) return 2;
  return 1;
};

/**
 * Recommend a sprint based on the user's onboarding assessment.
 * `userProfile.goals` is an array of tag strings (e.g. ['focus', 'body']).
 * Returns the best-matching sprint id, or null if no data.
 */
export const recommendSprint = (userProfile) => {
  const goals = userProfile?.goals || [];
  if (!goals.length) return null;
  let best = null;
  let bestScore = -1;
  for (const sprint of SPRINTS) {
    const tags = sprint.recommendedFor || [];
    const score = tags.reduce((acc, tag) => acc + (goals.includes(tag) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = sprint.id;
    }
  }
  return bestScore > 0 ? best : null;
};
