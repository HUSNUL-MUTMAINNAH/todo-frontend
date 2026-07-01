import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { View, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions } from '../utils/notifications';
import { notificationService } from '../services/notificationService';

function RootLayoutContent() {
  const { isLoading, token } = useAuth();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (!token) return;

    // Ask for permissions on login/load
    requestNotificationPermissions();

    // Listen for incoming notifications when app is active
    const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
      const data = notification.request.content.data || {};
      const taskId = data.taskId;
      const title = notification.request.content.title || 'Reminder Task';
      const message = notification.request.content.body || '';

      try {
        await notificationService.createNotificationLog(
          taskId ? Number(taskId) : null,
          title,
          message
        );
      } catch (err) {
        console.error('Failed to log push notification in backend:', err);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [token]);

  // Create Paper Theme based on custom colors
  const paperTheme = {
    ...(isDark ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: colors.primary,
      accent: colors.accent,
      background: colors.background,
      surface: colors.card,
      text: colors.textPrimary,
    },
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth Group */}
        <Stack.Screen name="(auth)/login" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(auth)/register" options={{ gestureEnabled: false }} />
        
        {/* Tabs Interface */}
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />

        {/* Task Forms & Details */}
        <Stack.Screen name="task/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="task/add" options={{ headerShown: false }} />
        <Stack.Screen name="task/edit/[id]" options={{ headerShown: false }} />

        {/* Notification Center */}
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
