import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  } as any),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

export async function scheduleTaskReminder(taskId: number, taskTitle: string, reminderDate: Date): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  // 1. Ensure permission is granted
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  // 2. Cancel existing reminder for this task first to avoid duplicates
  await cancelTaskReminder(taskId);

  // 3. Verify reminder date is in the future
  if (reminderDate <= new Date()) {
    return null;
  }

  // 4. Schedule new notification
  const notificationId = await Notifications.scheduleNotificationAsync({
    identifier: `task-reminder-${taskId}`,
    content: {
      title: 'Reminder Task',
      body: `Deadline tugas "${taskTitle}" akan segera berakhir.`,
      data: { taskId },
      sound: true,
    },
    trigger: { date: reminderDate } as any,
  });

  return notificationId;
}

export async function cancelTaskReminder(taskId: number): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(`task-reminder-${taskId}`);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}
