import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { Button, Divider, IconButton } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { notificationService, NotificationLog } from '../services/notificationService';

export default function NotificationsScreen() {
  const { colors, theme } = useTheme();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const fetched = await notificationService.getNotifications();
      setNotifications(fetched);
    } catch (error) {
      console.error('Failed to load notifications history:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      loadNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await notificationService.deleteAllNotifications();
      loadNotifications();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginLeft: 12,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    scrollContent: {
      padding: 16,
    },
    topActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    actionBtn: {
      borderColor: colors.border,
      borderWidth: 1.5,
      borderRadius: 8,
    },
    notificationCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: colors.shadow,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    unreadCard: {
      borderColor: colors.primary,
      backgroundColor: theme === 'dark' ? '#1D2A30' : '#E0F2F1',
    },
    cardContent: {
      flex: 1,
      marginRight: 10,
    },
    notifTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    notifMessage: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 18,
      marginBottom: 6,
    },
    notifTime: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: 'bold',
    },
    cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: 'bold',
      marginTop: 12,
      textAlign: 'center',
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pusat Notifikasi</Text>
        </View>
        {notifications.length > 0 && (
          <IconButton
            icon="delete-sweep-outline"
            size={24}
            iconColor="#E57373"
            onPress={handleDeleteAll}
          />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        {notifications.length > 0 && (
          <View style={styles.topActions}>
            <Button
              mode="outlined"
              style={styles.actionBtn}
              textColor={colors.textPrimary}
              labelStyle={{ fontSize: 11, fontWeight: 'bold' }}
              onPress={handleMarkAllRead}
              icon="checkbox-multiple-marked-outline"
            >
              Tandai Semua Dibaca
            </Button>
            <Button
              mode="outlined"
              style={styles.actionBtn}
              textColor="#E57373"
              labelStyle={{ fontSize: 11, fontWeight: 'bold' }}
              onPress={handleDeleteAll}
              icon="delete-outline"
            >
              Hapus Semua
            </Button>
          </View>
        )}

        <View>
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="bell-off-outline" size={60} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Tidak ada riwayat notifikasi</Text>
            </View>
          ) : (
            notifications.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                style={[styles.notificationCard, !notif.is_read && styles.unreadCard]}
                onPress={() => !notif.is_read && handleMarkAsRead(notif.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifMessage}>{notif.message}</Text>
                  <Text style={styles.notifTime}>{formatTime(notif.created_at)}</Text>
                </View>

                <View style={styles.cardActions}>
                  {!notif.is_read && (
                    <IconButton
                      icon="eye-outline"
                      size={18}
                      iconColor={colors.primary}
                      onPress={() => handleMarkAsRead(notif.id)}
                    />
                  )}
                  <IconButton
                    icon="delete-outline"
                    size={18}
                    iconColor={colors.textSecondary}
                    onPress={() => handleDelete(notif.id)}
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
