import { Capacitor } from '@capacitor/core';

export async function shareStreak(streak: number, name?: string): Promise<boolean> {
  const text = streak === 0
    ? `${name ? name + ', ' : ''}Monk mode başlatıyorum 🔥 Disiplin. Odak. Tekrar.`
    : `${streak} gün — monk mode sürüyor 🔥 Sen de başla, alevi söndürme.`;
  const url = 'https://apps.apple.com/app/ascend-monk-mode';

  if (Capacitor.isNativePlatform()) {
    try {
      const mod = await import('@capacitor/share');
      await mod.Share.share({
        title: 'Ascend serim 🔥',
        text,
        url,
        dialogTitle: 'Serini paylaş',
      });
      return true;
    } catch {
      return false;
    }
  }

  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await (navigator as Navigator & { share: (data: { title: string; text: string; url: string }) => Promise<void> }).share({
        title: 'Ascend serim 🔥',
        text,
        url,
      });
      return true;
    } catch {
      return false;
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
