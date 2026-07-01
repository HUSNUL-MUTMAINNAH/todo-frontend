import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { StyleSheet, View, Platform } from 'react-native';

export default function TabLayout() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    tabBar: {
      backgroundColor: colors.card,
      borderTopWidth: 2,
      borderTopColor: colors.border,
      height: Platform.OS === 'ios' ? 88 : 68,
      paddingBottom: Platform.OS === 'ios' ? 28 : 10,
      paddingTop: 10,
      elevation: 8,
    },
    tabBarLabel: {
      fontSize: 12,
      fontWeight: 'bold',
    }
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? 'view-dashboard' : 'view-dashboard-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'To Do',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? 'format-list-checkbox' : 'format-list-bulleted'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Kalender',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? 'calendar-month' : 'calendar-month-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Kategori',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? 'folder' : 'folder-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Pengaturan',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? 'cog' : 'cog-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
