import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, TextInput, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useAdmin } from '@/hooks/useAdmin';
import { reportService } from '@/services/reportService';
import { adminService } from '@/services/adminService';
import { advertisementService } from '@/services/advertisementService';
import { usePosts } from '@/hooks/usePosts';
import { useRouter } from 'expo-router';
import { PostCard } from '@/components';
import { useAlert, useAuth } from '@/template';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Report, Advertisement } from '@/types';

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, stats, users, loading, loadStats, loadUsers, deletePost: deleteAdminPost } = useAdmin();
  const { posts, refreshPosts } = usePosts();
  const { showAlert } = useAlert();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'posts' | 'reports' | 'ads'>('stats');
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [adForm, setAdForm] = useState({
    type: 'text' as 'text' | 'image' | 'video',
    title: '',
    content: '',
    media_url: '',
    link_url: '',
    display_order: 0,
    slide_duration: 5,
    is_active: true,
  });
  const [savingAd, setSavingAd] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    console.log('Admin screen - State:', { isAdmin, loading, userEmail: user?.email });
    
    // Wait for admin check to complete and load data only once
    if (!loading && !dataLoaded) {
      console.log('Admin screen - Loading complete, isAdmin:', isAdmin);
      
      if (!isAdmin) {
        console.log('Admin screen - User is NOT admin, showing error and going back');
        showAlert(t.error, 'Sizda admin huquqlari yo\'q');
        router.back();
        return;
      }
      
      console.log('Admin screen - User IS admin, loading data');
      loadInitialData();
      setDataLoaded(true);
    }
  }, [loading, isAdmin, dataLoaded]);

  const loadInitialData = async () => {
    console.log('Admin - Loading initial data...');
    await Promise.all([
      loadStats(),
      loadUsers(),
      loadReports(),
      loadAds(),
    ]);
    console.log('Admin - Initial data loaded');
  };

  const loadReports = async () => {
    setReportsLoading(true);
    const { data } = await reportService.getAllReports();
    if (data) {
      setReports(data);
    }
    setReportsLoading(false);
  };

  const loadAds = async () => {
    setAdsLoading(true);
    const { data } = await advertisementService.getAllAds();
    if (data) {
      setAds(data);
    }
    setAdsLoading(false);
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
            const success = await deleteAdminPost(postId);
            setDeleting(null);
            if (success) {
              showAlert(t.success, t.postDetail.postDeleted);
              await refreshPosts();
              await loadStats();
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

  const openAdModal = (ad?: Advertisement) => {
    if (ad) {
      setEditingAd(ad);
      setAdForm({
        type: ad.type,
        title: ad.title,
        content: ad.content || '',
        media_url: ad.media_url || '',
        link_url: ad.link_url,
        display_order: ad.display_order,
        slide_duration: ad.slide_duration || 5,
        is_active: ad.is_active,
      });
    } else {
      setEditingAd(null);
      setAdForm({
        type: 'text',
        title: '',
        content: '',
        media_url: '',
        link_url: '',
        display_order: ads.length,
        slide_duration: 5,
        is_active: true,
      });
    }
    setShowAdModal(true);
  };

  const closeAdModal = () => {
    setShowAdModal(false);
    setEditingAd(null);
    setAdForm({
      type: 'text',
      title: '',
      content: '',
      media_url: '',
      link_url: '',
      display_order: 0,
      slide_duration: 5,
      is_active: true,
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert(t.error, t.errors.uploadError);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setAdForm({ ...adForm, media_url: `data:image/jpeg;base64,${result.assets[0].base64}` });
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert(t.error, t.errors.uploadError);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setAdForm({ ...adForm, media_url: `data:video/mp4;base64,${result.assets[0].base64}` });
    }
  };

  const handleSaveAd = async () => {
    if (!adForm.title.trim()) {
      showAlert(t.error, t.advertisements.titleRequired);
      return;
    }
    if (!adForm.link_url.trim()) {
      showAlert(t.error, t.advertisements.linkRequired);
      return;
    }

    setSavingAd(true);

    let finalMediaUrl = adForm.media_url;

    // Upload image if it's base64
    if (adForm.type === 'image' && adForm.media_url && adForm.media_url.startsWith('data:')) {
      console.log('📤 Uploading image to storage...');
      const { url, error } = await advertisementService.uploadImage(adForm.media_url);
      if (error) {
        console.error('❌ Image upload error:', error);
        setSavingAd(false);
        showAlert(t.error, error);
        return;
      }
      finalMediaUrl = url || '';
      console.log('✅ Image uploaded, URL:', finalMediaUrl?.substring(0, 80));
    }

    // Upload video if it's base64
    if (adForm.type === 'video' && adForm.media_url && adForm.media_url.startsWith('data:')) {
      console.log('📤 Uploading video to storage...');
      const { url, error } = await advertisementService.uploadVideo(adForm.media_url);
      if (error) {
        console.error('❌ Video upload error:', error);
        setSavingAd(false);
        showAlert(t.error, error);
        return;
      }
      finalMediaUrl = url || '';
      console.log('✅ Video uploaded, URL:', finalMediaUrl?.substring(0, 80));
    }

    console.log('💾 Saving ad with final media URL:', finalMediaUrl?.substring(0, 80));

    if (editingAd) {
      const { error } = await advertisementService.updateAd(editingAd.id, {
        ...adForm,
        media_url: finalMediaUrl,
      });
      if (error) {
        setSavingAd(false);
        showAlert(t.error, error);
      } else {
        setSavingAd(false);
        showAlert(t.success, t.advertisements.adUpdated);
        closeAdModal();
        loadAds();
      }
    } else {
      const { error } = await advertisementService.createAd({
        ...adForm,
        media_url: finalMediaUrl,
      });
      if (error) {
        setSavingAd(false);
        showAlert(t.error, error);
      } else {
        setSavingAd(false);
        showAlert(t.success, t.advertisements.adCreated);
        closeAdModal();
        loadAds();
      }
    }
  };

  const handleDeleteAd = async (adId: string) => {
    showAlert(
      t.advertisements.deleteAd,
      t.advertisements.confirmDelete,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            const { error } = await advertisementService.deleteAd(adId);
            if (error) {
              showAlert(t.error, error);
            } else {
              showAlert(t.success, t.advertisements.adDeleted);
              loadAds();
            }
          },
        },
      ]
    );
  };

  const handleToggleAdStatus = async (adId: string, currentStatus: boolean) => {
    const { error } = await advertisementService.toggleAdStatus(adId, !currentStatus);
    if (error) {
      showAlert(t.error, error);
    } else {
      loadAds();
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
          <Text style={styles.headerTitle}>{t.admin.title}</Text>
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
        <Text style={styles.headerTitle}>{t.admin.title}</Text>
        <TouchableOpacity onPress={() => { loadInitialData(); refreshPosts(); }}>
          <MaterialIcons name="refresh" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
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
            {t.admin.statistics}
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
            {t.admin.posts}
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

        <TouchableOpacity
          style={[styles.tab, { backgroundColor: colors.background }, activeTab === 'ads' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('ads')}
        >
          <MaterialIcons
            name="campaign"
            size={20}
            color={activeTab === 'ads' ? colors.white : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'ads' ? colors.white : colors.text },
            ]}
          >
            {t.admin.advertisements}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'stats' && (
          <View style={styles.statsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.admin.statistics}</Text>
            
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
                <MaterialIcons name="people" size={32} color={colors.white} />
                <Text style={[styles.statNumber, { color: colors.white }]}>{stats?.totalUsers || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.white }]}>{t.admin.totalUsers}</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.info }]}>
                <MaterialIcons name="article" size={32} color={colors.white} />
                <Text style={[styles.statNumber, { color: colors.white }]}>{stats?.totalPosts || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.white }]}>{t.admin.totalPosts}</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.found }]}>
                <MaterialIcons name="search" size={32} color={colors.white} />
                <Text style={[styles.statNumber, { color: colors.white }]}>{stats?.foundPosts || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.white }]}>{t.admin.foundPosts}</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.lost }]}>
                <MaterialIcons name="warning" size={32} color={colors.white} />
                <Text style={[styles.statNumber, { color: colors.white }]}>{stats?.lostPosts || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.white }]}>{t.admin.lostPosts}</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.reward }]}>
                <MaterialIcons name="star" size={32} color={colors.white} />
                <Text style={[styles.statNumber, { color: colors.white }]}>{stats?.rewardPosts || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.white }]}>{t.admin.rewardPosts}</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'posts' && (
          <View style={styles.postsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.admin.allPosts}</Text>
            {posts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="inbox" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.text }]}>{t.admin.noPosts}</Text>
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
                        <Text style={[styles.deleteButtonText, { color: colors.white }]}>{t.admin.deletePost}</Text>
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

        {activeTab === 'ads' && (
          <View style={styles.adsSection}>
            <View style={styles.adsSectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.advertisements.title}</Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={() => openAdModal()}
              >
                <MaterialIcons name="add" size={24} color={colors.white} />
                <Text style={styles.addButtonText}>{t.advertisements.addNew}</Text>
              </TouchableOpacity>
            </View>

            {adsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : ads.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="campaign" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.text }]}>{t.advertisements.noAds}</Text>
              </View>
            ) : (
              ads.map(ad => (
                <View key={ad.id} style={[styles.adCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.adCardHeader}>
                    <View style={styles.adCardInfo}>
                      <Text style={[styles.adCardTitle, { color: colors.text }]}>{ad.title}</Text>
                      <View style={styles.adCardMeta}>
                        <View style={[styles.adTypeBadge, { backgroundColor: ad.type === 'video' ? '#8B5CF6' : ad.type === 'image' ? '#10B981' : '#3B82F6' }]}>
                          <Text style={styles.adTypeBadgeText}>
                            {ad.type === 'video' ? t.advertisements.typeVideo : ad.type === 'image' ? 'Rasm' : t.advertisements.typeText}
                          </Text>
                        </View>
                        <View style={[styles.adStatusBadge, { backgroundColor: ad.is_active ? '#10B981' : '#EF4444' }]}>
                          <Text style={styles.adStatusBadgeText}>
                            {ad.is_active ? t.admin.activeAds : t.admin.inactiveAds}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {ad.media_url && (
                    <Text style={[styles.adMediaInfo, { color: colors.textSecondary }]} numberOfLines={1}>
                      📎 URL: {ad.media_url.substring(0, 50)}...
                    </Text>
                  )}

                  {ad.content && (
                    <Text style={[styles.adCardContent, { color: colors.textSecondary }]} numberOfLines={2}>
                      {ad.content}
                    </Text>
                  )}

                  <View style={styles.adCardActions}>
                    <TouchableOpacity
                      style={[styles.adActionButton, { backgroundColor: colors.primary }]}
                      onPress={() => openAdModal(ad)}
                    >
                      <MaterialIcons name="edit" size={16} color={colors.white} />
                      <Text style={styles.adActionButtonText}>{t.edit}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.adActionButton, { backgroundColor: ad.is_active ? '#F59E0B' : '#10B981' }]}
                      onPress={() => handleToggleAdStatus(ad.id, ad.is_active)}
                    >
                      <MaterialIcons name={ad.is_active ? 'visibility-off' : 'visibility'} size={16} color={colors.white} />
                      <Text style={styles.adActionButtonText}>{t.admin.toggleStatus}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.adActionButton, { backgroundColor: colors.danger }]}
                      onPress={() => handleDeleteAd(ad.id)}
                    >
                      <MaterialIcons name="delete" size={16} color={colors.white} />
                      <Text style={styles.adActionButtonText}>{t.delete}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Ad Modal */}
      {showAdModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingAd ? t.advertisements.editAd : t.advertisements.createAd}
              </Text>
              <TouchableOpacity onPress={closeAdModal}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t.advertisements.type}</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeSelectorButton,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    adForm.type === 'text' && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setAdForm({ ...adForm, type: 'text', media_url: '' })}
                >
                  <MaterialIcons name="text-fields" size={20} color={adForm.type === 'text' ? colors.white : colors.text} />
                  <Text style={[styles.typeButtonText, { color: adForm.type === 'text' ? colors.white : colors.text }]}>
                    {t.advertisements.typeText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeSelectorButton,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    adForm.type === 'image' && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setAdForm({ ...adForm, type: 'image', media_url: '' })}
                >
                  <MaterialIcons name="image" size={20} color={adForm.type === 'image' ? colors.white : colors.text} />
                  <Text style={[styles.typeButtonText, { color: adForm.type === 'image' ? colors.white : colors.text }]}>
                    Rasm
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeSelectorButton,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    adForm.type === 'video' && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setAdForm({ ...adForm, type: 'video', media_url: '' })}
                >
                  <MaterialIcons name="videocam" size={20} color={adForm.type === 'video' ? colors.white : colors.text} />
                  <Text style={[styles.typeButtonText, { color: adForm.type === 'video' ? colors.white : colors.text }]}>
                    {t.advertisements.typeVideo}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>{t.advertisements.adTitle}</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                value={adForm.title}
                onChangeText={(text) => setAdForm({ ...adForm, title: text })}
                placeholder={t.advertisements.adTitle}
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>{t.advertisements.content}</Text>
              <TextInput
                style={[styles.textArea, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                value={adForm.content}
                onChangeText={(text) => setAdForm({ ...adForm, content: text })}
                placeholder={t.advertisements.content}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />

              {adForm.type === 'image' && (
                <>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Rasm yuklash</Text>
                  <TouchableOpacity
                    style={[styles.uploadButton, { backgroundColor: colors.primary }]}
                    onPress={pickImage}
                  >
                    <MaterialIcons name="upload" size={20} color={colors.white} />
                    <Text style={styles.uploadButtonText}>
                      {adForm.media_url ? 'Rasm tanlandi ✓' : 'Rasm yuklash'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {adForm.type === 'video' && (
                <>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>{t.advertisements.videoUrl}</Text>
                  <TouchableOpacity
                    style={[styles.uploadButton, { backgroundColor: colors.primary }]}
                    onPress={pickVideo}
                  >
                    <MaterialIcons name="upload" size={20} color={colors.white} />
                    <Text style={styles.uploadButtonText}>
                      {adForm.media_url ? t.advertisements.uploadVideo + ' ✓' : t.advertisements.uploadVideo}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <Text style={[styles.inputLabel, { color: colors.text }]}>{t.advertisements.linkUrl}</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                value={adForm.link_url}
                onChangeText={(text) => setAdForm({ ...adForm, link_url: text })}
                placeholder="https://t.me/findosam"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t.advertisements.slideDuration}
              </Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                value={String(adForm.slide_duration)}
                onChangeText={(text) => {
                  // Allow only numeric input
                  const numericValue = text.replace(/[^0-9]/g, '');
                  
                  if (numericValue === '') {
                    // If empty, keep current value but allow editing
                    setAdForm({ ...adForm, slide_duration: 1 });
                    return;
                  }
                  
                  // Parse and clamp value between 1 and 60
                  const duration = parseInt(numericValue, 10);
                  const clampedDuration = Math.max(1, Math.min(60, duration));
                  setAdForm({ ...adForm, slide_duration: clampedDuration });
                }}
                onBlur={() => {
                  // Ensure minimum value on blur
                  if (adForm.slide_duration < 1) {
                    setAdForm({ ...adForm, slide_duration: 1 });
                  }
                }}
                placeholder="5"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                {t.advertisements.slideDurationHelper}
              </Text>

              <View style={styles.switchRow}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t.advertisements.isActive}</Text>
                <Switch
                  value={adForm.is_active}
                  onValueChange={(value) => setAdForm({ ...adForm, is_active: value })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.textSecondary }]}
                onPress={closeAdModal}
              >
                <Text style={styles.modalButtonText}>{t.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveAd}
                disabled={savingAd}
              >
                {savingAd ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.modalButtonText}>{t.save}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
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
  adsSection: {
    padding: spacing.md,
  },
  adsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  adCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  adCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  adCardInfo: {
    flex: 1,
  },
  adCardTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    marginBottom: spacing.xs,
  },
  adCardMeta: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  adTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  adTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
  adStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  adStatusBadgeText: {
    color: '#FFFFFF',
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
  adMediaInfo: {
    fontSize: typography.xs,
    marginBottom: spacing.xs,
    fontFamily: 'monospace',
  },
  adCardContent: {
    fontSize: typography.sm,
    marginBottom: spacing.md,
  },
  adCardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  adActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  adActionButtonText: {
    color: '#FFFFFF',
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
  },
  modalBody: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.base,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.base,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    gap: spacing.xs,
  },
  typeSelectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    gap: spacing.xs,
  },
  typeButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  helperText: {
    fontSize: typography.xs,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});
