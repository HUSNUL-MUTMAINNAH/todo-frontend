import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Platform-aware storage helpers for theme
const THEME_KEY = 'app_theme';

async function getStoredTheme(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(THEME_KEY);
  }
  return await SecureStore.getItemAsync(THEME_KEY);
}

async function setStoredTheme(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(THEME_KEY, value);
  } else {
    await SecureStore.setItemAsync(THEME_KEY, value);
  }
}

// Define theme types
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;       // Teal header color (#4FB0C6)
  primaryDark: string;   // Dark teal (#3A91A4)
  background: string;    // Main body background (#FBFBF9 or #121212)
  card: string;          // Card background (#FFFFFF or #1E1E1E)
  textPrimary: string;   // Main text (#1E1E24 or #FFFFFF)
  textSecondary: string; // Subtitles (#75787B or #B0B3B8)
  border: string;        // Retro borders (#1E1E24 or #333333)
  accent: string;        // Highlight color (e.g. orange #FF7A59)
  success: string;       // Completed tasks green
  pending: string;       // Pending tasks yellow/orange
  error: string;         // Overdue tasks red
  shadow: string;        // Retro hard shadow (#1E1E24 or #000000)
}

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const LightColors: ThemeColors = {
  primary: '#4FB0C6',
  primaryDark: '#3A91A4',
  background: '#FBFBF9',
  card: '#FFFFFF',
  textPrimary: '#1E1E24',
  textSecondary: '#75787B',
  border: '#1E1E24',
  accent: '#FF7A59',
  success: '#81C784',
  pending: '#FFD54F',
  error: '#E57373',
  shadow: '#1E1E24',
};

export const DarkColors: ThemeColors = {
  primary: '#4FB0C6',
  primaryDark: '#3A91A4',
  background: '#121212',
  card: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B3B8',
  border: '#333333',
  accent: '#FF7A59',
  success: '#2E7D32',
  pending: '#F9A825',
  error: '#C62828',
  shadow: '#000000',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    // Load persisted theme preference
    const loadTheme = async () => {
      try {
        const storedTheme = await getStoredTheme();
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setTheme(storedTheme);
        } else if (systemScheme === 'light' || systemScheme === 'dark') {
          setTheme(systemScheme);
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      }
    };
    loadTheme();
  }, [systemScheme]);

  const toggleTheme = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      await setStoredTheme(nextTheme);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const colors = theme === 'light' ? LightColors : DarkColors;
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
