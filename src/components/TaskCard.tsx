import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Menu, IconButton } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { Task } from '../services/taskService';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: number, isCompleted: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onPress: (id: number) => void;
}

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete, onPress }: TaskCardProps) {
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const isCompleted = task.status === 'Completed';
  const isOverdue = task.status === 'Overdue';

  // Get status color coding
  const getStatusStyle = () => {
    switch (task.status) {
      case 'Completed':
        return { bg: '#E8F5E9', text: '#2E7D32', label: 'Selesai' };
      case 'Overdue':
        return { bg: '#FFEBEE', text: '#C62828', label: 'Overdue' };
      case 'In Progress':
        return { bg: '#E3F2FD', text: '#1565C0', label: 'In Progress' };
      default:
        return { bg: '#FFFDE7', text: '#F57F17', label: 'To Do' };
    }
  };

  const statusStyle = getStatusStyle();

  // Get priority color coding
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'High':
        return colors.error;
      case 'Medium':
        return colors.pending;
      default:
        return colors.success;
    }
  };

  const formattedDate = () => {
    if (!task.deadline_date) return '';
    const dateObj = new Date(task.deadline_date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  };

  const formattedTime = () => {
    if (!task.deadline_time) return '';
    // deadline_time is HH:MM:SS, extract HH:MM
    return task.deadline_time.substring(0, 5);
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 16,
      marginVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    checkedBox: {
      backgroundColor: colors.primary,
    },
    contentWrapper: {
      flex: 1,
      justifyContent: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    completedTitle: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
    },
    categoryTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#1E1E24',
      marginLeft: 3,
    },
    deadlineContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 8,
    },
    deadlineText: {
      fontSize: 11,
      color: colors.textSecondary,
      marginLeft: 3,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: statusStyle.bg,
    },
    statusText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: statusStyle.text,
    },
    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: getPriorityColor(),
      borderWidth: 0.5,
      borderColor: colors.border,
    }
  });

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(task.id)} activeOpacity={0.9}>
      {/* Checkbox */}
      <TouchableOpacity 
        style={[styles.checkbox, isCompleted && styles.checkedBox]}
        onPress={() => onToggleComplete(task.id, !isCompleted)}
      >
        {isCompleted && (
          <MaterialCommunityIcons name="check" size={16} color="#1E1E24" />
        )}
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.contentWrapper}>
        <Text style={[styles.title, isCompleted && styles.completedTitle]} numberOfLines={1}>
          {task.title}
        </Text>
        
        <View style={styles.metaRow}>
          {/* Category Tag */}
          {task.category_name && (
            <View style={[styles.categoryTag, { backgroundColor: task.category_color || '#E0E0E0' }]}>
              <MaterialCommunityIcons name={(task.category_icon || 'tag') as any} size={10} color="#1E1E24" />
              <Text style={styles.categoryText}>{task.category_name}</Text>
            </View>
          )}

          {/* Priority Indicator */}
          <View style={styles.priorityDot} />

          {/* Deadline */}
          <View style={styles.deadlineContainer}>
            <MaterialCommunityIcons name="calendar" size={12} color={colors.textSecondary} />
            <Text style={styles.deadlineText}>{formattedDate()}</Text>
          </View>
          <View style={styles.deadlineContainer}>
            <MaterialCommunityIcons name="clock-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.deadlineText}>{formattedTime()}</Text>
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{statusStyle.label}</Text>
          </View>
        </View>
      </View>

      {/* Action Menu */}
      <View>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={20}
              iconColor={colors.textPrimary}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item 
            onPress={() => { setMenuVisible(false); onPress(task.id); }} 
            title="Lihat Detail" 
            leadingIcon="eye"
          />
          <Menu.Item 
            onPress={() => { setMenuVisible(false); onEdit(task); }} 
            title="Edit" 
            leadingIcon="pencil"
          />
          <Menu.Item 
            onPress={() => { setMenuVisible(false); onDelete(task.id); }} 
            title="Hapus" 
            leadingIcon="delete"
            titleStyle={{ color: '#E57373' }}
          />
        </Menu>
      </View>
    </TouchableOpacity>
  );
}
