import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useAdmin } from '@/hooks/useAdmin';
import { usePosts } from '@/hooks/usePosts';
import { useRouter } from 'expo-router';
import { PostCard } from '@/components';
import { useAlert } from '@/template';
import { useTheme } from '@/contexts/ThemeContext';

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAdmin, stats, users, loading, loadStats, loadUsers } = useAdmin();
  const { posts, refreshPosts } = usePosts();
  const { showAlert } = useAlert();
  const { colors } = useTheme();
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      showAlert('Xatolik', 'Sizda admin huquqlari yo\'q');
      router.back();
      return;
    }
    loadStats();
    loadUsers();
  }, [isAdmin]);

  const handleDeletePost = async (postId: string) => {
    showAlert(
      'E\'lonni o\'chirish',
      'Ushbu e\'lonni o\'chirishni xohlaysizmi?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'O\'chirish',
          style: 'destructive',
          onPress: async () => {
            setDeleting(postId);
            const { deletePost } = useAdmin();
            const success = await deletePost(postId);
            setDeleting(null);
            if (success) {
              showAlert('Muvaffaqiyatli', 'E\'lon o\'chirildi');
              refreshPosts();
            } else {
              showAlert('Xatolik', 'E\'lonni o\'chirishda xatolik');
            }
          },
        },
      ]
    );
  };

  if (loading && !stats) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <TouchableOpacity onPress={() => { loadStats(); loadUsers(); refreshPosts(); }}>
          <MaterialIcons name="refresh" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Statistika</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
              <MaterialIcons name="people" size={32} color={colors.white} />
              <Text style={styles.statNumber}>{stats?.totalUsers || 0}</Text>
              <Text style={styles.statLabel}>Foydalanuvchilar</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.info }]}>
              <MaterialIcons name="article" size={32} color={colors.white} />
              <Text style={styles.statNumber}>{stats?.totalPosts || 0}</Text>
              <Text style={styles.statLabel}>Jami e'lonlar</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.found }]}>
              <MaterialIcons name="search" size={32} color={colors.white} />
              <Text style={styles.statNumber}>{stats?.foundPosts || 0}</Text>
              <Text style={styles.statLabel}>Topilgan</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.lost }]}>
              <MaterialIcons name="warning" size={32} color={colors.white} />
              <Text style={styles.statNumber}>{stats?.lostPosts || 0}</Text>
              <Text style={styles.statLabel}>Yo'qotilgan</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.reward }]}>
              <MaterialIcons name="star" size={32} color={colors.white} />
              <Text style={styles.statNumber}>{stats?.rewardPosts || 0}</Text>
              <Text style={styles.statLabel}>Mukofotli</Text>
            </View>
          </View>
        </View>

        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Barcha e'lonlar</Text>
          {posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inbox" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>E'lonlar yo'q</Text>
            </View>
          ) : (
            posts.map(post => (
              <View key={post.id} style={styles.postItem}>
                <PostCard post={post} />
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    deleting === post.id && styles.deleteButtonDisabled,
                  ]}
                  onPress={() => handleDeletePost(post.id)}
                  disabled={deleting === post.id}
                >
                  {deleting === post.id ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <MaterialIcons name="delete" size={20} color={colors.white} />
                      <Text style={styles.deleteButtonText}>O'chirish</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  statCard: {
    width: '48%',
    margin: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  statNumber: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: '#FFFFFF',
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.sm,
    color: '#FFFFFF',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  postsSection: {
    padding: spacing.md,
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.lg,
    marginTop: spacing.md,
  },
  postItem: {
    marginBottom: spacing.md,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: typography.base,
    fontWeight: typography.semibold,
    marginLeft: spacing.xs,
  },
});
