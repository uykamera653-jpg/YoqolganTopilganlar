import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { CategoryButton } from '@/components';
import { useAuth, getSupabaseClient } from '@/template';
import { useRouter } from 'expo-router';
import { UserProfile } from '@/types';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>FINDO</Text>
          <Text style={styles.subtitle}>Yo'qotdingizmi? Topdingizmi? E'lon qoldiring!</Text>
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
              <View style={styles.headerAvatar}>
                <MaterialIcons name="person" size={24} color={colors.primary} />
              </View>
            )}
            <Text style={styles.headerUsername} numberOfLines={1}>{userProfile.username || 'Foydalanuvchi'}</Text>
          </TouchableOpacity>
        ) : user ? null : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Kirish</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <View style={styles.mottoContainer}>
          <MaterialIcons name="verified" size={32} color={colors.primary} />
          <Text style={styles.mottoText}>Halollik - eng katta mukofot</Text>
        </View>

        <Text style={styles.sectionTitle}>Asosiy bo'limlar</Text>
        
        <View style={styles.categoriesRow}>
          <CategoryButton
            icon="search"
            label="Topdim"
            color={colors.found}
            onPress={() => router.push('/posts-list?filter=found')}
          />
          <CategoryButton
            icon="warning"
            label="Yo'qotdim"
            color={colors.lost}
            onPress={() => router.push('/posts-list?filter=lost')}
          />
        </View>

        <View style={styles.categoriesRow}>
          <CategoryButton
            icon="star"
            label="Mukofotli"
            color={colors.reward}
            onPress={() => router.push('/posts-list?filter=reward')}
          />
          <CategoryButton
            icon="list"
            label="Barchasi"
            color={colors.primary}
            onPress={() => router.push('/posts-list?filter=all')}
          />
        </View>

        <View style={styles.adSection}>
          <Text style={styles.adTitle}>Reklama</Text>
          <View style={styles.adPlaceholder}>
            <MaterialIcons name="play-circle-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.adText}>Reklama joyi</Text>
            <Text style={styles.adSubtext}>Video yoki rasm joylash mumkin</Text>
          </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.white,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  loginButton: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  loginButtonText: {
    color: colors.primary,
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
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.white + '50',
  },
  headerUsername: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.white,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.text,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  mottoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  mottoText: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },

  adSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  adTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  adPlaceholder: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    minHeight: 200,
    justifyContent: 'center',
  },
  adText: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  adSubtext: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
