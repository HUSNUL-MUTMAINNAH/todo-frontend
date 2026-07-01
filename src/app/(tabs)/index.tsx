import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { IconButton, Badge, Avatar } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { taskService, Task, TaskStats } from '../../services/taskService';
import { notificationService } from '../../services/notificationService';
import StatCard from '../../components/StatCard';
import WeeklyCalendar from '../../components/WeeklyCalendar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TaskCard from '../../components/TaskCard';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
    deadline_today: 0,
    progress_percentage: 0,
    upcoming_task: null
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyTasksIndicators, setWeeklyTasksIndicators] = useState<{ [key: string]: any[] }>({});

  const loadData = useCallback(async () => {
    try {
      console.log('📊 Dashboard: Starting to load data...');
      
      // 1. Fetch dashboard stats
      console.log('📊 Dashboard: Fetching stats...');
      const fetchedStats = await taskService.getStats();
      console.log('✅ Dashboard: Stats fetched successfully', fetchedStats);
      setStats(fetchedStats);

      // 2. Fetch notifications count
      console.log('📬 Dashboard: Fetching notifications...');
      const notifications = await notificationService.getNotifications();
      console.log('✅ Dashboard: Notifications fetched', notifications.length);
      const unread = notifications.filter(n => !n.is_read).length;
      setUnreadNotifications(unread);

      // 3. Fetch tasks for selected date
      console.log('📝 Dashboard: Fetching tasks for date:', selectedDate);
      const fetchedTasks = await taskService.getTasks({ date: selectedDate });
      console.log('✅ Dashboard: Tasks fetched', fetchedTasks.length);
      setTasks(fetchedTasks);

      // 4. Fetch all tasks for current week to populate calendar priority dots
      const today = new Date();
      const currentDay = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - currentDay);
      
      const allTasks = await taskService.getTasks();
      const indicatorsMap: { [key: string]: any[] } = {};
      
      // Group tasks by date
      allTasks.forEach(task => {
        if (task.deadline_date) {
          const dateKey = task.deadline_date.split('T')[0];
          if (!indicatorsMap[dateKey]) {
            indicatorsMap[dateKey] = [];
          }
          indicatorsMap[dateKey].push({
            priority: task.priority,
            completed: task.status === 'Completed'
          });
        }
      });
      setWeeklyTasksIndicators(indicatorsMap);
      console.log('✅ Dashboard: All data loaded successfully');

    } catch (error: any) {
      console.error('❌ Failed to load dashboard data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
        code: error.code
      });
      
      // Handle 401 unauthorized - token expired or invalid
      if (error.response?.status === 401) {
        console.warn('⚠️  Token invalid or expired, auto-logout triggered');
      }
    }
  }, [selectedDate]);

  // Reload data every time dashboard comes to focus
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

  const handleToggleComplete = async (id: number, isCompleted: boolean) => {
    try {
      await taskService.toggleComplete(id, isCompleted);
      loadData(); // reload stats and tasks
    } catch (error) {
      console.error('Toggle task status failed:', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await taskService.deleteTask(id);
      loadData();
    } catch (error) {
      console.error('Delete task failed:', error);
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 12,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    bellContainer: {
      position: 'relative',
      marginRight: 8,
    },
    badge: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: colors.accent,
      color: '#1E1E24',
      fontWeight: 'bold',
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    // Banner Greeting Box
    banner: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    bannerLeft: {
      flex: 1,
      paddingRight: 10,
    },
    bannerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1E1E24',
      marginBottom: 6,
    },
    bannerSub: {
      fontSize: 13,
      color: '#1E1E24',
      opacity: 0.85,
      marginBottom: 16,
      fontWeight: '600',
    },
    bannerBtn: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 14,
      alignSelf: 'flex-start',
      shadowColor: colors.shadow,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
    bannerBtnText: {
      color: '#1E1E24',
      fontWeight: 'bold',
      fontSize: 12,
      marginRight: 4,
    },
    bannerImage: {
      width: 100,
      height: 100,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    // Statistics Grid
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -6,
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    sectionLink: {
      fontSize: 13,
      fontWeight: 'bold',
      color: colors.accent,
    },
    taskListWrapper: {
      minHeight: 150,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textSecondary,
      marginTop: 20,
      fontSize: 14,
    },
    addBtnRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 8,
    },
    addTaskBtn: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 14,
      shadowColor: colors.shadow,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
    addTaskBtnText: {
      color: '#1E1E24',
      fontWeight: 'bold',
      fontSize: 12,
      marginLeft: 4,
    },
    viewAllFooterBtn: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.card,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
      flexDirection: 'row',
      shadowColor: colors.shadow,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
    viewAllFooterBtnText: {
      fontWeight: 'bold',
      color: colors.textPrimary,
      fontSize: 14,
      marginRight: 4,
    }
  });

  // Photo rendering fallback
  const renderAvatar = () => {
    if (user?.photo) {
      return <Avatar.Image size={32} source={{ uri: user.photo }} />;
    }
    return <Avatar.Text size={32} label={user?.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'} style={{ backgroundColor: colors.accent }} color="#1E1E24" />;
  };

  return (
    <View style={styles.container}>
      {/* Upper Navigation Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.bellContainer} onPress={() => router.push('/notifications')}>
            <IconButton icon="bell-outline" size={24} iconColor={colors.textPrimary} />
            {unreadNotifications > 0 && (
              <Badge style={styles.badge} size={16}>
                {unreadNotifications}
              </Badge>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
            {renderAvatar()}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        {/* Banner Card Greeting */}
        <View style={styles.banner}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerTitle} numberOfLines={1}>
              Hai, {user?.fullname.split(' ')[0] || 'User'}! 👋
            </Text>
            <Text style={styles.bannerSub}>
              Semangat! Kamu punya {stats.deadline_today} tugas deadline hari ini.
            </Text>
            <TouchableOpacity style={styles.bannerBtn} onPress={() => router.push('/(tabs)/calendar')}>
              <Text style={styles.bannerBtnText}>Lihat Kalender</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color="#1E1E24" />
            </TouchableOpacity>
          </View>
          <Image
            source={require('../../../assets/images/dashboard_banner.jpg')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* Analytics Statistics Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Task"
            count={stats.total}
            icon="clipboard-list-outline"
            iconBg="#E1F5FE"
            percentage="+12%"
            percentageBg="#B3E5FC"
          />
          <StatCard
            title="Pending"
            count={stats.pending}
            icon="clock-outline"
            iconBg="#FFFDE7"
            percentage="+5%"
            percentageBg="#FFF9C4"
          />
          <StatCard
            title="Selesai"
            count={stats.completed}
            icon="checkbox-marked-circle-outline"
            iconBg="#E8F5E9"
            percentage="+20%"
            percentageBg="#C8E6C9"
          />
          <StatCard
            title="Hari Ini"
            count={stats.deadline_today}
            icon="calendar-today"
            iconBg="#FFEBEE"
            percentage="+0%"
            percentageBg="#FFCDD2"
          />
        </View>

        {/* Calendar Weekly view */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kalender</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
            <Text style={styles.sectionLink}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        <WeeklyCalendar
          selectedDate={selectedDate}
          onDateSelect={(dateStr) => setSelectedDate(dateStr)}
          taskIndicators={weeklyTasksIndicators}
        />

        {/* Task list row header */}
        <View style={styles.addBtnRow}>
          <Text style={styles.sectionTitle}>Daftar Task</Text>
          <TouchableOpacity style={styles.addTaskBtn} onPress={() => router.push('/task/add')}>
            <MaterialCommunityIcons name="plus" size={16} color="#1E1E24" />
            <Text style={styles.addTaskBtnText}>Tambah Task</Text>
          </TouchableOpacity>
        </View>

        {/* Today's / selected day's Tasks List */}
        <View style={styles.taskListWrapper}>
          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada tugas untuk tanggal ini.</Text>
          ) : (
            tasks.map(task => (
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

        {/* View all button */}
        <TouchableOpacity style={styles.viewAllFooterBtn} onPress={() => router.push('/(tabs)/tasks')}>
          <Text style={styles.viewAllFooterBtnText}>Lihat Semua Task</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
