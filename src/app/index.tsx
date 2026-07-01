import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// 🚀 Force rebuild v2.0 - Backend patches applied (2026-07-01 14:40 UTC)
export default function InitialRoute() {
  const { colors } = useTheme();
  // AuthContext handles initial auto-login checks and routing internally on load
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
