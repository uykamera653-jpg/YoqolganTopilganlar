import { Appearance } from 'react-native';

const colorScheme = Appearance.getColorScheme();
const isDark = colorScheme === 'dark';

export const colors = {
  // Primary colors
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  
  // Background colors
  background: isDark ? '#0F172A' : '#F8FAFC',
  surface: isDark ? '#1E293B' : '#FFFFFF',
  surfaceSecondary: isDark ? '#334155' : '#F1F5F9',
  
  // Text colors
  text: isDark ? '#F1F5F9' : '#1E293B',
  textSecondary: isDark ? '#94A3B8' : '#64748B',
  textTertiary: isDark ? '#64748B' : '#94A3B8',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Category colors
  found: '#10B981',
  lost: '#EF4444',
  reward: '#F59E0B',
  
  // Border colors
  border: isDark ? '#334155' : '#E2E8F0',
  borderLight: isDark ? '#475569' : '#CBD5E1',
  
  // Other
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Font weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
