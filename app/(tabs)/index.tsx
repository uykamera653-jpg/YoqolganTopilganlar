import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-video';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { CategoryButton } from '@/components';
import { useAuth, getSupabaseClient } from '@/template';
import { useRouter } from 'expo-router';
import { UserProfile, Advertisement } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { advertisementService } from '@/services/advertisementService';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { t, language } = useLanguage();
  const { colors } = useTheme();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
    loadAdvertisements();
  }, [user]);

  useEffect(() => {
    if (ads.length > 0) {
      // Auto-slide every 5 seconds
      adTimerRef.current = setInterval(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
      }, 5000);

      return () => {
        if (adTimerRef.current) {
          clearInterval(adTimerRef.current);
        }
      };
    }
  }, [ads.length]);

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

  const loadAdvertisements = async () => {
    setAdsLoading(true);
    const { data } = await advertisementService.getActiveAds();
    if (data && data.length > 0) {
      setAds(data);
    }
    setAdsLoading(false);
  };

  const handleAdPress = (linkUrl: string) => {
    if (linkUrl) {
      Linking.openURL(linkUrl).catch(err => console.error('Error opening link:', err));
    }
  };

  const currentAd = ads[currentAdIndex];

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

        {/* Dynamic Advertisements Section */}
        {adsLoading ? (
          <View style={[styles.mediaContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.mediaPlaceholder}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          </View>
        ) : ads.length > 0 && currentAd ? (
          <TouchableOpacity 
            style={[styles.mediaContainer, { backgroundColor: colors.surface }]}
            onPress={() => handleAdPress(currentAd.link_url)}
            activeOpacity={0.8}
          >
            {currentAd.type === 'video' && currentAd.media_url ? (
              <View style={styles.videoContainer}>
                <Video
                  source={{ uri: currentAd.media_url }}
                  style={styles.video}
                  useNativeControls={false}
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  shouldPlay
                  isMuted
                />
                <View style={styles.videoOverlay}>
                  <MaterialIcons name="play-circle-outline" size={64} color="rgba(255,255,255,0.8)" />
                </View>
              </View>
            ) : (
              <View style={styles.mediaPlaceholder}>
                <MaterialIcons name="campaign" size={48} color={colors.primary} />
                <Text style={[styles.adTitle, { color: colors.text }]}>
                  {currentAd.title}
                </Text>
                {currentAd.content && (
                  <Text style={[styles.adContent, { color: colors.textSecondary }]}>
                    {currentAd.content}
                  </Text>
                )}
              </View>
            )}
            
            {ads.length > 1 && (
              <View style={styles.slideIndicator}>
                {ads.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.slideIndicatorDot,
                      { backgroundColor: index === currentAdIndex ? colors.primary : colors.textTertiary }
                    ]}
                  />
                ))}
              </View>
            )}

            <View style={[styles.adFooter, { backgroundColor: colors.background }]}>
              <MaterialIcons name="touch-app" size={20} color={colors.primary} />
              <Text style={[styles.adFooterText, { color: colors.textSecondary }]}>
                {language === 'uz' ? 'Ko\'proq bilish uchun bosing' :
                 language === 'ru' ? 'Нажмите для подробностей' :
                 'Tap for more details'}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Warning Banner */}
        <View style={[styles.warningCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.warningBanner, { backgroundColor: colors.warning + '15', borderColor: colors.warning }]}>
            <MaterialIcons name="warning" size={20} color={colors.warning} />
            <Text style={[styles.warningText, { color: colors.text }]}>
              {language === 'uz' ? 'Shaxsiy ma\'lumotlarni e\'lonlarda tarqatmang! Telefon raqam, manzil va boshqa maxfiy ma\'lumotlarni ehtiyot bilan ulashing.' :
               language === 'ru' ? 'Не распространяйте личную информацию в объявлениях! Будьте осторожны при обмене телефонным номером, адресом и другой конфиденциальной информацией.' :
               'Do not share personal information in posts! Be careful when sharing phone numbers, addresses, and other confidential information.'}
            </Text>
          </View>
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
  mediaContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  mediaPlaceholder: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  videoContainer: {
    height: 250,
    position: 'relative',
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  adTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    marginTop: spacing.md,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  adContent: {
    fontSize: typography.base,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 22,
  },
  slideIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  slideIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  adFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  adFooterText: {
    fontSize: typography.sm,
  },
  warningCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: typography.xs,
    lineHeight: 16,
  },
});
