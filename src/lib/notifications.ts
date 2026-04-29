import { Capacitor } from '@capacitor/core';

let module: typeof import('@capacitor/local-notifications') | null = null;
let loadAttempted = false;

const REMINDER_ID = 1001;

async function load() {
  if (loadAttempted) return module;
  loadAttempted = true;
  if (!Capacitor.isNativePlatform()) return null;
  try {
    module = await import('@capacitor/local-notifications');
  } catch {
    module = null;
  }
  return module;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const mod = await load();
  if (!mod) return false;
  try {
    const current = await mod.LocalNotifications.checkPermissions();
    if (current.display === 'granted') return true;
    if (current.display === 'denied') return false;
    const result = await mod.LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleDailyReminder(hour: number, minute: number, name?: string): Promise<boolean> {
  const mod = await load();
  if (!mod) return false;
  try {
    await mod.LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
    const greeting = name ? `${name}, bugünün görevi seni bekliyor.` : 'Bugünün görevi seni bekliyor.';
    await mod.LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: 'Ascend',
          body: greeting,
          schedule: {
            on: { hour, minute },
            allowWhileIdle: true,
            repeats: true,
          },
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelDailyReminder() {
  const mod = await load();
  if (!mod) return;
  try {
    await mod.LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  } catch {
    // ignore
  }
}
