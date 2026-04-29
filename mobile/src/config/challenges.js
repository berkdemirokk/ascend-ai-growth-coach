// Daily rotating mini-challenges — shown on top of the regular sprint tasks
// for extra XP. One challenge per day, picked deterministically from the pool.

const hash = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const ymd = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const CHALLENGE_POOL = [
  { id: 'call_parent', title: 'Anne/babanı ara', emoji: '📞', xp: 25 },
  { id: 'compliment', title: 'Birine samimi bir iltifat et', emoji: '🤝', xp: 15 },
  { id: 'no_complain', title: '24 saat hiç şikayet etme', emoji: '🤫', xp: 30 },
  { id: 'gratitude_5', title: '5 şey için şükret (yazılı)', emoji: '🙏', xp: 20 },
  { id: 'stranger_talk', title: 'Bir yabancıyla 2 dk sohbet et', emoji: '💬', xp: 25 },
  { id: 'silent_hour', title: '1 saat tamamen sessizlikte kal', emoji: '🔇', xp: 20 },
  { id: 'cold_2min', title: '2 dakika soğuk duş', emoji: '🥶', xp: 30 },
  { id: 'phone_off_2h', title: 'Telefon 2 saat kapalı kalsın', emoji: '📵', xp: 35 },
  { id: 'pushup_100', title: 'Gün içinde 100 şınav (set halinde)', emoji: '💪', xp: 30 },
  { id: 'read_45', title: 'Tek oturuşta 45 dk kitap oku', emoji: '📖', xp: 25 },
  { id: 'no_sugar_full', title: 'Bugün 0 şeker', emoji: '🍬', xp: 25 },
  { id: 'write_future', title: 'Gelecekteki kendine mektup yaz', emoji: '✉️', xp: 20 },
  { id: 'meditate_20', title: '20 dk meditasyon', emoji: '🧘', xp: 25 },
  { id: 'early_wake', title: 'Normalden 1 saat önce kalk', emoji: '🌅', xp: 30 },
  { id: 'walk_outside_60', title: 'Doğada 60 dk yürü', emoji: '🌲', xp: 30 },
  { id: 'no_complain_bonus', title: 'Hiç bahane üretme günü', emoji: '🎯', xp: 25 },
  { id: 'donate_time', title: 'Birine yardım et (beklentisiz)', emoji: '❤️', xp: 25 },
  { id: 'declutter_10', title: '10 şeyi at/bağışla', emoji: '🗑️', xp: 20 },
  { id: 'learn_new_word', title: 'Yeni bir kelime öğren ve kullan', emoji: '📚', xp: 10 },
  { id: 'reverse_habit', title: 'Kötü bir alışkanlığın tersini yap', emoji: '🔄', xp: 25 },
  { id: 'creative_30', title: '30 dk yaratıcı iş (çizim/yazı/müzik)', emoji: '🎨', xp: 25 },
  { id: 'fast_16', title: '16 saat aralıklı oruç', emoji: '⏳', xp: 25 },
  { id: 'handwrite_plan', title: 'Haftalık planını el yazısıyla yaz', emoji: '📝', xp: 20 },
  { id: 'no_social_day', title: 'Bugün sosyal medya 0', emoji: '🚫', xp: 35 },
  { id: 'apologize', title: 'Geç kaldığın bir özür dile', emoji: '💌', xp: 30 },
  { id: 'morning_silence', title: 'İlk saat tam sessizlik', emoji: '🌄', xp: 20 },
  { id: 'read_opposite', title: 'Görüşüne zıt bir makale oku', emoji: '⚖️', xp: 20 },
  { id: 'breathe_box_10', title: '10 dk kutu nefes', emoji: '🫁', xp: 15 },
  { id: 'finish_pending', title: 'Erteleği bir işi bitir', emoji: '✅', xp: 30 },
  { id: 'silent_dinner', title: 'Akşam yemeğini telefonsuz ye', emoji: '🍽️', xp: 15 },
];

/**
 * Deterministic daily challenge — same day → same challenge.
 * @param {string} userId - stable per-user seed (fallback: 'guest')
 */
export const getDailyChallenge = (userId = 'guest') => {
  const seed = `${userId}-${ymd(new Date())}`;
  const idx = hash(seed) % CHALLENGE_POOL.length;
  return CHALLENGE_POOL[idx];
};
