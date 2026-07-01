import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface StatCardProps {
  title: string;
  count: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconBg: string;
  percentage: string;
  percentageBg: string;
}

export default function StatCard({ title, count, icon, iconBg, percentage, percentageBg }: StatCardProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    card: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 16,
      margin: 6,
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    iconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: iconBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      backgroundColor: percentageBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#1E1E24',
    },
    titleText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    countText: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.textPrimary,
    }
  });

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons name={icon} size={20} color="#1E1E24" />
        </View>
        {percentage !== '' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{percentage}</Text>
          </View>
        )}
      </View>
      <Text style={styles.titleText}>{title}</Text>
      <Text style={styles.countText}>{count}</Text>
    </View>
  );
}
