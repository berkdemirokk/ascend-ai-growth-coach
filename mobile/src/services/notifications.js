import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
  // Cancel existing daily reminder
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule daily at 9:00 AM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to level up! 🚀",
      body: "Your daily action is waiting. Don't break your streak!",
      sound: true,
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });
};

export const scheduleStreakReminder = async () => {
  // Evening reminder if action not completed - schedule for 8 PM
  const now = new Date();
  const evening = new Date();
  evening.setHours(20, 0, 0, 0);

  if (now < evening) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Your streak is in danger! 🔥",
        body: "Complete today's action before midnight to keep your streak alive!",
        sound: true,
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: false,
      },
    });
  }
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
