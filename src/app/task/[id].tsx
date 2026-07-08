import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Platform, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Button, Card, Divider } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { taskService, Task } from '../../services/taskService';
import { scheduleTaskReminder, cancelTaskReminder } from '../../utils/notifications';

export default function TaskDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    try {
      const fetched = await taskService.getTaskById(id as string);
      setTask(fetched);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load task details:', error);
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!task) return;
    try {
      const updated = await taskService.toggleComplete(task.id, task.status !== 'Completed');
      setTask(updated);
      
      if (updated.status === 'Completed' || updated.reminder_type === 'none') {
        await cancelTaskReminder(updated.id);
      } else if (updated.reminder_datetime) {
        await scheduleTaskReminder(updated.id, updated.title, new Date(updated.reminder_datetime));
      }
    } catch (error) {
      console.error('Failed to toggle task complete:', error);
    }
  };

  const handleDelete = () => {
    const executeDelete = async () => {
      try {
        if (task) {
          await cancelTaskReminder(task.id);
          await taskService.deleteTask(task.id);
          router.back();
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Hapus Tugas',
        'Apakah Anda yakin ingin menghapus tugas ini?',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Hapus', style: 'destructive', onPress: executeDelete }
        ]
      );
    }
  };

  const handleEdit = () => {
    if (!task) return;
    router.push({
      pathname: '/task/edit/[id]',
      params: { id: task.id }
    });
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'High':
        return { bg: '#FFEBEE', text: '#C62828', icon: 'alert-decagram' };
      case 'Medium':
        return { bg: '#FFFDE7', text: '#F57F17', icon: 'alert-decagram-outline' };
      default:
        return { bg: '#E8F5E9', text: '#2E7D32', icon: 'check-decagram-outline' };
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'Completed': return 'Selesai';
      case 'Overdue': return 'Overdue (Terlewat)';
      case 'In Progress': return 'Sedang Dikerjakan';
      default: return 'Pending';
    }
  };

  const getReminderLabel = (t: string) => {
    switch (t) {
      case 'exact': return 'Tepat saat deadline';
      case '15_min': return '15 Menit sebelum deadline';
      case '30_min': return '30 Menit sebelum deadline';
      case '1_hour': return '1 Jam sebelum deadline';
      case '3_hours': return '3 Jam sebelum deadline';
      case '1_day': return '1 Hari sebelum deadline';
      default: return 'Tidak ada pengingat';
    }
  };

  const formattedDate = (d: string) => {
    const dateObj = new Date(d);
    return dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
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
    },
    scrollContent: {
      padding: 20,
    },
    detailCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 20,
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    titleText: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 16,
    },
    completedTitle: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
    },
    categoryTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignSelf: 'flex-start',
      marginBottom: 16,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#1E1E24',
      marginLeft: 4,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 10,
    },
    detailItemText: {
      fontSize: 14,
      color: colors.textPrimary,
      marginLeft: 12,
      fontWeight: '600',
    },
    notesSection: {
      marginTop: 16,
      marginBottom: 8,
    },
    notesLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    notesBox: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      backgroundColor: colors.background,
      minHeight: 100,
    },
    notesText: {
      fontSize: 14,
      color: colors.textPrimary,
      lineHeight: 20,
    },
    emptyNotes: {
      fontSize: 13,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    actionsBlock: {
      gap: 12,
      marginBottom: 30,
    },
    actionBtn: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: 6,
      shadowColor: colors.shadow,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
    completeBtn: {
      backgroundColor: colors.primary,
    },
    editBtn: {
      backgroundColor: colors.background,
    },
    deleteBtn: {
      backgroundColor: '#FFEBEE',
      borderColor: '#C62828',
    }
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 16, color: colors.textSecondary, fontWeight: 'bold' }}>Tugas tidak ditemukan.</Text>
        <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 12 }}>Kembali</Button>
      </View>
    );
  }

  const prioStyle = getPriorityStyle(task.priority);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Tugas</Text>
        <TouchableOpacity onPress={handleEdit}>
          <MaterialCommunityIcons name="pencil" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.detailCard}>
          {/* Category Tag */}
          {task.category_name && (
            <View style={[styles.categoryTag, { backgroundColor: task.category_color || '#E0E0E0' }]}>
              <MaterialCommunityIcons name={(task.category_icon || 'tag') as any} size={14} color="#1E1E24" />
              <Text style={styles.categoryText}>{task.category_name}</Text>
            </View>
          )}

          {/* Title */}
          <Text style={[styles.titleText, task.status === 'Completed' && styles.completedTitle]}>
            {task.title}
          </Text>

          <Divider style={{ marginVertical: 8, height: 1.5 }} />

          {/* Date & Time */}
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar" size={22} color={colors.textSecondary} />
            <Text style={styles.detailItemText}>{formattedDate(task.deadline_date)}</Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock-outline" size={22} color={colors.textSecondary} />
            <Text style={styles.detailItemText}>Jam {task.deadline_time.substring(0, 5)} WIB</Text>
          </View>

          {/* Priority Pill */}
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name={prioStyle.icon as any} size={22} color={prioStyle.text} />
            <View style={{
              backgroundColor: prioStyle.bg,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.border,
              marginLeft: 12
            }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: prioStyle.text }}>
                Prioritas {task.priority}
              </Text>
            </View>
          </View>

          {/* Status */}
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="list-status" size={22} color={colors.textSecondary} />
            <Text style={styles.detailItemText}>Status: {getStatusLabel(task.status)}</Text>
          </View>

          {/* Reminder */}
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="bell-ring-outline" size={22} color={colors.textSecondary} />
            <Text style={styles.detailItemText}>Pengingat: {getReminderLabel(task.reminder_type)}</Text>
          </View>

          {/* Description/Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Catatan</Text>
            <View style={styles.notesBox}>
              {task.description ? (
                <Text style={styles.notesText}>{task.description}</Text>
              ) : (
                <Text style={styles.emptyNotes}>Tidak ada catatan untuk tugas ini.</Text>
              )}
            </View>
          </View>
        </View>

        {/* Buttons actions */}
        <View style={styles.actionsBlock}>
          <Button
            mode="contained"
            onPress={handleToggleComplete}
            style={[styles.actionBtn, styles.completeBtn]}
            labelStyle={{ fontWeight: 'bold', color: '#1E1E24' }}
            icon={task.status === 'Completed' ? 'restore' : 'check'}
          >
            {task.status === 'Completed' ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
          </Button>

          <Button
            mode="outlined"
            onPress={handleEdit}
            style={[styles.actionBtn, styles.editBtn]}
            textColor={colors.textPrimary}
            labelStyle={{ fontWeight: 'bold' }}
            icon="pencil"
          >
            Edit Tugas
          </Button>

          <Button
            mode="contained"
            onPress={handleDelete}
            style={[styles.actionBtn, styles.deleteBtn]}
            textColor="#C62828"
            labelStyle={{ fontWeight: 'bold' }}
            icon="delete"
          >
            Hapus Tugas
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
