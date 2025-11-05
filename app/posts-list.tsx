import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { usePosts } from '@/hooks/usePosts';
import { Post } from '@/types';
import { PostCard } from '@/components';

type FilterType = 'all' | 'found' | 'lost' | 'reward';

export default function PostsListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { filter = 'all' } = useLocalSearchParams<{ filter: FilterType }>();
  const { posts, loading, refreshPosts } = usePosts();

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
        return 'Topilgan buyumlar';
      case 'lost':
        return 'Yo\'qotilgan buyumlar';
      case 'reward':
        return 'Mukofotli e\'lonlar';
      default:
        return 'Barcha e\'lonlar';
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
            <Text style={styles.emptyText}>E'lonlar topilmadi</Text>
            <Text style={styles.emptySubtext}>
              Bu kategoriyada hozircha e'lonlar yo'q
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={20} color={colors.white} />
              <Text style={styles.backButtonText}>Orqaga</Text>
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
    backgroundColor: colors.background,
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
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  backButtonText: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  listContent: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
