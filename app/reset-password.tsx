import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlert } from '@/template';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { getSupabaseClient } from '@/template';

export default function ResetPasswordScreen() {
  console.log('[RESET-PASSWORD] Component mounted');
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log('[RESET-PASSWORD] Params:', params);
  const { t } = useLanguage();
  const { colors } = useTheme();
  const supabase = getSupabaseClient();

  const initialMode = params.mode as string | undefined;
  const [mode, setMode] = useState<'request' | 'update'>(initialMode === 'update' ? 'update' : 'request');
  console.log('[RESET-PASSWORD] Initial mode:', mode);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async () => {
    console.log('handleRequestReset called');
    if (!email.trim()) {
      showAlert(t.error, t.errors.fillAllFields);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert(t.error, t.errors.invalidEmail || 'Email format noto\'g\'ri');
      return;
    }

    setLoading(true);
    console.log('Sending password reset email to:', email);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'onspaceapp://reset-password?mode=update',
      });

      if (error) {
        console.error('Reset password error:', error);
        throw error;
      }

      console.log('Password reset email sent successfully');
      showAlert(
        t.success,
        t.resetPassword.linkSent,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('handleRequestReset error:', error);
      showAlert(t.error, error.message || t.errors.generic || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      showAlert(t.error, t.errors.fillAllFields);
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert(t.error, t.errors.passwordMismatch);
      return;
    }

    if (newPassword.length < 6) {
      showAlert(t.error, t.errors.weakPassword);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      showAlert(
        t.success,
        t.resetPassword.passwordUpdated,
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/login');
            },
          },
        ]
      );
    } catch (error: any) {
      showAlert(t.error, error.message || t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="lock-reset" size={48} color={colors.white} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {mode === 'request' ? t.resetPassword.title : t.resetPassword.newPasswordTitle}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {mode === 'request'
              ? t.resetPassword.requestSubtitle
              : t.resetPassword.updateSubtitle}
          </Text>
        </View>

        <View style={styles.form}>
          {mode === 'request' ? (
            <>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder={t.auth.email}
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }, loading && styles.submitButtonDisabled]}
                onPress={handleRequestReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="email" size={24} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>{t.resetPassword.sendLink}</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={t.resetPassword.newPassword}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                editable={!loading}
              />

              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t.auth.confirmPassword}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }, loading && styles.submitButtonDisabled]}
                onPress={handleUpdatePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>{t.resetPassword.updatePassword}</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => router.replace('/login')}
          >
            <Text style={[styles.backToLoginText, { color: colors.primary }]}>
              {t.resetPassword.backToLogin}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  backToLoginButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
