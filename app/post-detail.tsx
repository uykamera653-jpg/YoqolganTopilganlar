import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { postService } from '@/services/postService';
import { Post, Comment } from '@/types';
import { useAuth, useAlert } from '@/template';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

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
      showAlert('Kirish kerak', 'Sharh yozish uchun tizimga kiring', [
        { text: 'Bekor qilish', style: 'cancel' },
        { text: 'Kirish', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (!newComment.trim()) {
      showAlert('Xato', 'Sharh matni kiriting');
      return;
    }

    setCommentLoading(true);
    const { data, error } = await postService.addComment(id as string, newComment.trim());

    if (error) {
      showAlert('Xato', error);
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.errorText}>E'lon topilmadi</Text>
      </View>
    );
  }

  const typeColor = post.type === 'found' ? colors.found : colors.lost;
  const typeLabel = post.type === 'found' ? 'Topilgan' : 'Yo\'qotilgan';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
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
              <View style={[styles.badge, { backgroundColor: colors.reward + '20' }]}>
                <MaterialIcons name="star" size={16} color={colors.reward} />
                <Text style={[styles.badgeText, { color: colors.reward, marginLeft: spacing.xs }]}>
                  Mukofot: {post.reward}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.description}>{post.description}</Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={24} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Joylashuv</Text>
                <Text style={styles.infoValue}>{post.location}</Text>
              </View>
            </View>

            {post.date_occurred && (
              <View style={styles.infoRow}>
                <MaterialIcons name="calendar-today" size={24} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Sana</Text>
                  <Text style={styles.infoValue}>{post.date_occurred}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={24} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Aloqa</Text>
                <Text style={styles.infoValue}>{post.contact}</Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(post.contact)}
              >
                <MaterialIcons name="call" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>

            {user && post.user_id !== user.id && (
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => router.push(`/send-message?userId=${post.user_id}&username=${post.user_profiles?.username || 'Foydalanuvchi'}`)}
              >
                <MaterialIcons name="chat" size={20} color={colors.white} />
                <Text style={styles.messageButtonText}>Xabar yuborish</Text>
              </TouchableOpacity>
            )}

            <View style={styles.infoRow}>
              <MaterialIcons name="access-time" size={24} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>E'lon vaqti</Text>
                <Text style={styles.infoValue}>{formatDate(post.created_at)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Sharhlar ({comments.length})</Text>

            {comments.length === 0 ? (
              <View style={styles.emptyComments}>
                <MaterialIcons name="comment" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyCommentsText}>Hozircha sharhlar yo'q</Text>
              </View>
            ) : (
              comments.map(comment => (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentAvatar}>
                      <MaterialIcons name="person" size={20} color={colors.white} />
                    </View>
                    <View style={styles.commentInfo}>
                      <Text style={styles.commentAuthor}>
                        {comment.user_profile?.username || 'Foydalanuvchi'}
                      </Text>
                      <Text style={styles.commentDate}>
                        {formatDate(comment.created_at)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.commentText}>{comment.comment}</Text>
                </View>
              ))
            )}

            <View style={styles.addCommentSection}>
              <TextInput
                style={styles.commentInput}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Sharh yozing..."
                placeholderTextColor={colors.textSecondary}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, commentLoading && styles.sendButtonDisabled]}
                onPress={handleAddComment}
                disabled={commentLoading}
              >
                {commentLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <MaterialIcons name="send" size={24} color={colors.white} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: colors.surfaceSecondary,
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
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.base,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  infoSection: {
    backgroundColor: colors.surface,
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
    borderBottomColor: colors.border,
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.base,
    color: colors.text,
    fontWeight: typography.medium,
  },
  callButton: {
    backgroundColor: colors.success,
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
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  messageButtonText: {
    color: colors.white,
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
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyComments: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  commentCard: {
    backgroundColor: colors.surface,
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
    backgroundColor: colors.primary,
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
    color: colors.text,
  },
  commentDate: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  commentText: {
    fontSize: typography.base,
    color: colors.text,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.base,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
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
