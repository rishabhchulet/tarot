import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === 'web') {
    return null; // Web doesn't support push notifications in this context
  }

  let token;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }
  
  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push token:', token);

  return token;
};

export const scheduleNotification = async (hour: number = 9, minute: number = 0) => {
  if (Platform.OS === 'web') {
    return; // Web doesn't support scheduled notifications
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your reflection is ready for you ✨',
      body: 'Take a moment to connect with your inner wisdom today.',
      sound: 'default',
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
};

export const cancelAllNotifications = async () => {
  if (Platform.OS === 'web') {
    return;
  }
  
  await Notifications.cancelAllScheduledNotificationsAsync();
};