import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Platform, TouchableOpacity, RefreshControl } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { taskService, Task } from '../../services/taskService';
import TaskCard from '../../components/TaskCard';

export default function CalendarScreen() {
  const { colors, isDark } = useTheme();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const fetchedTasks = await taskService.getTasks();
      setAllTasks(fetchedTasks);
      
      // Filter tasks for the currently selected date
      const filtered = fetchedTasks.filter(t => t.deadline_date && t.deadline_date.split('T')[0] === selectedDate);
      setSelectedDayTasks(filtered);
    } catch (error) {
      console.error('Failed to load calendar tasks:', error);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Build the markedDates object for react-native-calendars
  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};

    // Group tasks by date
    allTasks.forEach(task => {
      if (!task.deadline_date) return;
      const dateKey = task.deadline_date.split('T')[0];

      if (!marked[dateKey]) {
        marked[dateKey] = {
          dots: [],
          customStyles: {
            container: {
              borderWidth: 1.5,
              borderColor: colors.border,
              borderRadius: 8,
            }
          }
        };
      }

      // Add a dot based on task priority
      let dotColor = colors.success;
      if (task.status !== 'Completed') {
        if (task.priority === 'High') {
          dotColor = colors.error;
        } else if (task.priority === 'Medium') {
          dotColor = colors.pending;
        }
      }

      // Make sure we don't add more than 3 dots to avoid overflowing the day cell
      if (marked[dateKey].dots.length < 3) {
        marked[dateKey].dots.push({
          key: `${task.id}`,
          color: dotColor,
          selectedColor: '#1E1E24'
        });
      }
    });

    // Mark the selected date
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: '#1E1E24',
      customStyles: {
        container: {
          borderWidth: 2,
          borderColor: colors.border,
          borderRadius: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 0,
        },
        text: {
          fontWeight: 'bold',
        }
      }
    };

    return marked;
  };

  const handleDayPress = (day: any) => {
    const dateStr = day.dateString;
    setSelectedDate(dateStr);

    const filtered = allTasks.filter(t => t.deadline_date && t.deadline_date.split('T')[0] === dateStr);
    setSelectedDayTasks(filtered);

    // If date is empty, automatically offer to add a task with prefilled date
    if (filtered.length === 0) {
      // Small timeout to let user see selection change before navigating
      setTimeout(() => {
        router.push({
          pathname: '/task/add',
          params: { prefilledDate: dateStr }
        });
      }, 300);
    }
  };

  const handleToggleComplete = async (id: number, isCompleted: boolean) => {
    try {
      await taskService.toggleComplete(id, isCompleted);
      loadData();
    } catch (error) {
      console.error('Toggle task complete error:', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await taskService.deleteTask(id);
      loadData();
    } catch (error) {
      console.error('Delete task error:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    router.push({
      pathname: '/task/edit/[id]',
      params: { id: task.id }
    });
  };

  const handleTaskPress = (id: number) => {
    router.push({
      pathname: '/task/[id]',
      params: { id }
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    calendarBlock: {
      margin: 16,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      overflow: 'hidden',
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    taskListBlock: {
      flex: 1,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: colors.card,
      padding: 16,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 12,
    },
    emptyBtn: {
      backgroundColor: colors.accent,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      flexDirection: 'row',
      alignItems: 'center',
    },
    emptyBtnText: {
      color: '#1E1E24',
      fontWeight: 'bold',
      fontSize: 13,
      marginLeft: 4,
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kalender Tugas</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        {/* Calendar widget */}
        <View style={styles.calendarBlock}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDayPress}
            markingType="multi-dot"
            markedDates={getMarkedDates()}
            theme={{
              calendarBackground: colors.card,
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: '#1E1E24',
              todayTextColor: colors.accent,
              dayTextColor: colors.textPrimary,
              textDisabledColor: isDark ? '#444444' : '#CCCCCC',
              arrowColor: colors.primary,
              monthTextColor: colors.textPrimary,
              textDayFontWeight: 'bold',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: 'bold',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
          />
        </View>

        {/* Selected date task list */}
        <View style={styles.taskListBlock}>
          <Text style={styles.sectionTitle}>
            Tugas Tanggal {new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>

          {selectedDayTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={40} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Tidak ada tugas untuk tanggal ini.</Text>
              <TouchableOpacity 
                style={styles.emptyBtn} 
                onPress={() => router.push({ pathname: '/task/add', params: { prefilledDate: selectedDate } })}
              >
                <MaterialCommunityIcons name="plus" size={16} color="#1E1E24" />
                <Text style={styles.emptyBtnText}>Buat Tugas Baru</Text>
              </TouchableOpacity>
            </View>
          ) : (
            selectedDayTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onPress={handleTaskPress}
              />
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
