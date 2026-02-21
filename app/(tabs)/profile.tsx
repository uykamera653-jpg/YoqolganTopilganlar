import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useAuth, useAlert } from '@/template';
import { usePosts } from '@/hooks/usePosts';
import { useAdmin } from '@/hooks/useAdmin';
import { PostCard } from '@/components';
import { useRouter } from 'expo-router';
import { userService } from '@/services/userService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';

type Language = 'uz' | 'en' | 'ru';
type ThemeMode = 'light' | 'dark';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { posts, deletePost } = usePosts();
  const { showAlert } = useAlert();
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const { language, setLanguage, t } = useLanguage();
  const { themeMode, activeTheme, setThemeMode, colors } = useTheme();

  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const myPosts = posts.filter(post => post.user_id === user?.id);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAvatarUri(user.avatar_url || null);
    }
  }, [user]);

  const handleLogout = async () => {
    showAlert(t.profile.logout, t.profile.confirmLogout, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.profile.logout,
        style: 'destructive',
        onPress: async () => {
          const { error } = await logout();
          if (error) {
            showAlert(t.error, error);
          } else {
            router.replace('/login');
          }
        },
      },
    ]);
  };

  const handleDeletePost = async (postId: string) => {
    showAlert(t.delete, t.postDetail.confirmDelete, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: async () => {
          const { success, error } = await deletePost(postId);
          if (success) {
            // Post successfully deleted from database
            // PostsContext will automatically update and remove from UI
            showAlert(t.success, t.postDetail.postDeleted);
          } else {
            showAlert(t.error, error || t.errors.generic);
          }
        },
      },
    ]);
  };

  const handleHelpContact = () => {
    Linking.openURL('https://t.me/Findosam').catch(err => console.error('Error opening Telegram:', err));
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert(t.error, t.errors.uploadError);
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
      showAlert(t.error, t.errors.fillAllFields);
      return;
    }

    setUpdating(true);

    let newAvatarUrl = user.avatar_url;

    if (avatarUri && avatarUri.startsWith('data:')) {
      const { url, error: uploadError } = await userService.uploadAvatar(user.id, avatarUri);
      if (uploadError) {
        setUpdating(false);
        showAlert(t.error, uploadError);
        return;
      }
      newAvatarUrl = url || undefined;
    }

    const { success, error } = await userService.updateProfile(user.id, username.trim(), newAvatarUrl);

    setUpdating(false);

    if (success) {
      setEditMode(false);
      showAlert(t.success, t.profile.profileUpdated);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    } else {
      showAlert(t.error, error || t.errors.generic);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerTitle}>{t.profile.title}</Text>
        </View>
        <View style={styles.notLoggedIn}>
          <MaterialIcons name="person-off" size={64} color={colors.textSecondary} />
          <Text style={[styles.notLoggedInText, { color: colors.textSecondary }]}>{t.auth.login}</Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>{t.auth.login}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>{t.profile.title}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.avatarContainer, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
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
              <View style={[styles.avatarEditBadge, { backgroundColor: colors.primary }]}>
                <MaterialIcons name="edit" size={16} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            {editMode ? (
              <TextInput
                style={[styles.usernameInput, { color: colors.text, borderBottomColor: colors.primary }]}
                value={username}
                onChangeText={setUsername}
                placeholder={t.profile.username}
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={[styles.username, { color: colors.text }]}>{user.username || t.profile.username}</Text>
            )}
            <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
          </View>

          {editMode ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                onPress={handleSaveProfile}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="check" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>{t.save}</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.textSecondary }]}
                onPress={() => {
                  setEditMode(false);
                  setUsername(user.username || '');
                  setAvatarUri(user.avatar_url || null);
                }}
              >
                <MaterialIcons name="close" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>{t.cancel}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => setEditMode(true)}
            >
              <MaterialIcons name="edit" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>{t.edit}</Text>
            </TouchableOpacity>
          )}

          {isAdmin && (
            <TouchableOpacity
              style={[styles.adminButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/admin')}
            >
              <MaterialIcons name="admin-panel-settings" size={24} color="#FFFFFF" />
              <Text style={styles.adminButtonText}>Admin Panel</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.settingsCard, { backgroundColor: colors.surface }]}
          onPress={() => setShowSettings(!showSettings)}
        >
          <View style={styles.settingsHeader}>
            <MaterialIcons name="settings" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.profile.settings}</Text>
          </View>
          <MaterialIcons
            name={showSettings ? 'expand-less' : 'expand-more'}
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {showSettings && (
          <View style={[styles.settingsContent, { backgroundColor: colors.surface }]}>
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t.profile.language}</Text>
              <View style={styles.languageSelector}>
                {(['uz', 'en', 'ru'] as Language[]).map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.languageButton,
                      { backgroundColor: colors.background, borderColor: colors.border },
                      language === lang && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setLanguage(lang)}
                  >
                    <Text style={[
                      styles.languageButtonText,
                      { color: colors.text },
                      language === lang && { color: '#FFFFFF' }
                    ]}>
                      {lang === 'uz' ? "O'zbekcha" : lang === 'en' ? 'English' : 'Русский'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t.profile.theme}</Text>
              <View style={styles.themeSelector}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    activeTheme === 'light' && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setThemeMode('light')}
                >
                  <MaterialIcons name="light-mode" size={20} color={activeTheme === 'light' ? '#FFFFFF' : colors.text} />
                  <Text style={[
                    styles.themeButtonText,
                    { color: colors.text },
                    activeTheme === 'light' && { color: '#FFFFFF' }
                  ]}>
                    {t.profile.lightMode}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    activeTheme === 'dark' && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setThemeMode('dark')}
                >
                  <MaterialIcons name="dark-mode" size={20} color={activeTheme === 'dark' ? '#FFFFFF' : colors.text} />
                  <Text style={[
                    styles.themeButtonText,
                    { color: colors.text },
                    activeTheme === 'dark' && { color: '#FFFFFF' }
                  ]}>
                    {t.profile.darkMode}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.profile.myPosts}</Text>
          {myPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inbox" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t.profile.noPosts}</Text>
            </View>
          ) : (
            myPosts.map(post => (
              <View key={post.id} style={styles.myPostCard}>
                <PostCard post={post} />
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: colors.error }]}
                  onPress={() => handleDeletePost(post.id)}
                >
                  <MaterialIcons name="delete" size={20} color="#FFFFFF" />
                  <Text style={styles.deleteButtonText}>{t.delete}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.profile.helpSupport}</Text>
          <TouchableOpacity style={[styles.helpCard, { backgroundColor: colors.surface }]} onPress={handleHelpContact}>
            <View style={[styles.helpIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialIcons name="support-agent" size={32} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: colors.text }]}>{t.profile.helpSupport}</Text>
              <Text style={[styles.helpPhone, { color: colors.primary }]}>Telegram: @Findosam</Text>
            </View>
            <MaterialIcons name="send" size={24} color={colors.primary} />
          </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  notLoggedInText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  loginButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  usernameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  email: {
    fontSize: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 8,
  },
  myPostCard: {
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
  },
  helpIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  helpPhone: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsContent: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    gap: 20,
  },
  settingItem: {
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 6,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
