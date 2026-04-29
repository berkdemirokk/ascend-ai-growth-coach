// Onboarding assessment — 5 questions that build a userProfile with `goals`
// tags. Tags feed recommendSprint() in sprints.js.

export const ASSESSMENT_QUESTIONS = [
  {
    id: 'q_pain',
    title: 'En büyük sıkıntın ne?',
    subtitle: 'Birini seç — en çok hangisi seni rahatsız ediyor.',
    multi: false,
    options: [
      { id: 'scroll', label: 'Telefondan kopamıyorum', emoji: '📱', tags: ['focus', 'social_media'] },
      { id: 'body', label: 'Kendimi fiziksel olarak kötü hissediyorum', emoji: '💪', tags: ['body', 'energy', 'health'] },
      { id: 'money', label: 'Para / iş durumum kötü', emoji: '💰', tags: ['money', 'career'] },
      { id: 'lazy', label: 'Disiplinsizim, erteleyiciyim', emoji: '🛋️', tags: ['discipline', 'focus'] },
      { id: 'anxious', label: 'Kafam karışık, anksiyetem var', emoji: '🌊', tags: ['anxiety', 'stress', 'focus'] },
    ],
  },
  {
    id: 'q_goal',
    title: 'Seni en çok motive eden ne?',
    subtitle: 'Birini seç.',
    multi: false,
    options: [
      { id: 'freedom', label: 'Finansal özgürlük', emoji: '🕊️', tags: ['money', 'freedom', 'career'] },
      { id: 'aesthetic', label: 'Daha iyi görünmek', emoji: '👀', tags: ['body', 'confidence'] },
      { id: 'confidence', label: 'Özgüven kazanmak', emoji: '🦁', tags: ['confidence', 'discipline'] },
      { id: 'peace', label: 'İç huzur', emoji: '☮️', tags: ['anxiety', 'focus', 'stress'] },
      { id: 'skills', label: 'Yeni beceriler', emoji: '🧠', tags: ['skills', 'career'] },
    ],
  },
  {
    id: 'q_time',
    title: 'Günde kaç saat ayırabilirsin?',
    subtitle: 'Gerçekçi ol.',
    multi: false,
    options: [
      { id: 'time_30', label: '30 dakika', emoji: '⏱️', tags: ['time_low'] },
      { id: 'time_1h', label: '1 saat', emoji: '⏰', tags: ['time_mid'] },
      { id: 'time_2h', label: '2+ saat', emoji: '🔥', tags: ['time_high', 'discipline'] },
    ],
  },
  {
    id: 'q_enemy',
    title: 'En büyük düşmanın ne?',
    subtitle: 'Neyden kurtulmak istiyorsun.',
    multi: true,
    options: [
      { id: 'e_scroll', label: 'TikTok / Shorts', emoji: '🌀', tags: ['focus', 'social_media'] },
      { id: 'e_porn', label: 'Porno', emoji: '🚫', tags: ['focus', 'discipline'] },
      { id: 'e_junk', label: 'Abur cubur', emoji: '🍔', tags: ['body', 'health'] },
      { id: 'e_late', label: 'Geç yatmak', emoji: '🌙', tags: ['discipline', 'energy'] },
      { id: 'e_games', label: 'Oyun', emoji: '🎮', tags: ['focus', 'career'] },
      { id: 'e_spend', label: 'Gereksiz harcama', emoji: '💸', tags: ['money', 'discipline'] },
    ],
  },
  {
    id: 'q_commit',
    title: 'Ne kadar ciddisin?',
    subtitle: 'Dürüst ol — bu sana söz.',
    multi: false,
    options: [
      { id: 'c_try', label: 'Denemek istiyorum', emoji: '🌱', tags: ['beginner'] },
      { id: 'c_serious', label: 'Değişmek istiyorum', emoji: '⚡', tags: ['discipline'] },
      { id: 'c_allin', label: 'Hayatımı değiştireceğim', emoji: '🔥', tags: ['discipline', 'freedom'] },
    ],
  },
];

/**
 * Turn an assessment answer map { questionId: optionId | optionId[] } into
 * a userProfile with a flat tag list.
 */
export const buildUserProfile = (answers = {}) => {
  const goals = new Set();
  for (const q of ASSESSMENT_QUESTIONS) {
    const raw = answers[q.id];
    if (!raw) continue;
    const ids = Array.isArray(raw) ? raw : [raw];
    for (const id of ids) {
      const opt = q.options.find((o) => o.id === id);
      if (opt?.tags) opt.tags.forEach((t) => goals.add(t));
    }
  }
  return { goals: Array.from(goals), answers };
};
