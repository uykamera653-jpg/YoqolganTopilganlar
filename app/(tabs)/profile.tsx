import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useAuth, useAlert } from '@/template';
import { usePosts } from '@/hooks/usePosts';
import { useAdmin } from '@/hooks/useAdmin';
import { Post } from '@/types';
import { PostCard } from '@/components';
import { useRouter } from 'expo-router';
import { userService } from '@/services/userService';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { posts, deletePost } = usePosts();
  const { showAlert } = useAlert();
  const router = useRouter();
  const { isAdmin } = useAdmin();

  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const myPosts = posts.filter(post => post.user_id === user?.id);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAvatarUri(user.avatar_url || null);
    }
  }, [user]);

  const handleLogout = async () => {
    showAlert('Chiqish', 'Haqiqatan ham tizimdan chiqmoqchimisiz?', [
      { text: 'Yo\'q', style: 'cancel' },
      {
        text: 'Ha',
        style: 'destructive',
        onPress: async () => {
          const { error } = await logout();
          if (error) {
            showAlert('Xato', error);
          } else {
            router.replace('/login');
          }
        },
      },
    ]);
  };

  const handleDeletePost = async (postId: string) => {
    showAlert('O\'chirish', 'E\'lonni o\'chirmoqchimisiz?', [
      { text: 'Yo\'q', style: 'cancel' },
      {
        text: 'Ha',
        style: 'destructive',
        onPress: async () => {
          const { success, error } = await deletePost(postId);
          if (success) {
            showAlert('Muvaffaqiyatli', 'E\'lon o\'chirildi');
          } else {
            showAlert('Xato', error || 'E\'lonni o\'chirishda xatolik');
          }
        },
      },
    ]);
  };

  const handleHelpContact = () => {
    Linking.openURL('tel:+998501017695');
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Ruxsat kerak', 'Iltimos, galereya uchun ruxsat bering');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setAvatarUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!username.trim()) {
      showAlert('Xato', 'Ism bo\'sh bo\'lmasligi kerak');
      return;
    }

    setUpdating(true);

    let newAvatarUrl = user.avatar_url;

    if (avatarUri && avatarUri.startsWith('data:')) {
      const { url, error: uploadError } = await userService.uploadAvatar(user.id, avatarUri);
      if (uploadError) {
        setUpdating(false);
        showAlert('Xato', uploadError);
        return;
      }
      newAvatarUrl = url || undefined;
    }

    const { success, error } = await userService.updateProfile(user.id, username.trim(), newAvatarUrl);

    setUpdating(false);

    if (success) {
      setEditMode(false);
      showAlert('Muvaffaqiyatli', 'Profil yangilandi');
      // Force re-render by navigating
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    } else {
      showAlert('Xato', error || 'Profilni yangilashda xatolik');
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>
        <View style={styles.notLoggedIn}>
          <MaterialIcons name="person-off" size={64} color={colors.textSecondary} />
          <Text style={styles.notLoggedInText}>Tizimga kirmagansiz</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Kirish</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={editMode ? pickAvatar : undefined}
            disabled={!editMode}
          >
            {avatarUri ? (
              <Image 
                source={{ uri: avatarUri }} 
                style={styles.avatarImage} 
                contentFit="cover"
                cachePolicy="none"
              />
            ) : (
              <MaterialIcons name="person" size={48} color={colors.primary} />
            )}
            {editMode && (
              <View style={styles.avatarEditBadge}>
                <MaterialIcons name="edit" size={16} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            {editMode ? (
              <TextInput
                style={styles.usernameInput}
                value={username}
                onChangeText={setUsername}
                placeholder="Ismingizni kiriting"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={styles.username}>{user.username || 'Foydalanuvchi'}</Text>
            )}
            <Text style={styles.email}>{user.email}</Text>
          </View>

          {editMode ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <MaterialIcons name="check" size={20} color={colors.white} />
                    <Text style={styles.actionButtonText}>Saqlash</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  setEditMode(false);
                  setUsername(user.username || '');
                  setAvatarUri(user.avatar_url || null);
                }}
              >
                <MaterialIcons name="close" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Bekor qilish</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => setEditMode(true)}
            >
              <MaterialIcons name="edit" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Tahrirlash</Text>
            </TouchableOpacity>
          )}

          {isAdmin && (
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => router.push('/admin')}
            >
              <MaterialIcons name="admin-panel-settings" size={24} color={colors.white} />
              <Text style={styles.adminButtonText}>Admin Panel</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mening e'lonlarim</Text>
          {myPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inbox" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Hozircha e'lonlaringiz yo'q</Text>
            </View>
          ) : (
            myPosts.map(post => (
              <View key={post.id} style={styles.myPostCard}>
                <PostCard post={post} />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePost(post.id)}
                >
                  <MaterialIcons name="delete" size={20} color={colors.white} />
                  <Text style={styles.deleteButtonText}>O'chirish</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yordam</Text>
          <TouchableOpacity style={styles.helpCard} onPress={handleHelpContact}>
            <View style={styles.helpIconContainer}>
              <MaterialIcons name="support-agent" size={32} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Yordam xizmati</Text>
              <Text style={styles.helpPhone}>+998 50 101 76 95</Text>
            </View>
            <MaterialIcons name="phone" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  notLoggedInText: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  profileCard: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.full,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileInfo: {
    alignItems: 'center',
  },
  username: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  usernameInput: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.text,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  editButton: {
    backgroundColor: colors.primary,
    marginTop: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.success,
  },
  cancelButton: {
    backgroundColor: colors.textSecondary,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  email: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.text,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  myPostCard: {
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
    ...shadows.md,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: typography.sm,
    fontWeight: typography.medium,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  helpIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  helpPhone: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  adminButtonText: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
});
