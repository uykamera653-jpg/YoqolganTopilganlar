import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, AppState } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { spacing } from '@/constants/theme';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/template';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { messageService } from '@/services/messageService';

// Notification configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { conversations, unreadCount, loading } = useMessages();
  const { t } = useLanguage();
  const { colors } = useTheme();
  
  const previousUnreadCount = useRef(0);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  // Request notification permissions
  useEffect(() => {
    registerForPushNotifications();
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  // Setup polling when user is logged in
  useEffect(() => {
    if (user) {
      startPolling();
      
      // App state listener
      const subscription = AppState.addEventListener('change', nextAppState => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          startPolling();
        } else if (nextAppState.match(/inactive|background/)) {
          stopPolling();
        }
        appState.current = nextAppState;
      });

      return () => {
        stopPolling();
        subscription.remove();
      };
    } else {
      stopPolling();
    }
  }, [user]);

  // Detect new messages and show notification
  useEffect(() => {
    if (user && unreadCount > previousUnreadCount.current && previousUnreadCount.current !== 0) {
      showNewMessageNotification(unreadCount - previousUnreadCount.current);
    }
    previousUnreadCount.current = unreadCount;
  }, [unreadCount]);

  const registerForPushNotifications = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
    }
  };

  const showNewMessageNotification = async (newMessageCount: number) => {
    // Play notification sound
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/notification.mp3'),
        { shouldPlay: true, volume: 1.0 },
        undefined,
        false
      );
      
      // Unload sound after playing
      setTimeout(() => {
        sound.unloadAsync();
      }, 2000);
    } catch (error) {
      // If sound file not found, use system sound
      console.log('Using system notification sound');
    }

    // Show notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t.messages?.newMessage || 'Yangi xabar',
        body: newMessageCount === 1 
          ? t.messages?.oneNewMessage || 'Sizga yangi xabar keldi'
          : `${newMessageCount} ta yangi xabar`,
        sound: true,
        badge: unreadCount,
      },
      trigger: null, // Show immediately
    });
  };

  const startPolling = () => {
    stopPolling(); // Clear existing interval
    
    // Poll every 10 seconds
    pollingInterval.current = setInterval(async () => {
      if (user) {
        await messageService.getUnreadCount(user.id);
      }
    }, 10000);
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t.messages.title}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="login" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t.auth.login}</Text>
        </View>
      </View>
    );
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t.messages.justNow || 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.messages.title}</Text>
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.error }]}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {loading && conversations.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="chat-bubble-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t.messages.noMessages}</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>{t.messages.startConversation}</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.user_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.conversationItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
              onPress={() => router.push(`/chat?userId=${item.user_id}&username=${item.username}`)}
            >
              {item.avatar_url ? (
                <Image
                  source={{ uri: item.avatar_url }}
                  style={[styles.avatarImage, { borderColor: colors.primary + '40' }]}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
                  <MaterialIcons name="person" size={32} color={colors.primary} />
                </View>
              )}
              <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                  <Text style={[styles.conversationUsername, { color: colors.text }]}>{item.username}</Text>
                  <Text style={[styles.conversationTime, { color: colors.textSecondary }]}>{formatTime(item.last_message_time)}</Text>
                </View>
                <Text style={[styles.conversationMessage, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.last_message}
                </Text>
              </View>
              {item.unread_count > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.unreadBadgeText}>{item.unread_count}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  badge: {
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
    borderWidth: 2,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  conversationUsername: {
    fontSize: 16,
    fontWeight: '600',
  },
  conversationTime: {
    fontSize: 12,
  },
  conversationMessage: {
    fontSize: 14,
  },
  unreadBadge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.sm,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
