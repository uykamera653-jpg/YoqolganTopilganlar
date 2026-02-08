import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, staticColors } from '@/constants/theme';
import { usePosts } from '@/hooks/usePosts';
import { Post } from '@/types';
import { PostCard } from '@/components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

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
    if (selectedRegion) {
      const regionLabel = regions.find(r => r.key === selectedRegion)?.label;
      if (regionLabel) {
        filtered = filtered.filter(post => post.region === regionLabel);
      }
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
              onPress={() => setShowRegionFilter(true)}
            >
              <MaterialIcons name="filter-list" size={24} color={staticColors.white} />
              {selectedRegion && <View style={styles.filterBadge} />}
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

        <Modal
          visible={showRegionFilter}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowRegionFilter(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowRegionFilter(false)}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t.regions.title}</Text>
                <TouchableOpacity onPress={() => setShowRegionFilter(false)}>
                  <MaterialIcons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.regionList} showsVerticalScrollIndicator={false}>
                {regions.map((r) => (
                  <TouchableOpacity
                    key={r.key}
                    style={[styles.regionItem, { borderBottomColor: colors.border }, selectedRegion === r.key && { backgroundColor: colors.primary + '10' }]}
                    onPress={() => {
                      setSelectedRegion(r.key);
                      setShowRegionFilter(false);
                    }}
                  >
                    <Text style={[styles.regionItemText, { color: selectedRegion === r.key ? colors.primary : colors.text }]}>
                      {r.label}
                    </Text>
                    {selectedRegion === r.key && (
                      <MaterialIcons name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
  },
  regionList: {
    maxHeight: 400,
  },
  regionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  regionItemText: {
    fontSize: typography.base,
  },
});
