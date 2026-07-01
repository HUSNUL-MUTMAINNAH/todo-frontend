import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput as RNTextInput, RefreshControl } from 'react-native';
import { IconButton, Menu, Portal, Modal, Button, RadioButton } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { taskService, Task, TaskFilters } from '../../services/taskService';
import { categoryService, Category } from '../../services/categoryService';
import TaskCard from '../../components/TaskCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TasksScreen() {
  const { colors } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number>('');
  const [selectedDeadlineRange, setSelectedDeadlineRange] = useState<'today' | 'week' | 'month' | ''>('');
  const [sortBy, setSortBy] = useState<'deadline_near' | 'deadline_far' | 'priority' | 'name' | 'created_at'>('created_at');

  // Filter Modal visible
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const { token } = useAuth();
  const loadData = useCallback(async () => {
    if (!token) {
      // If not authenticated, skip loading and let AuthProvider redirect to login
      return;
    }
    try {
      const filters: TaskFilters = {};
      if (debouncedSearchQuery.trim().length > 0) filters.search = debouncedSearchQuery;
      if (selectedStatus) filters.status = selectedStatus;
      if (selectedPriority) filters.priority = selectedPriority;
      if (selectedCategoryId) filters.category_id = selectedCategoryId;
      if (selectedDeadlineRange) filters.deadlineRange = selectedDeadlineRange;
      filters.sortBy = sortBy;

      const [fetchedTasks, fetchedCategories] = await Promise.all([
        taskService.getTasks(filters),
        categoryService.getCategories()
      ]);

      setTasks(fetchedTasks);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }, [debouncedSearchQuery, selectedStatus, selectedPriority, selectedCategoryId, selectedDeadlineRange, sortBy, token]);

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

  const clearFilters = () => {
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedCategoryId('');
    setSelectedDeadlineRange('');
    setFilterModalVisible(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchBar: {
      flex: 1,
      height: 44,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    iconBtn: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.background,
      marginLeft: 8,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 1.5, height: 1.5 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    tasksList: {
      flex: 1,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 12,
    },
    modalContainer: {
      backgroundColor: colors.card,
      margin: 20,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 16,
      textAlign: 'center',
    },
    filterSection: {
      marginBottom: 16,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    pillsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    pill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    activePill: {
      backgroundColor: colors.primary,
    },
    pillText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    activePillText: {
      color: '#1E1E24',
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    modalBtn: {
      flex: 0.48,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 8,
    },
    applyBtn: {
      backgroundColor: colors.accent,
    },
    resetBtn: {
      backgroundColor: colors.background,
    },
    sortItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    }
  });

  const getSortLabel = () => {
    switch (sortBy) {
      case 'deadline_near': return 'Deadline Terdekat';
      case 'deadline_far': return 'Deadline Terlama';
      case 'priority': return 'Prioritas';
      case 'name': return 'Nama';
      default: return 'Tanggal Dibuat';
    }
  };

  return (
    <View style={styles.container}>
      {/* Search and Action Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Daftar Tugas</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/task/add')}>
            <MaterialCommunityIcons name="plus" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchRow}>
          <RNTextInput
            placeholder="Cari tugas..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            onSubmitEditing={() => setDebouncedSearchQuery(searchQuery)}
            returnKeyType="search"
            style={styles.searchBar}
          />
          <TouchableOpacity style={styles.iconBtn} onPress={() => setFilterModalVisible(true)}>
            <MaterialCommunityIcons 
              name={(selectedStatus || selectedPriority || selectedCategoryId || selectedDeadlineRange) ? "filter" : "filter-outline"} 
              size={20} 
              color={(selectedStatus || selectedPriority || selectedCategoryId || selectedDeadlineRange) ? colors.accent : colors.textPrimary} 
            />
          </TouchableOpacity>

          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <TouchableOpacity style={styles.iconBtn} onPress={() => setSortMenuVisible(true)}>
                <MaterialCommunityIcons name="sort" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => { setSortBy('created_at'); setSortMenuVisible(false); }} title="Tanggal Dibuat" leadingIcon="clock" />
            <Menu.Item onPress={() => { setSortBy('deadline_near'); setSortMenuVisible(false); }} title="Deadline Terdekat" leadingIcon="sort-calendar-ascending" />
            <Menu.Item onPress={() => { setSortBy('deadline_far'); setSortMenuVisible(false); }} title="Deadline Terlama" leadingIcon="sort-calendar-descending" />
            <Menu.Item onPress={() => { setSortBy('priority'); setSortMenuVisible(false); }} title="Prioritas" leadingIcon="alert-decagram-outline" />
            <Menu.Item onPress={() => { setSortBy('name'); setSortMenuVisible(false); }} title="Nama" leadingIcon="sort-alphabetical-ascending" />
          </Menu>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        {/* Sort indicator row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 'bold' }}>
            Mengurutkan berdasarkan: {getSortLabel()}
          </Text>
          {(selectedStatus || selectedPriority || selectedCategoryId || selectedDeadlineRange) ? (
            <TouchableOpacity onPress={clearFilters}>
              <Text style={{ fontSize: 12, color: colors.accent, fontWeight: 'bold' }}>Hapus Filter</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Task Cards list */}
        <View style={styles.tasksList}>
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="clipboard-text-off-outline" size={60} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Tidak ada tugas yang ditemukan</Text>
            </View>
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
      </ScrollView>

      {/* Filter Modal Portal */}
      <Portal>
        <Modal
          visible={filterModalVisible}
          onDismiss={() => setFilterModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Filter Tugas</Text>

          {/* Status Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.pillsRow}>
              {['Pending', 'In Progress', 'Completed', 'Overdue'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.pill, selectedStatus === status && styles.activePill]}
                  onPress={() => setSelectedStatus(selectedStatus === status ? '' : status)}
                >
                  <Text style={[styles.pillText, selectedStatus === status && styles.activePillText]}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Prioritas</Text>
            <View style={styles.pillsRow}>
              {['Low', 'Medium', 'High'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[styles.pill, selectedPriority === priority && styles.activePill]}
                  onPress={() => setSelectedPriority(selectedPriority === priority ? '' : priority)}
                >
                  <Text style={[styles.pillText, selectedPriority === priority && styles.activePillText]}>{priority}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Deadline Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Waktu Deadline</Text>
            <View style={styles.pillsRow}>
              {['today', 'week', 'month'].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[styles.pill, selectedDeadlineRange === range && styles.activePill]}
                  onPress={() => setSelectedDeadlineRange(selectedDeadlineRange === range ? '' : range as any)}
                >
                  <Text style={[styles.pillText, selectedDeadlineRange === range && styles.activePillText]}>
                    {range === 'today' ? 'Hari Ini' : range === 'week' ? 'Minggu Ini' : 'Bulan Ini'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Kategori</Text>
            <View style={styles.pillsRow}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.pill, selectedCategoryId === category.id && styles.activePill]}
                  onPress={() => setSelectedCategoryId(selectedCategoryId === category.id ? '' : category.id)}
                >
                  <Text style={[styles.pillText, selectedCategoryId === category.id && styles.activePillText]}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={clearFilters}
              style={[styles.modalBtn, styles.resetBtn]}
              textColor={colors.textPrimary}
              labelStyle={{ fontWeight: 'bold' }}
            >
              Reset
            </Button>
            <Button
              mode="contained"
              onPress={() => setFilterModalVisible(false)}
              style={[styles.modalBtn, styles.applyBtn]}
              labelStyle={{ fontWeight: 'bold', color: '#1E1E24' }}
            >
              Terapkan
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}
