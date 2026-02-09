import { useState, useEffect } from 'react';
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

  // Auto-fill email from login screen
  const initialEmail = (params.email as string) || '';
  const [email, setEmail] = useState(initialEmail);
  console.log('[RESET-PASSWORD] Initial email:', initialEmail);
  
  // Detect if user came from email link with access token
  const [hasAccessToken, setHasAccessToken] = useState(false);
  
  // Determine mode: request = send email, update = change password
  const mode = hasAccessToken ? 'update' : 'request';
  
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated (came from email link)
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('[RESET-PASSWORD] User authenticated via email link');
        setHasAccessToken(true);
        setEmail(session.user.email || '');
      }
    };
    checkAuth();
  }, []);

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
    console.log('Sending password reset OTP to:', email);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        console.error('Reset password error:', error);
        throw error;
      }

      console.log('Password reset OTP sent successfully');
      setOtpSent(true);
      showAlert(
        t.success,
        'Tasdiqlash kodi va yangi parol yaratish havolasi emailingizga yuborildi. Emaildan kelgan 6 xonali kodni kiriting.'
      );
    } catch (error: any) {
      console.error('handleRequestReset error:', error);
      showAlert(t.error, error.message || t.errors.generic || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePasswordWithOTP = async () => {
    if (!email.trim() || !otpCode.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showAlert(t.error, t.errors.fillAllFields);
      return;
    }

    if (otpCode.length !== 6) {
      showAlert(t.error, 'Tasdiqlash kodi 6 xonali bo\'lishi kerak');
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
    console.log('Verifying OTP and updating password...');

    try {
      // Verify OTP and update password
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'recovery',
      });

      if (error) {
        console.error('OTP verification error:', error);
        throw error;
      }

      // Update password after OTP verification
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        throw updateError;
      }

      console.log('Password updated successfully');
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
      console.error('handleUpdatePasswordWithOTP error:', error);
      let errorMessage = error.message || t.errors.generic;
      if (error.message?.toLowerCase().includes('invalid') || error.message?.toLowerCase().includes('otp')) {
        errorMessage = 'Tasdiqlash kodi noto\'g\'ri yoki muddati o\'tgan. Iltimos, qaytadan urinib ko\'ring.';
      }
      showAlert(t.error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePasswordDirect = async () => {
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
    console.log('Updating password directly (via email link)...');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }

      console.log('Password updated successfully');
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
      console.error('handleUpdatePasswordDirect error:', error);
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
          {!hasAccessToken && (
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder={t.auth.email}
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading && !otpSent}
            />
          )}

          {hasAccessToken ? (
            <>
              <View style={[styles.infoBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>Email tasdiqlandi! Endi yangi parol kiriting.</Text>
              </View>

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
                onPress={handleUpdatePasswordDirect}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Parolni yangilash</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : !otpSent ? (
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
                  <Text style={styles.submitButtonText}>Tasdiqlash kodi yuborish</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <View style={[styles.infoBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                <MaterialIcons name="info" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Emailingizga yuborilgan 6 xonali tasdiqlash kodini va yangi parolni kiriting
                </Text>
              </View>

              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={otpCode}
                onChangeText={setOtpCode}
                placeholder="Tasdiqlash kodi (6 xonali)"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />

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
                onPress={handleUpdatePasswordWithOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Parolni yangilash</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => {
                  setOtpSent(false);
                  setOtpCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                <Text style={[styles.resendButtonText, { color: colors.primary }]}>Qaytadan kod yuborish</Text>
              </TouchableOpacity>
            </>
          )}

          {!hasAccessToken && (
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => router.replace('/login')}
            >
              <Text style={[styles.backToLoginText, { color: colors.primary }]}>
                {t.resetPassword.backToLogin}
              </Text>
            </TouchableOpacity>
          )}
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sm,
    lineHeight: 18,
  },
  resendButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: typography.base,
    fontWeight: '600',
  },
});
