import {View,Text,StyleSheet,FlatList,ActivityIndicator,TouchableOpacity,TextInput,KeyboardAvoidingView,Platform} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, staticColors } from '@/constants/theme';
import { usePosts } from '@/hooks/usePosts';
import { Post } from '@/types';
import { PostCard } from '@/components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useMemo } from 'react';

type FilterType = 'all' | 'found' | 'lost' | 'reward';

export default function PostsListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { filter = 'all', region = '' } = useLocalSearchParams<{ filter: FilterType; region?: string }>();
  const { posts, loading, refreshPosts } = usePosts();
  const { t, language } = useLanguage();
  const { colors } = useTheme();
  const [showRegionFilter, setShowRegionFilter] = useState(false);
  const [regionSearchText, setRegionSearchText] = useState('');
  const [activeRegion, setActiveRegion] = useState('');
  const [itemSearchText, setItemSearchText] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');

  const regions = [
    { key: '', label: t.regions.all },
    { key: 'tashkent_city', label: t.regions.tashkent_city },
    { key: 'tashkent', label: t.regions.tashkent },
    { key: 'andijan', label: t.regions.andijan },
    { key: 'bukhara', label: t.regions.bukhara },
    { key: 'fergana', label: t.regions.fergana },
    { key: 'jizzakh', label: t.regions.jizzakh },
    { key: 'namangan', label: t.regions.namangan },
    { key: 'navoi', label: t.regions.navoi },
    { key: 'kashkadarya', label: t.regions.kashkadarya },
    { key: 'karakalpakstan', label: t.regions.karakalpakstan },
    { key: 'samarkand', label: t.regions.samarkand },
    { key: 'sirdarya', label: t.regions.sirdarya },
    { key: 'surkhandarya', label: t.regions.surkhandarya },
    { key: 'khorezm', label: t.regions.khorezm },
  ];

  const filteredRegionOptions = useMemo(() => {
    if (!regionSearchText.trim()) return regions;
    const searchText = regionSearchText.toLowerCase();
    return regions.filter(r => r.label.toLowerCase().includes(searchText));
  }, [regionSearchText, regions]);

  const getFilteredPosts = (): Post[] => {
    let filtered = posts;

    // Filter by type
    switch (filter) {
      case 'found':
        filtered = filtered.filter(post => post.type === 'found');
        break;
      case 'lost':
        filtered = filtered.filter(post => post.type === 'lost');
        break;
      case 'reward':
        filtered = filtered.filter(post => post.reward);
        break;
    }

    // Filter by region (only using activeRegion)
    if (activeRegion) {
      // Try to find region label from predefined list
      const regionLabel = regions.find(r => r.key === activeRegion)?.label;
      const searchRegion = regionLabel || activeRegion;
      
      filtered = filtered.filter(post => {
        if (!post.region) return false;
        return post.region.toLowerCase().includes(searchRegion.toLowerCase());
      });
    }

    // Filter by item name/description (only using activeSearchQuery)
    if (activeSearchQuery.trim()) {
      const searchTerm = activeSearchQuery.toLowerCase();
      filtered = filtered.filter(post => {
        const titleMatch = post.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = post.description.toLowerCase().includes(searchTerm);
        return titleMatch || descriptionMatch;
      });
    }

    return filtered;
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
          headerStyle: { backgroundColor: staticColors.primary },
          headerTintColor: staticColors.white,
          headerRight: () => (
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                setShowRegionFilter(true);
              }}
            >
              <MaterialIcons name="filter-list" size={24} color={staticColors.white} />
              {activeRegion && <View style={styles.filterBadge} />}
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.searchInputWrapper}>
            <MaterialIcons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.topSearchInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={itemSearchText}
              onChangeText={setItemSearchText}
              placeholder={t.search.itemName}
              placeholderTextColor={colors.textSecondary}
              returnKeyType="search"
              onSubmitEditing={() => setActiveSearchQuery(itemSearchText)}
            />
            {itemSearchText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setItemSearchText('');
                  setActiveSearchQuery('');
                }}
              >
                <MaterialIcons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            {itemSearchText.length > 0 && (
              <TouchableOpacity
                style={[styles.searchActionButton, { backgroundColor: colors.primary }]}
                onPress={() => setActiveSearchQuery(itemSearchText)}
              >
                <MaterialIcons name="search" size={20} color={staticColors.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {loading && filteredPosts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name={getFilterIcon()} size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {t.search.noPostsFound}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {activeSearchQuery ? 
                `"${activeSearchQuery}" ${t.search.noResultsFor}` :
                t.search.noCategoryPosts
              }
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

        {showRegionFilter && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowRegionFilter(false)}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalWrapper}
            >
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                  <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>{t.regions.title}</Text>
                    <TouchableOpacity onPress={() => setShowRegionFilter(false)}>
                      <MaterialIcons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                      <MaterialIcons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                      <TextInput
                        style={[styles.searchInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                        value={regionSearchText}
                        onChangeText={setRegionSearchText}
                        placeholder={t.postForm.regionPlaceholder}
                        placeholderTextColor={colors.textSecondary}
                        autoFocus
                        returnKeyType="search"
                        onSubmitEditing={() => {
                          if (regionSearchText.trim()) {
                            setActiveRegion(regionSearchText);
                            setShowRegionFilter(false);
                            setRegionSearchText('');
                          }
                        }}
                      />
                      {regionSearchText.length > 0 && (
                        <TouchableOpacity
                          style={[styles.searchActionButton, { backgroundColor: colors.primary }]}
                          onPress={() => {
                            if (regionSearchText.trim()) {
                              setActiveRegion(regionSearchText);
                              setShowRegionFilter(false);
                              setRegionSearchText('');
                            }
                          }}
                        >
                          <MaterialIcons name="search" size={20} color={staticColors.white} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
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
    paddingVertical: spacing.md,
  },
  filterButton: {
    marginRight: spacing.md,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalWrapper: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    maxHeight: '50%',
    width: undefined,
  },
  modalContent: {
    borderRadius: borderRadius.xl,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  topSearchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingLeft: spacing.xl + spacing.md,
    paddingRight: 100,
    paddingVertical: spacing.sm,
    fontSize: typography.base,
  },
  clearButton: {
    position: 'absolute',
    right: 60,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  searchActionButton: {
    position: 'absolute',
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingLeft: spacing.xl + spacing.md,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.base,
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
  },
});
