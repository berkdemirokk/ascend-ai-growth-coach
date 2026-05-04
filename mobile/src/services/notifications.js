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
