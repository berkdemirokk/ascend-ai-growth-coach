import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import i18n from '../i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Schedulable trigger shape changed in expo-notifications 0.28+ (SDK 52).
// Fall back to the legacy shape on older installs so either version works.
const SchedulableTriggerInputTypes =
  Notifications.SchedulableTriggerInputTypes ?? {};

const DAILY_REMINDER_ID = 'ascend-daily-reminder';
const EVENING_REMINDER_ID = 'ascend-evening-reminder';
const WEEKLY_RECAP_ID = 'ascend-weekly-recap';
const STREAK_AT_RISK_ID = 'ascend-streak-at-risk';
const COMEBACK_ID = 'ascend-comeback';

export const requestNotificationPermissions = async () => {
  if (!Device.isDevice) {
    console.log('Notifications require a physical device');
    return false;
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return false;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Ascend',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  return true;
};

export const scheduleDailyReminder = async () => {
  // Replace any previously scheduled copy of the same reminder so we don't
  // pile up duplicates every app launch.
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
  } catch {
    // no-op — notification may not exist yet
  }

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: i18n.t('notifications.reminderTitleProgress', { streak: '' }).trim(),
      body: i18n.t('notifications.reminderBodyProgress'),
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY ?? 'daily',
      hour: 9,
      minute: 0,
    },
  });
};

export const scheduleStreakReminder = async () => {
  // Evening reminder at 8 PM today if we're still before 8 PM.
  const now = new Date();
  const evening = new Date();
  evening.setHours(20, 0, 0, 0);
  if (now >= evening) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(EVENING_REMINDER_ID);
  } catch {
    // no-op
  }

  await Notifications.scheduleNotificationAsync({
    identifier: EVENING_REMINDER_ID,
    content: {
      title: i18n.t('notifications.reminderTitleDanger', { streak: '' }).replace('  ', ' ').trim(),
      body: i18n.t('notifications.reminderBodyDanger'),
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE ?? 'date',
      date: evening,
    },
  });
};

/**
 * Streak-at-risk: schedule a 21:00 push for today only IF the user hasn't
 * completed today's lesson. The body is loss-aversion framed because that's
 * empirically the strongest re-engagement trigger. Re-call on every app open
 * and on every lesson completion to keep state right.
 *
 * @param {Object} ctx
 * @param {boolean} ctx.todayCompleted
 * @param {number} ctx.currentStreak
 * @param {boolean} ctx.onVacation
 */
export const scheduleStreakAtRiskReminder = async ({
  todayCompleted,
  currentStreak,
  onVacation,
}) => {
  // Always cancel any existing copy first — we re-derive on every call.
  try {
    await Notifications.cancelScheduledNotificationAsync(STREAK_AT_RISK_ID);
  } catch {}

  // No-op if user already completed today, has no streak to lose, or is on
  // vacation (streak frozen — no risk).
  if (todayCompleted) return;
  if ((currentStreak || 0) < 2) return;
  if (onVacation) return;

  const now = new Date();
  const target = new Date();
  target.setHours(21, 0, 0, 0);
  if (now >= target) return; // too late today, daily reminder already covers tomorrow

  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_AT_RISK_ID,
    content: {
      title: i18n.t(
        'notifications.streakAtRiskTitle',
        '🔥 {{streak}} gün tehlikede',
        { streak: currentStreak },
      ),
      body: i18n.t(
        'notifications.streakAtRiskBody',
        'Bugün ders yapmadın. 3 saat içinde gün biter — streak\'ini koru, sadece 5 dakika.',
      ),
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE ?? 'date',
      date: target,
    },
  });
};

/**
 * Comeback: when a user has been gone 3+ days, schedule a one-shot
 * re-engagement push for tomorrow morning. Cancelled the moment they open
 * the app again, so it only fires for genuine drop-offs.
 *
 * @param {Object} ctx
 * @param {string|null} ctx.lastCompletedDate
 */
export const scheduleComebackReminder = async ({ lastCompletedDate }) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(COMEBACK_ID);
  } catch {}
  if (!lastCompletedDate) return;
  const last = new Date(lastCompletedDate);
  if (Number.isNaN(last.getTime())) return;
  const daysSince = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince < 3) return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    identifier: COMEBACK_ID,
    content: {
      title: i18n.t('notifications.comebackTitle', 'Geri dön. Tek bir ders.'),
      body: i18n.t(
        'notifications.comebackBody',
        '{{days}} gündür yoksun. Streak'ini sıfırlama — sadece 5 dakika, yeniden başla.',
        { days: daysSince },
      ),
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE ?? 'date',
      date: tomorrow,
    },
  });
};

export const cancelComebackReminder = async () => {
  try {
    await Notifications.cancelScheduledNotificationAsync(COMEBACK_ID);
  } catch {}
};

/**
 * Schedule a weekly recap notification — every Sunday at 19:00 local time.
 * The notification is the come-back trigger that pulls the user into the
 * Stats tab on the slowest engagement day of the week.
 */
export const scheduleWeeklyRecap = async () => {
  try {
    await Notifications.cancelScheduledNotificationAsync(WEEKLY_RECAP_ID);
  } catch {
    // no-op
  }
  await Notifications.scheduleNotificationAsync({
    identifier: WEEKLY_RECAP_ID,
    content: {
      title: i18n.t(
        'notifications.weeklyRecapTitle',
        'Haftan nasıl geçti? 📊',
      ),
      body: i18n.t(
        'notifications.weeklyRecapBody',
        'Stats sekmesinden 7 günlük özetine bak — yeni hafta yarın başlıyor.',
      ),
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.WEEKLY ?? 'weekly',
      // 1 = Sunday in expo-notifications' weekly trigger
      weekday: 1,
      hour: 19,
      minute: 0,
    },
  });
};

export const sendCelebrationNotification = async (title, body) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null, // immediate
  });
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
