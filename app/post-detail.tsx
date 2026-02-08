import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { staticColors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { postService } from '@/services/postService';
import { Post, Comment } from '@/types';
import { useAuth, useAlert } from '@/template';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const { t } = useLanguage();
  const { colors } = useTheme();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    loadPostAndComments();
  }, [id]);

  const loadPostAndComments = async () => {
    setLoading(true);
    const { data: postData } = await postService.fetchPostById(id as string);
    const { data: commentsData } = await postService.fetchComments(id as string);

    if (postData) setPost(postData);
    if (commentsData) setComments(commentsData);
    setLoading(false);
  };

  const handleAddComment = async () => {
    if (!user) {
      showAlert(t.error || 'Kirish kerak', t.auth?.loginRequired || 'Sharh yozish uchun tizimga kiring', [
        { text: t.cancel || 'Bekor qilish', style: 'cancel' },
        { text: t.auth?.login || 'Kirish', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (!newComment.trim()) {
      showAlert(t.error, t.errors?.fillAllFields || 'Sharh matni kiriting');
      return;
    }

    setCommentLoading(true);
    const { data, error } = await postService.addComment(id as string, newComment.trim());

    if (error) {
      showAlert(t.error, error);
    } else if (data) {
      setComments(prev => [...prev, data]);
      setNewComment('');
    }

    setCommentLoading(false);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={staticColors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <MaterialIcons name="error-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>E'lon topilmadi</Text>
      </View>
    );
  }

  const typeColor = post.type === 'found' ? staticColors.found : staticColors.lost;
  const typeLabel = post.type === 'found' ? t.postTypes.found : t.postTypes.lost;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'E\'lon',
          headerShown: true,
          headerStyle: { backgroundColor: staticColors.primary },
          headerTintColor: staticColors.white,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
          {post.image_url && (
            <Image
              source={{ uri: post.image_url }}
              style={styles.image}
              contentFit="cover"
            />
          )}

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={[styles.badge, { backgroundColor: typeColor + '20' }]}>
                <Text style={[styles.badgeText, { color: typeColor }]}>{typeLabel}</Text>
              </View>
              {post.reward && (
                <View style={[styles.badge, { backgroundColor: staticColors.reward + '20' }]}>
                  <MaterialIcons name="star" size={16} color={staticColors.reward} />
                  <Text style={[styles.badgeText, { color: staticColors.reward, marginLeft: spacing.xs }]}>
                    {t.home.reward}: {post.reward}
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{post.description}</Text>

            <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
              {post.region && (
                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                  <MaterialIcons name="location-city" size={24} color={staticColors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Viloyat</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{post.region}</Text>
                  </View>
                </View>
              )}

              <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <MaterialIcons name="location-on" size={24} color={staticColors.primary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Joylashuv</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{post.location}</Text>
                </View>
              </View>

              {post.date_occurred && (
                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                  <MaterialIcons name="calendar-today" size={24} color={staticColors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Sana</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{post.date_occurred}</Text>
                  </View>
                </View>
              )}

              <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <MaterialIcons name="phone" size={24} color={staticColors.primary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Aloqa</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{post.contact}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.callButton, { backgroundColor: staticColors.success }]}
                  onPress={() => handleCall(post.contact)}
                >
                  <MaterialIcons name="call" size={20} color={staticColors.white} />
                </TouchableOpacity>
              </View>

              {user && post.user_id !== user.id && (
                <TouchableOpacity
                  style={[styles.messageButton, { backgroundColor: staticColors.primary }]}
                  onPress={() => router.push(`/send-message?userId=${post.user_id}&username=${post.user_profiles?.username || t.profile.username}`)}
                >
                  <MaterialIcons name="chat" size={20} color={staticColors.white} />
                  <Text style={[styles.messageButtonText, { color: staticColors.white }]}>Xabar yuborish</Text>
                </TouchableOpacity>
              )}

              <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <MaterialIcons name="access-time" size={24} color={staticColors.primary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>E'lon vaqti</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(post.created_at)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.commentsSection}>
              <Text style={[styles.commentsTitle, { color: colors.text }]}>Sharhlar ({comments.length})</Text>

              {comments.length === 0 ? (
                <View style={styles.emptyComments}>
                  <MaterialIcons name="comment" size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyCommentsText, { color: colors.textSecondary }]}>Hozircha sharhlar yo'q</Text>
                </View>
              ) : (
                comments.map(comment => (
                  <View key={comment.id} style={[styles.commentCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.commentHeader}>
                      <View style={[styles.commentAvatar, { backgroundColor: staticColors.primary }]}>
                        <MaterialIcons name="person" size={20} color={staticColors.white} />
                      </View>
                      <View style={styles.commentInfo}>
                        <Text style={[styles.commentAuthor, { color: colors.text }]}>
                          {comment.user_profile?.username || t.profile.username}
                        </Text>
                        <Text style={[styles.commentDate, { color: colors.textSecondary }]}>
                          {formatDate(comment.created_at)}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.commentText, { color: colors.text }]}>{comment.comment}</Text>
                  </View>
                ))
              )}

              <View style={styles.addCommentSection}>
                <TextInput
                  style={[styles.commentInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Sharh yozing..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: staticColors.primary }, commentLoading && styles.sendButtonDisabled]}
                  onPress={handleAddComment}
                  disabled={commentLoading}
                >
                  {commentLoading ? (
                    <ActivityIndicator size="small" color={staticColors.white} />
                  ) : (
                    <MaterialIcons name="send" size={24} color={staticColors.white} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.lg,
    marginTop: spacing.md,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
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
    fontSize: typography.sm,
    fontWeight: typography.medium,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.base,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  infoSection: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoLabel: {
    fontSize: typography.sm,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.base,
    fontWeight: typography.medium,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  messageButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    marginLeft: spacing.sm,
  },
  commentsSection: {
    marginTop: spacing.md,
  },
  commentsTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    marginBottom: spacing.md,
  },
  emptyComments: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: typography.base,
    marginTop: spacing.sm,
  },
  commentCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  commentAuthor: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  commentDate: {
    fontSize: typography.xs,
    marginTop: spacing.xs,
  },
  commentText: {
    fontSize: typography.base,
    lineHeight: 20,
  },
  addCommentSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.base,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});
