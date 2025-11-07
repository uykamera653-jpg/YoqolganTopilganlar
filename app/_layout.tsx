import { Stack } from 'expo-router';
import { AuthProvider, AlertProvider } from '@/template';
import { PostsProvider } from '@/contexts/PostsContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AlertProvider>
          <AuthProvider>
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
          </Stack>
            </PostsProvider>
          </AuthProvider>
        </AlertProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
