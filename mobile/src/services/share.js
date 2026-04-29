import { Share } from 'react-native';

const APP_URL = 'https://apps.apple.com/app/ascend-monk-mode';

/**
 * Text-only share fallback (fast, always available).
 */
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

/**
 * Image share — captures the StreakShareCard ref and shares as PNG.
 * Requires react-native-view-shot to be installed.
 *
 * @param {React.MutableRefObject} cardRef - ref to <StreakShareCard />
 */
export async function shareStreakImage(cardRef) {
  try {
    const { captureRef } = await import('react-native-view-shot').catch(() => ({}));
    if (!captureRef || !cardRef?.current) {
      // Fallback to text share
      return false;
    }
    const uri = await captureRef(cardRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
    await Share.share({
      url: uri, // iOS supports url in Share
      message: 'Monk Mode 🔥',
    });
    return true;
  } catch (e) {
    console.warn('Image share failed:', e?.message);
    return false;
  }
}
