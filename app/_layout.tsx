import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { AuthProvider, AlertProvider } from '@/template';
import { PostsProvider } from '@/contexts/PostsContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useAlert } from '@/template';
import { spacing, typography } from '@/constants/theme';

function UpdateChecker({ children }: { children: React.ReactNode }) {
  const { showAlert } = useAlert();

  useEffect(() => {
    // Check for updates in background (no loading screen)
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      // Skip update check in development
      if (__DEV__ || !Updates.isEnabled) {
        console.log('⚠️ Updates disabled in development mode');
        return;
      }

      console.log('🔍 Checking for updates in background...');
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log('✅ Update available!');
        showAlert(
          '🎉 Yangilanish mavjud!',
          'Ilova uchun yangi versiya tayyor. Yangilashni xohlaysizmi?',
          [
            {
              text: 'Keyinroq',
              style: 'cancel',
            },
            {
              text: 'Yangilash',
              onPress: async () => {
                try {
                  console.log('📥 Downloading update...');
                  await Updates.fetchUpdateAsync();
                  console.log('✅ Update downloaded, reloading...');
                  
                  showAlert(
                    '✅ Tayyor!',
                    'Yangilanish yuklandi. Ilova qayta ishga tushiriladi.',
                    [
                      {
                        text: 'OK',
                        onPress: async () => {
                          await Updates.reloadAsync();
                        },
                      },
                    ]
                  );
                } catch (error) {
                  console.error('❌ Update error:', error);
                  showAlert(
                    'Xatolik',
                    'Yangilanishda muammo yuz berdi. Keyinroq urinib ko\'ring.'
                  );
                }
              },
            },
          ]
        );
      } else {
        console.log('✅ App is up to date');
      }
    } catch (error) {
      console.error('❌ Update check error:', error);
    }
  };

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AlertProvider>
          <UpdateChecker>
            <AuthProvider>
              <NotificationProvider>
                <PostsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen 
              name="post-detail" 
              options={{ 
                headerShown: true,
                title: 'E\'lon',
                headerStyle: { backgroundColor: '#6366F1' },
                headerTintColor: '#fff',
              }} 
            />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
            <Stack.Screen 
              name="chat" 
              options={{ 
                headerShown: true,
                headerStyle: { backgroundColor: '#6366F1' },
                headerTintColor: '#fff',
              }} 
            />
            <Stack.Screen 
              name="send-message" 
              options={{ 
                headerShown: true,
                headerStyle: { backgroundColor: '#6366F1' },
                headerTintColor: '#fff',
              }} 
            />
            <Stack.Screen 
              name="posts-list" 
              options={{ 
                headerShown: true,
                headerStyle: { backgroundColor: '#6366F1' },
                headerTintColor: '#fff',
              }} 
            />
            <Stack.Screen 
              name="user-posts" 
              options={{ 
                headerShown: true,
                title: 'Foydalanuvchi',
                headerStyle: { backgroundColor: '#6366F1' },
                headerTintColor: '#fff',
              }} 
            />
            <Stack.Screen 
              name="privacy-policy" 
              options={{ 
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="terms-of-service" 
              options={{ 
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="reset-password" 
              options={{ 
                headerShown: false,
              }} 
            />
          </Stack>
                </PostsProvider>
              </NotificationProvider>
            </AuthProvider>
          </UpdateChecker>
        </AlertProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({});
