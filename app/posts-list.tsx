import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
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
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [showRegionFilter, setShowRegionFilter] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(region || '');
  const [regionSearchText, setRegionSearchText] = useState('');
  const [manualRegionInput, setManualRegionInput] = useState('');

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

    // Filter by region
    const activeRegion = manualRegionInput.trim() || selectedRegion;
    if (activeRegion) {
      // Try to find region label from predefined list
      const regionLabel = regions.find(r => r.key === activeRegion)?.label;
      const searchRegion = regionLabel || activeRegion;
      
      filtered = filtered.filter(post => {
        if (!post.region) return false;
        return post.region.toLowerCase().includes(searchRegion.toLowerCase());
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
                setRegionSearchText(manualRegionInput);
              }}
            >
              <MaterialIcons name="filter-list" size={24} color={staticColors.white} />
              {(selectedRegion || manualRegionInput) && <View style={styles.filterBadge} />}
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
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

        {showRegionFilter && (
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowRegionFilter(false)}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t.regions.title}</Text>
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={[styles.searchButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setManualRegionInput(regionSearchText);
                      setSelectedRegion('');
                      setShowRegionFilter(false);
                      setRegionSearchText('');
                    }}
                  >
                    <MaterialIcons name="search" size={20} color={staticColors.white} />
                    <Text style={[styles.searchButtonText, { color: staticColors.white }]}>Qidirish</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowRegionFilter(false)}>
                    <MaterialIcons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                  <MaterialIcons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                  <TextInput
                    style={[styles.searchInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    value={regionSearchText}
                    onChangeText={(text) => {
                      setRegionSearchText(text);
                      setManualRegionInput(text);
                    }}
                    placeholder={t.postForm.regionPlaceholder}
                    placeholderTextColor={colors.textSecondary}
                    autoFocus
                    returnKeyType="search"
                  />
                </View>
              </View>
              <FlatList
                data={filteredRegionOptions}
                keyExtractor={(item) => item.key}
                style={styles.regionList}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.regionItem, { borderBottomColor: colors.border }, (selectedRegion === item.key || manualRegionInput === item.label) && { backgroundColor: colors.primary + '15' }]}
                    onPressIn={() => {
                      setSelectedRegion(item.key);
                      setManualRegionInput(item.label);
                      setShowRegionFilter(false);
                      setRegionSearchText('');
                    }}
                  >
                    <MaterialIcons name="location-city" size={20} color={(selectedRegion === item.key || manualRegionInput === item.label) ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.regionItemText, { color: (selectedRegion === item.key || manualRegionInput === item.label) ? colors.primary : colors.text }]}>
                      {item.label}
                    </Text>
                    {(selectedRegion === item.key || manualRegionInput === item.label) && (
                      <MaterialIcons name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
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
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: 40,
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
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  searchButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  searchContainer: {
    padding: spacing.md,
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
  regionList: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  regionItemText: {
    flex: 1,
    fontSize: typography.base,
  },
});
