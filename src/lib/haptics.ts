import { Capacitor } from '@capacitor/core';

let hapticsModule: typeof import('@capacitor/haptics') | null = null;
let hapticsLoadAttempted = false;

async function loadHaptics() {
  if (hapticsLoadAttempted) return hapticsModule;
  hapticsLoadAttempted = true;
  if (!Capacitor.isNativePlatform()) return null;
  try {
    hapticsModule = await import('@capacitor/haptics');
  } catch {
    hapticsModule = null;
  }
  return hapticsModule;
}

export async function hapticSuccess() {
  const mod = await loadHaptics();
  if (!mod) return;
  try {
    await mod.Haptics.notification({ type: mod.NotificationType.Success });
  } catch {
    // ignore
  }
}

export async function hapticLight() {
  const mod = await loadHaptics();
  if (!mod) return;
  try {
    await mod.Haptics.impact({ style: mod.ImpactStyle.Light });
  } catch {
    // ignore
  }
}

export async function hapticMedium() {
  const mod = await loadHaptics();
  if (!mod) return;
  try {
    await mod.Haptics.impact({ style: mod.ImpactStyle.Medium });
  } catch {
    // ignore
  }
}
