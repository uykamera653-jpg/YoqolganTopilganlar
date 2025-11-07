import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'auto';
type ActiveTheme = 'light' | 'dark';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  cardBackground: string;
  inputBackground: string;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  activeTheme: ActiveTheme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  colors: ThemeColors;
}

const lightColors: ThemeColors = {
  primary: '#6366F1',
  secondary: '#EC4899',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  border: '#334155',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  cardBackground: '#1E293B',
  inputBackground: '#334155',
};

const darkColors: ThemeColors = {
  primary: '#6366F1',
  secondary: '#EC4899',
  background: '#000000',
  surface: '#0A0A0A',
  text: '#FFFFFF',
  textSecondary: '#6B7280',
  border: '#1F1F1F',
  error: '#DC2626',
  success: '#059669',
  warning: '#D97706',
  cardBackground: '#0A0A0A',
  inputBackground: '#1F1F1F',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'findo_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  
  const getActiveTheme = (): ActiveTheme => {
    if (themeMode === 'auto') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  };

  const activeTheme = getActiveTheme();
  const colors = activeTheme === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto')) {
        setThemeModeState(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const value: ThemeContextType = {
    themeMode,
    activeTheme,
    setThemeMode,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
