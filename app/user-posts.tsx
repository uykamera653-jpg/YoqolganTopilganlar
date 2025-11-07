import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { staticColors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { usePosts } from '@/hooks/usePosts';
import { PostCard } from '@/components';
import { getSupabaseClient } from '@/template';
import { UserProfile } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UserPostsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { posts } = usePosts();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setUserProfile(data);
    }
    setLoading(false);
  };

  const userPosts = posts.filter(post => post.user_id === userId);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerTitle}>{t.userPosts?.title || 'User'}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={staticColors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>
          {userProfile?.username || t.userPosts?.title || 'User'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
          {userProfile?.avatar_url ? (
            <Image
              source={{ uri: userProfile.avatar_url }}
              style={[styles.avatar, { borderColor: colors.primary }]}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
              <MaterialIcons name="person" size={48} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.username, { color: colors.text }]}>{userProfile?.username || t.profile.username}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{userProfile?.email}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{userPosts.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.userPosts?.posts || 'Posts'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.messageButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/send-message?userId=${userId}&username=${userProfile?.username || t.profile.username}`)}
          >
            <MaterialIcons name="chat" size={20} color={staticColors.white} />
            <Text style={[styles.messageButtonText, { color: staticColors.white }]}>{t.userPosts?.sendMessage || 'Send Message'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.postsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.userPosts?.posts || 'Posts'}</Text>
          {userPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inbox" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t.profile.noPosts}</Text>
            </View>
          ) : (
            userPosts.map(post => <PostCard key={post.id} post={post} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: staticColors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 3,
  },
  username: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.base,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
  },
  statLabel: {
    fontSize: typography.sm,
    marginTop: spacing.xs,
  },
  postsSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.base,
    marginTop: spacing.md,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  messageButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
});
