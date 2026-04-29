import { Share } from 'react-native';

const APP_URL = 'https://apps.apple.com/app/ascend-monk-mode';

export async function shareStreak({ streak, name, lang = 'tr' }) {
  const messages = {
    tr: streak === 0
      ? `${name ? name + ', ' : ''}Monk Mode başlatıyorum 🔥 Disiplin. Odak. Tekrar.\n\n${APP_URL}`
      : `${streak} gün — Monk Mode sürüyor 🔥\nDisiplin. Odak. Tekrar.\n\nSen de katıl: ${APP_URL}`,
    en: streak === 0
      ? `${name ? name + ', ' : ''}Starting Monk Mode 🔥 Discipline. Focus. Repeat.\n\n${APP_URL}`
      : `${streak} days — Monk Mode running 🔥\nDiscipline. Focus. Repeat.\n\nJoin me: ${APP_URL}`,
    ar: streak === 0
      ? `أبدأ وضع الراهب 🔥 انضباط. تركيز. تكرار.\n\n${APP_URL}`
      : `${streak} يوم — وضع الراهب مستمر 🔥\n\nانضم: ${APP_URL}`,
  };

  const message = messages[lang] || messages.en;

  try {
    await Share.share({
      message,
      title: 'Monk Mode 🔥',
      url: APP_URL,
    });
    return true;
  } catch (e) {
    console.warn('Share failed:', e?.message);
    return false;
  }
}
