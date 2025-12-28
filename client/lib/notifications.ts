import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { AlertLevel } from './types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

export async function sendCO2Alert(
  level: AlertLevel,
  co2: number,
  recommendation: string
): Promise<void> {
  if (Platform.OS === 'web') return;
  
  const titles: Record<AlertLevel, string> = {
    good: 'Air Quality Good',
    advisory: 'Air Quality Advisory',
    warning: 'Air Quality Warning',
    critical: 'Critical Air Quality Alert',
  };
  
  const priorities: Record<AlertLevel, Notifications.AndroidNotificationPriority> = {
    good: Notifications.AndroidNotificationPriority.LOW,
    advisory: Notifications.AndroidNotificationPriority.DEFAULT,
    warning: Notifications.AndroidNotificationPriority.HIGH,
    critical: Notifications.AndroidNotificationPriority.MAX,
  };
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: titles[level],
      body: `CO2 level: ${co2} ppm. ${recommendation}`,
      sound: level === 'critical' || level === 'warning' ? 'default' : undefined,
      priority: priorities[level],
      data: { level, co2 },
    },
    trigger: null,
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function addNotificationListener(
  handler: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(handler);
}

export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}
