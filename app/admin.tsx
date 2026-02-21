import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useAdmin } from '@/hooks/useAdmin';
import { reportService } from '@/services/reportService';
import { adminService } from '@/services/adminService';
import { usePosts } from '@/hooks/usePosts';
import { useRouter } from 'expo-router';
import { PostCard } from '@/components';
import { useAlert } from '@/template';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Report } from '@/types';

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAdmin, stats, users, loading, loadStats, loadUsers } = useAdmin();
  const { posts, refreshPosts } = usePosts();
  const { showAlert } = useAlert();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'posts' | 'reports'>('stats');
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      showAlert(t.error, 'Sizda admin huquqlari yo\'q');
      router.back();
      return;
    }
    loadStats();
    loadUsers();
    loadReports();
  }, [isAdmin]);

  const loadReports = async () => {
    setReportsLoading(true);
    const { data } = await reportService.getAllReports();
    if (data) {
      setReports(data);
    }
    setReportsLoading(false);
  };

  const handleDeletePost = async (postId: string) => {
    showAlert(
      t.postDetail.confirmDelete,
      '',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            setDeleting(postId);
            const { deletePost } = useAdmin();
            const success = await deletePost(postId);
            setDeleting(null);
            if (success) {
              showAlert(t.success, t.postDetail.postDeleted);
              refreshPosts();
            } else {
              showAlert(t.error, t.errors.generic);
            }
          },
        },
      ]
    );
  };

  const handleReportAction = async (
    reportId: string,
    action: 'reviewed' | 'resolved' | 'dismissed' | 'delete_post'
  ) => {
    if (action === 'delete_post') {
      showAlert(
        t.reports.confirmDeletePost,
        '',
        [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.delete,
            style: 'destructive',
            onPress: async () => {
              const report = reports.find(r => r.id === reportId);
              if (!report) return;

              const { error } = await adminService.deletePost(report.post_id);
              if (error) {
                showAlert(t.error, error);
              } else {
                await reportService.updateReportStatus(reportId, 'resolved', 'Post deleted by admin');
                showAlert(t.success, t.reports.postDeletedSuccess);
                loadReports();
                refreshPosts();
              }
            },
          },
        ]
      );
    } else {
      const { success, error } = await reportService.updateReportStatus(reportId, action);
      if (success) {
        loadReports();
      } else {
        showAlert(t.error, error || t.errors.generic);
      }
    }
  };

  const renderReportCard = ({ item }: { item: Report }) => {
    const getStatusColor = () => {
      switch (item.status) {
        case 'pending':
          return '#F59E0B';
        case 'reviewed':
          return '#3B82F6';
        case 'resolved':
          return '#10B981';
        case 'dismissed':
          return '#EF4444';
        default:
          return colors.textSecondary;
      }
    };

    return (
      <View style={[styles.reportCard, { backgroundColor: colors.surface }]}>
        <View style={styles.reportHeader}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {t.reports.status[item.status]}
            </Text>
          </View>
          <Text style={[styles.reportDate, { color: colors.textSecondary }]}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        <Text style={[styles.reportPostTitle, { color: colors.text }]}>
          {item.posts?.title || 'E\'lon'}
        </Text>

        <View style={[styles.reportCategory, { backgroundColor: colors.background }]}>
          <Text style={[styles.reportCategoryText, { color: colors.textSecondary }]}>
            {t.reports.categories[item.category]}
          </Text>
        </View>

        <Text style={[styles.reportReason, { color: colors.text }]}>{item.reason}</Text>

        <Text style={[styles.reportBy, { color: colors.textSecondary }]}>
          {t.postDetail.postedBy}: {item.user_profiles?.username || t.profile.username}
        </Text>

        {item.status === 'pending' && (
          <View style={styles.reportActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
              onPress={() => handleReportAction(item.id, 'reviewed')}
            >
              <MaterialIcons name="visibility" size={16} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>
                {t.reports.markAsReviewed}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={() => handleReportAction(item.id, 'resolved')}
            >
              <MaterialIcons name="check-circle" size={16} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>
                {t.reports.markAsResolved}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
              onPress={() => handleReportAction(item.id, 'delete_post')}
            >
              <MaterialIcons name="delete" size={16} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>
                {t.reports.deletePost}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.viewPostButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push(`/post-detail?id=${item.post_id}`)}
        >
          <MaterialIcons name="open-in-new" size={16} color={colors.white} />
          <Text style={[styles.viewPostButtonText, { color: colors.white }]}>
            {t.reports.viewPost}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !stats) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
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
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <TouchableOpacity onPress={() => { loadStats(); loadUsers(); refreshPosts(); loadReports(); }}>
          <MaterialIcons name="refresh" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, { backgroundColor: colors.background }, activeTab === 'stats' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('stats')}
        >
          <MaterialIcons
            name="bar-chart"
            size={20}
            color={activeTab === 'stats' ? colors.white : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'stats' ? colors.white : colors.text },
            ]}
          >
            Statistika
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, { backgroundColor: colors.background }, activeTab === 'posts' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('posts')}
        >
          <MaterialIcons
            name="article"
            size={20}
            color={activeTab === 'posts' ? colors.white : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'posts' ? colors.white : colors.text },
            ]}
          >
            E'lonlar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, { backgroundColor: colors.background }, activeTab === 'reports' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('reports')}
        >
          <MaterialIcons
            name="flag"
            size={20}
            color={activeTab === 'reports' ? colors.white : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'reports' ? colors.white : colors.text },
            ]}
          >
            {t.reports.title}
          </Text>
          {reports.filter(r => r.status === 'pending').length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {reports.filter(r => r.status === 'pending').length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'stats' && (
          <View style={styles.statsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistika</Text>
            
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
                <MaterialIcons name="people" size={32} color={colors.white} />
                <Text style={[styles.statNumber, { color: colors.white }]}>{stats?.totalUsers || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.white }]}>Foydalanuvchilar</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.info }]}>
                <MaterialIcons name="article" size={32} color={colors.white} />
                <Text style={[styles.statNumber, { color: colors.white }]}>{stats?.totalPosts || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.white }]}>Jami e'lonlar</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.found }]}>
                <MaterialIcons name="search" size={32} color={colors.white} />
                <Text style={[styles.statNumber, { color: colors.white }]}>{stats?.foundPosts || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.white }]}>Topilgan</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.lost }]}>
                <MaterialIcons name="warning" size={32} color={colors.white} />
                <Text style={[styles.statNumber, { color: colors.white }]}>{stats?.lostPosts || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.white }]}>Yo'qotilgan</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.reward }]}>
                <MaterialIcons name="star" size={32} color={colors.white} />
                <Text style={[styles.statNumber, { color: colors.white }]}>{stats?.rewardPosts || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.white }]}>Mukofotli</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'posts' && (
          <View style={styles.postsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Barcha e'lonlar</Text>
            {posts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="inbox" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.text }]}>E'lonlar yo'q</Text>
              </View>
            ) : (
              posts.map(post => (
                <View key={post.id} style={styles.postItem}>
                  <PostCard post={post} />
                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      { backgroundColor: colors.danger },
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
                        <Text style={[styles.deleteButtonText, { color: colors.white }]}>O'chirish</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'reports' && (
          reportsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : reports.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="flag" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>{t.reports.noReports}</Text>
            </View>
          ) : (
            <FlatList
              data={reports}
              keyExtractor={(item) => item.id}
              renderItem={renderReportCard}
              contentContainerStyle={{ paddingBottom: spacing.xl }}
              scrollEnabled={false}
            />
          )
        )}
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
    paddingVertical: spacing.xxl,
  },
  tabBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    position: 'relative',
  },
  tabText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.sm,
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
    fontSize: typography.base,
    fontWeight: typography.semibold,
    marginLeft: spacing.xs,
  },
  reportCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
  reportDate: {
    fontSize: typography.xs,
  },
  reportPostTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    marginBottom: spacing.sm,
  },
  reportCategory: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  reportCategoryText: {
    fontSize: typography.xs,
  },
  reportReason: {
    fontSize: typography.sm,
    marginBottom: spacing.sm,
  },
  reportBy: {
    fontSize: typography.xs,
    marginBottom: spacing.md,
  },
  reportActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  actionButtonText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
  viewPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  viewPostButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
});
