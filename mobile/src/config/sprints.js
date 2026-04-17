// Monk Mode sprint catalog.
//
// Each sprint is a time-bounded program with a finite duration, daily tasks,
// and rules. Completing a sprint earns a certificate and meta-XP.
//
// Task/rule IDs are stable — renaming them breaks persisted state.

import { COLORS } from './constants';

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
    rules: [
      { id: 'no_social', text: 'Sosyal medya yok (Instagram, TikTok, X, YouTube Shorts)' },
      { id: 'no_porn', text: 'Porno yok' },
      { id: 'no_sugar', text: 'İşlenmiş şeker yok' },
    ],
    dailyTasks: [
      { id: 'meditate_10', title: '10 dakika meditasyon', xp: 15 },
      { id: 'read_20', title: '20 dakika kitap oku', xp: 15 },
      { id: 'walk_30', title: '30 dakika yürü (telefonsuz)', xp: 15 },
      { id: 'journal', title: 'Gün sonu 3 satır günlük yaz', xp: 10 },
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
    rules: [
      { id: 'no_alcohol', text: 'Alkol yok' },
      { id: 'no_fastfood', text: 'Fast food yok' },
      { id: 'no_skip', text: 'Antrenman atlanmaz' },
    ],
    dailyTasks: [
      { id: 'workout_45', title: '45 dakika antrenman', xp: 20 },
      { id: 'protein', title: 'Günlük protein hedefi (vücut ağırlığı × 1.6g)', xp: 15 },
      { id: 'water_3l', title: '3 litre su', xp: 10 },
      { id: 'sleep_7h', title: '7+ saat uyku', xp: 15 },
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
    rules: [
      { id: 'no_netflix', text: 'Netflix / dizi yok' },
      { id: 'no_gaming', text: 'Oyun yok' },
      { id: 'deep_work', text: 'Günde 4 saat derin çalışma' },
    ],
    dailyTasks: [
      { id: 'ship_something', title: 'Projeye somut katkı yap (kod, içerik, satış)', xp: 25 },
      { id: 'learn_1h', title: '1 saat yeni beceri öğren', xp: 15 },
      { id: 'outreach', title: '3 kişiyle iletişime geç (müşteri/partner)', xp: 20 },
      { id: 'plan_tomorrow', title: 'Yarının planını yaz', xp: 10 },
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
    rules: [
      { id: 'wake_5am', text: 'Saat 05:00\'te kalk' },
      { id: 'sleep_2230', text: 'Saat 22:30\'da yatakta ol' },
      { id: 'no_phone_morning', text: 'İlk saat telefon yok' },
    ],
    dailyTasks: [
      { id: 'cold_shower', title: 'Soğuk duş', xp: 15 },
      { id: 'morning_workout', title: 'Sabah 20 dakika egzersiz', xp: 15 },
      { id: 'morning_read', title: '30 dakika okuma', xp: 15 },
      { id: 'plan_day', title: 'Gününü planla (3 hedef)', xp: 10 },
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
    rules: [
      { id: 'no_impulse', text: 'Dürtüsel alışveriş yok (48 saat bekle kuralı)' },
      { id: 'no_delivery', text: 'Yemek siparişi yok' },
      { id: 'no_subscriptions', text: 'Yeni abonelik yok' },
    ],
    dailyTasks: [
      { id: 'track_spending', title: 'Her harcamayı kaydet', xp: 15 },
      { id: 'save_today', title: 'Günlük tasarrufu hesaba at', xp: 20 },
      { id: 'learn_finance', title: '15 dk finansal okuryazarlık', xp: 10 },
      { id: 'meal_prep', title: 'Ev yemeği hazırla', xp: 15 },
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
    rules: [
      { id: 'no_shorts', text: 'Kısa video yok (TikTok, Reels, Shorts)' },
      { id: 'no_doom_scroll', text: 'Amaçsız telefon scroll yok' },
      { id: 'book_first', text: 'Önce kitap, sonra ekran' },
    ],
    dailyTasks: [
      { id: 'read_60', title: '60 dakika kitap oku', xp: 25 },
      { id: 'notes', title: 'Not al (3 cümle)', xp: 10 },
      { id: 'summarize', title: 'Okuduğunu bir cümlede özetle', xp: 10 },
      { id: 'no_screen_bed', title: 'Yatakta ekran yok', xp: 15 },
    ],
  },
];

export const getSprintById = (id) => SPRINTS.find((s) => s.id === id) || null;

/**
 * Compute the current day (1-indexed) of an active sprint based on its
 * start timestamp. Returns the day capped at duration.
 *
 * @param {{startedAt: string, sprintId: string}} activeSprint
 * @returns {number} current day (1 through duration)
 */
export const getSprintDay = (activeSprint) => {
  if (!activeSprint?.startedAt) return 1;
  const sprint = getSprintById(activeSprint.sprintId);
  if (!sprint) return 1;
  const start = new Date(activeSprint.startedAt);
  const now = new Date();
  const startDate = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.min(Math.max(diffDays + 1, 1), sprint.duration);
};

/**
 * True if the sprint is past its duration (ready to be completed).
 */
export const isSprintFinished = (activeSprint) => {
  if (!activeSprint) return false;
  const sprint = getSprintById(activeSprint.sprintId);
  if (!sprint) return false;
  return getSprintDay(activeSprint) >= sprint.duration;
};
