import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Post } from '@/types';
import { spacing, typography, borderRadius, shadows, staticColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/template';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const handleUserPress = (e: any) => {
    e.stopPropagation();
    router.push(`/user-posts?userId=${post.user_id}`);
  };

  const handleMessagePress = (e: any) => {
    e.stopPropagation();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.id === post.user_id) {
      return; // Don't allow sending message to self
    }
    router.push(`/send-message?userId=${post.user_id}&username=${post.user_profiles?.username || t.profile.username}`);
  };

  const getTypeColor = () => {
    return post.type === 'found' ? staticColors.found : staticColors.lost;
  };

  const getTypeLabel = () => {
    return post.type === 'found' ? t.postTypes.found : t.postTypes.lost;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={() => router.push(`/post-detail?id=${post.id}`)}
      activeOpacity={0.7}
    >
      {post.image_url && (
        <Image
          source={{ uri: post.image_url }}
          style={styles.image}
          contentFit="cover"
        />
      )}
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.userSection} onPress={handleUserPress}>
          {post.user_profiles?.avatar_url ? (
            <Image
              source={{ uri: post.user_profiles.avatar_url }}
              style={styles.userAvatar}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.userAvatar, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]}>
              <MaterialIcons name="person" size={20} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.username, { color: colors.text }]}>{post.user_profiles?.username || t.profile.username}</Text>
        </TouchableOpacity>
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: getTypeColor() + '20' }]}>
            <Text style={[styles.badgeText, { color: getTypeColor() }]}>
              {getTypeLabel()}
            </Text>
          </View>
          {post.reward && (
            <View style={[styles.badge, { backgroundColor: staticColors.reward + '20' }]}>
              <MaterialIcons name="star" size={14} color={staticColors.reward} />
              <Text style={[styles.badgeText, { color: staticColors.reward, marginLeft: spacing.xs }]}>
                {t.home.reward}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{post.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>{post.description}</Text>

        <View style={styles.footer}>
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={16} color={colors.textSecondary} />
            <Text style={[styles.location, { color: colors.textSecondary }]} numberOfLines={1}>{post.location}</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(post.created_at)}</Text>
            {user && user.id !== post.user_id && (
              <TouchableOpacity style={[styles.messageButton, { backgroundColor: colors.primary }]} onPress={handleMessagePress}>
                <MaterialIcons name="chat" size={16} color={staticColors.white} />
                <Text style={[styles.messageButtonText, { color: staticColors.white }]}>{t.messages.title}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.md,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    overflow: 'hidden',
    borderWidth: 2,
  },
  username: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  badgeText: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sm,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  messageButtonText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  location: {
    fontSize: typography.sm,
    marginLeft: spacing.xs,
    flex: 1,
  },
  date: {
    fontSize: typography.sm,
  },
});
