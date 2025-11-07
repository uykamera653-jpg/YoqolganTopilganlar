import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { usePosts } from '@/hooks/usePosts';
import { Post } from '@/types';
import { PostCard } from '@/components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

type FilterType = 'all' | 'found' | 'lost' | 'reward';

export default function PostsListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { filter = 'all' } = useLocalSearchParams<{ filter: FilterType }>();
  const { posts, loading, refreshPosts } = usePosts();
  const { t } = useLanguage();
  const { colors } = useTheme();

  const getFilteredPosts = (): Post[] => {
    switch (filter) {
      case 'found':
        return posts.filter(post => post.type === 'found');
      case 'lost':
        return posts.filter(post => post.type === 'lost');
      case 'reward':
        return posts.filter(post => post.reward);
      default:
        return posts;
    }
  };

  const filteredPosts = getFilteredPosts();

  const getFilterTitle = () => {
    switch (filter) {
      case 'found':
        return t.postTypes.foundItems;
      case 'lost':
        return t.postTypes.lostItems;
      case 'reward':
        return t.postTypes.rewardedItems;
      default:
        return t.postTypes.allPosts;
    }
  };

  const getFilterIcon = () => {
    switch (filter) {
      case 'found':
        return 'search';
      case 'lost':
        return 'warning';
      case 'reward':
        return 'star';
      default:
        return 'list';
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: getFilterTitle(),
          headerShown: true,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }}
      />
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {loading && filteredPosts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name={getFilterIcon()} size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>E'lonlar topilmadi</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Bu kategoriyada hozircha e'lonlar yo'q
            </Text>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.primary }]}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={20} color={colors.white} />
              <Text style={[styles.backButtonText, { color: colors.white }]}>{t.back}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PostCard post={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={refreshPosts}
            refreshing={loading}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.base,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  listContent: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
