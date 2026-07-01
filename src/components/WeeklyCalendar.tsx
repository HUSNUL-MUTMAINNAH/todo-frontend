import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface WeeklyCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (dateStr: string) => void;
  taskIndicators?: { [dateStr: string]: { priority: 'Low' | 'Medium' | 'High'; completed: boolean }[] };
}

export default function WeeklyCalendar({ selectedDate, onDateSelect, taskIndicators = {} }: WeeklyCalendarProps) {
  const { colors } = useTheme();

  // Get current week's dates starting from Sunday
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
    
    // Start from Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);

    const dayLetters = ['M', 'S', 'S', 'R', 'K', 'J', 'S']; // Minggu, Senin, Selasa, Rabu, Kamis, Jumat, Sabtu

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      dates.push({
        dateStr,
        dayNum: date.getDate(),
        dayLetter: dayLetters[i],
      });
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 16,
      marginVertical: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    dayCol: {
      alignItems: 'center',
      flex: 1,
    },
    dayLetter: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    dateCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    selectedCircle: {
      backgroundColor: colors.primary,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 1.5, height: 1.5 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
    dateText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    selectedDateText: {
      color: '#1E1E24',
    },
    dotRow: {
      flexDirection: 'row',
      marginTop: 4,
      height: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      marginHorizontal: 1,
    }
  });

  return (
    <View style={styles.container}>
      {weekDates.map((item) => {
        const isSelected = item.dateStr === selectedDate;
        const indicators = taskIndicators[item.dateStr] || [];

        // Determine dot colors based on tasks on this day
        let dotColor: string | null = null;
        if (indicators.length > 0) {
          const hasHigh = indicators.some(t => t.priority === 'High' && !t.completed);
          const hasMedium = indicators.some(t => t.priority === 'Medium' && !t.completed);
          const allCompleted = indicators.every(t => t.completed);

          if (allCompleted) {
            dotColor = colors.success;
          } else if (hasHigh) {
            dotColor = colors.error;
          } else if (hasMedium) {
            dotColor = colors.pending;
          } else {
            dotColor = colors.success; // Default low/completed green
          }
        }

        return (
          <TouchableOpacity
            key={item.dateStr}
            style={styles.dayCol}
            onPress={() => onDateSelect(item.dateStr)}
            activeOpacity={0.7}
          >
            <Text style={styles.dayLetter}>{item.dayLetter}</Text>
            <View style={[styles.dateCircle, isSelected && styles.selectedCircle]}>
              <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
                {item.dayNum}
              </Text>
            </View>
            <View style={styles.dotRow}>
              {dotColor && (
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
