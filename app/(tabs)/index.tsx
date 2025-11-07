import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { CategoryButton } from '@/components';
import { useAuth, getSupabaseClient } from '@/template';
import { useRouter } from 'expo-router';
import { UserProfile } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { t } = useLanguage();
  const { colors } = useTheme();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setUserProfile(data);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{t.appName}</Text>
          <Text style={styles.subtitle}>{t.appTagline}</Text>
        </View>
        {user && userProfile ? (
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => router.push('/(tabs)/profile')}
          >
            {userProfile.avatar_url ? (
              <Image 
                source={{ uri: userProfile.avatar_url }} 
                style={styles.headerAvatar} 
                contentFit="cover"
                cachePolicy="none"
                key={userProfile.avatar_url}
              />
            ) : (
              <View style={[styles.headerAvatar, { backgroundColor: colors.white }]}>
                <MaterialIcons name="person" size={24} color={colors.primary} />
              </View>
            )}
            <Text style={styles.headerUsername} numberOfLines={1}>{userProfile.username || t.profile.username}</Text>
          </TouchableOpacity>
        ) : user ? null : (
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.white }]}
            onPress={() => router.push('/login')}
          >
            <Text style={[styles.loginButtonText, { color: colors.primary }]}>{t.auth.login}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <View style={[styles.warningBanner, { backgroundColor: colors.warning + '15', borderColor: colors.warning }]}>
          <MaterialIcons name="warning" size={24} color={colors.warning} />
          <Text style={[styles.warningText, { color: colors.text }]}>
            {language === 'uz' ? 'Shaxsiy ma\'lumotlarni e\'lonlarda tarqatmang! Telefon raqam, manzil va boshqa maxfiy ma\'lumotlarni ehtiyot bilan ulashing.' :
             language === 'ru' ? 'Не распространяйте личную информацию в объявлениях! Будьте осторожны при обмене телефонным номером, адресом и другой конфиденциальной информацией.' :
             'Do not share personal information in posts! Be careful when sharing phone numbers, addresses, and other confidential information.'}
          </Text>
        </View>

        <View style={[styles.mediaContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.mediaPlaceholder}>
            <MaterialIcons name="photo-library" size={48} color={colors.textSecondary} />
            <Text style={[styles.mediaPlaceholderText, { color: colors.textSecondary }]}>
              {language === 'uz' ? 'Reklama uchun joy' :
               language === 'ru' ? 'Место для рекламы' :
               'Advertisement Space'}
            </Text>
            <Text style={[styles.mediaPlaceholderSubtext, { color: colors.textTertiary }]}>
              {language === 'uz' ? 'Bu yerga rasm yoki video qo\'yishingiz mumkin' :
               language === 'ru' ? 'Здесь вы можете разместить изображение или видео' :
               'You can place images or videos here'}
            </Text>
          </View>
        </View>

        <View style={[styles.bannerContainer, { backgroundColor: colors.surface }]}>
          <View style={[styles.bannerIconBg, { backgroundColor: colors.primary + '20' }]}>
            <MaterialIcons name="verified" size={40} color={colors.primary} />
          </View>
          <View style={styles.bannerContent}>
            <Text style={[styles.bannerTitle, { color: colors.text }]}>{t.home.featured}</Text>
            <Text style={[styles.bannerSubtitle, { color: colors.textSecondary }]}>FINDO - {t.appTagline}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.home.categories}</Text>
        
        <View style={styles.categoriesRow}>
          <CategoryButton
            icon="search"
            label={t.home.found}
            color={colors.found}
            onPress={() => router.push('/posts-list?filter=found')}
          />
          <CategoryButton
            icon="warning"
            label={t.home.lost}
            color={colors.lost}
            onPress={() => router.push('/posts-list?filter=lost')}
          />
        </View>

        <View style={styles.categoriesRow}>
          <CategoryButton
            icon="star"
            label={t.home.reward}
            color={colors.reward}
            onPress={() => router.push('/posts-list?filter=reward')}
          />
          <CategoryButton
            icon="list"
            label={t.home.all}
            color={colors.primary}
            onPress={() => router.push('/posts-list?filter=all')}
          />
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
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: typography.sm,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  loginButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  loginButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 150,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF50',
  },
  headerUsername: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: '#FFFFFF',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  bannerIconBg: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    marginBottom: spacing.xs,
  },
  bannerSubtitle: {
    fontSize: typography.sm,
    lineHeight: 18,
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: typography.sm,
    lineHeight: 18,
  },
  mediaContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  mediaPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  mediaPlaceholderText: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  mediaPlaceholderSubtext: {
    fontSize: typography.sm,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
