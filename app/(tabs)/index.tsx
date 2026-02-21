import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
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
  const [videoLoading, setVideoLoading] = useState(false);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);
  const webVideoRef = useRef<HTMLVideoElement | null>(null);

  const currentAd = ads[currentAdIndex];
  const nextAd = ads[(currentAdIndex + 1) % ads.length];
  
  // Create video player for mobile platforms (always initialize, then update source)
  const videoPlayer = useVideoPlayer('', (player) => {
    player.loop = true;
    player.muted = true;
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
    // Load ads immediately on app start
    loadAdvertisements();
  }, [user]);

  // Refresh ads when screen is focused (detects new ads without app rebuild)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing advertisements...');
      loadAdvertisements();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (ads.length > 0) {
      // Auto-slide based on current ad's slide_duration
      const currentAd = ads[currentAdIndex];
      const duration = (currentAd?.slide_duration || 5) * 1000; // Convert to milliseconds
      
      adTimerRef.current = setInterval(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
      }, duration);

      return () => {
        if (adTimerRef.current) {
          clearInterval(adTimerRef.current);
        }
      };
    }
  }, [ads, currentAdIndex]);

  // Preload ALL ad media for instant transitions
  useEffect(() => {
    if (ads.length > 0 && Platform.OS !== 'web') {
      ads.forEach((ad) => {
        if (ad.type === 'image' && ad.media_url) {
          Image.prefetch(ad.media_url);
          console.log('🔄 Preloading image:', ad.id);
        }
      });
    }
  }, [ads]);

  // Replay video when ad changes (mobile only) - NO LOADING SPINNER
  useEffect(() => {
    if (currentAd?.type === 'video' && currentAd?.media_url && Platform.OS !== 'web' && videoPlayer) {
      try {
        console.log('📹 [Mobile] Loading video:', currentAd.media_url.substring(0, 80));
        videoPlayer.replace(currentAd.media_url);
        videoPlayer.muted = true;
        videoPlayer.loop = true;
        
        // Play instantly (no loading state)
        setTimeout(() => {
          videoPlayer.play();
        }, 100);
      } catch (error) {
        console.error('❌ [Mobile] Video error:', error);
      }
    }
  }, [currentAd, videoPlayer]);

  // Web video autoplay handler - NO LOADING SPINNER
  useEffect(() => {
    if (currentAd?.type === 'video' && currentAd?.media_url && Platform.OS === 'web') {
      console.log('🌐 [Web] Preparing video:', currentAd.media_url.substring(0, 80));
      
      // Instant play (no loading state)
      setTimeout(() => {
        if (webVideoRef.current) {
          webVideoRef.current.load();
          webVideoRef.current.play().catch(err => {
            console.warn('⚠️ [Web] Autoplay prevented:', err.message);
          });
        }
      }, 50);
    }
  }, [currentAd]);

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
    console.log('🔄 Loading advertisements (instant from cache)...');
    setAdsLoading(true);
    const { data, error } = await advertisementService.getActiveAds();
    console.log('📊 Ads loaded:', { count: data?.length || 0, error });
    
    if (data && data.length > 0) {
      const firstAd = data[0];
      const isLocalFile = firstAd.media_url?.startsWith('file://');
      console.log('📢 First ad:', {
        type: firstAd.type,
        title: firstAd.title,
        hasMediaUrl: !!firstAd.media_url,
        isLocalFile,
        mediaUrlPreview: firstAd.media_url?.substring(0, 80) + '...'
      });
      
      // Set ads immediately - NO DELAY
      setAds(data);
      setAdsLoading(false);
    } else {
      console.log('⚠️ No active ads found');
      setAdsLoading(false);
    }
  };

  const handleAdPress = (linkUrl: string) => {
    if (linkUrl) {
      Linking.openURL(linkUrl).catch(err => console.error('Error opening link:', err));
    }
  };

  // Debug current ad state
  useEffect(() => {
    if (currentAd) {
      console.log('📺 Current ad:', {
        index: currentAdIndex,
        type: currentAd.type,
        title: currentAd.title,
        hasMediaUrl: !!currentAd.media_url,
        mediaUrlPreview: currentAd.media_url?.substring(0, 80)
      });
    }
  }, [currentAdIndex, currentAd]);

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
            {currentAd.type === 'image' && currentAd.media_url ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: currentAd.media_url }}
                  style={styles.adImage}
                  contentFit="cover"
                  cachePolicy="disk"
                  recyclingKey={currentAd.id}
                  priority="high"
                  placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj' }}
                  placeholderContentFit="cover"
                  transition={0}
                  onError={(error) => {
                    console.error('❌ Image load error:', currentAd.media_url?.substring(0, 80));
                  }}
                />
              </View>
            ) : currentAd.type === 'video' && currentAd.media_url ? (
              Platform.OS === 'web' ? (
                <View style={styles.videoContainer} key={`video-${currentAdIndex}-${currentAd.id}`}>
                  <video
                    key={currentAd.media_url}
                    ref={(ref) => { 
                      webVideoRef.current = ref;
                      if (ref) {
                        console.log('🎬 [Web] Video element mounted, URL:', currentAd.media_url.substring(0, 80));
                      }
                    }}
                    src={currentAd.media_url}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000' }}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    crossOrigin="anonymous"
                    onLoadedMetadata={(e) => {
                      console.log('📊 [Web] Video metadata loaded:', {
                        duration: (e.target as HTMLVideoElement).duration,
                        width: (e.target as HTMLVideoElement).videoWidth,
                        height: (e.target as HTMLVideoElement).videoHeight
                      });
                    }}
                    onLoadStart={() => {
                      console.log('⏳ [Web] Video load started:', currentAd.media_url.substring(0, 80));
                    }}
                    onCanPlay={() => {
                      console.log('✅ [Web] Video ready to play');
                      // Force play
                      if (webVideoRef.current) {
                        webVideoRef.current.play().catch(err => {
                          console.error('⚠️ [Web] Autoplay failed:', err.message);
                        });
                      }
                    }}
                    onError={(e) => {
                      // @ts-ignore
                      const errorCode = e.target?.error?.code;
                      // @ts-ignore
                      const errorMessage = e.target?.error?.message;
                      console.error('❌ [Web] Video error:', {
                        url: currentAd.media_url,
                        errorCode,
                        errorMessage,
                        errorCodeMeaning: [
                          '',
                          'MEDIA_ERR_ABORTED (1): User/Browser aborted',
                          'MEDIA_ERR_NETWORK (2): Network error',
                          'MEDIA_ERR_DECODE (3): Codec/format error',
                          'MEDIA_ERR_SRC_NOT_SUPPORTED (4): Format not supported'
                        ][errorCode] || 'Unknown error'
                      });
                    }}
                    onPlaying={() => {
                      console.log('▶️ [Web] Video is playing');
                    }}
                    onWaiting={() => {
                      console.log('⏸️ [Web] Video buffering...');
                    }}
                    onProgress={() => {
                      // Smooth playback
                    }}
                    onStalled={() => console.warn('⚠️ [Web] Video stalled')}
                    onSuspend={() => console.log('⏸️ [Web] Video suspended')}
                  />
                </View>
              ) : videoPlayer ? (
                <View style={styles.videoContainer}>
                  <VideoView
                    player={videoPlayer}
                    style={styles.video}
                    nativeControls={false}
                    contentFit="cover"
                    allowsFullscreen={false}
                    allowsPictureInPicture={false}
                    onError={(error) => {
                      console.error('❌ [Mobile] VideoView error:', error);
                      console.error('Video URL:', currentAd.media_url?.substring(0, 80));
                    }}
                  />
                </View>
              ) : (
                <View style={styles.mediaPlaceholder}>
                  <MaterialIcons name="videocam-off" size={48} color={colors.primary} />
                  <Text style={[styles.adTitle, { color: colors.text }]}>Video player xato</Text>
                </View>
              )
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
  videoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
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
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adImage: {
    width: '100%',
    height: '100%',
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
