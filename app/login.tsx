import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';

type Language = 'uz' | 'en' | 'ru';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { sendOTP, verifyOTPAndLogin, signInWithPassword, signUpWithPassword, operationLoading } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const { t, language, setLanguage } = useLanguage();
  const { colors } = useTheme();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      showAlert(t.error, t.errors.fillAllFields);
      return;
    }

    const { error } = await sendOTP(email);
    if (error) {
      showAlert(t.error, error);
    } else {
      setOtpSent(true);
      // Show success with spam folder reminder
      const spamReminder = language === 'uz' 
        ? '✅ Tasdiqlash kodi yuborildi!\n\n📧 Agar email kelmasa, spam/junk papkasini tekshiring.' 
        : language === 'ru' 
        ? '✅ Код подтверждения отправлен!\n\n📧 Если письмо не пришло, проверьте папку спам/нежелательные.' 
        : '✅ Verification code sent!\n\nIf you do not see the email, please check your spam/junk folder.';
      showAlert(t.success, spamReminder);
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      showAlert(t.error, t.errors.fillAllFields);
      return;
    }

    if (password !== confirmPassword) {
      showAlert(t.error, t.errors.passwordMismatch);
      return;
    }

    if (password.length < 6) {
      showAlert(t.error, t.errors.weakPassword);
      return;
    }

    if (!termsAccepted) {
      showAlert(t.error, t.auth.termsRequired);
      return;
    }

    if (!otpSent) {
      await handleSendOTP();
      return;
    }

    if (!otp.trim()) {
      showAlert(t.error, t.auth.enterOtp);
      return;
    }

    const { error, user } = await verifyOTPAndLogin(email, otp, { password });
    if (error) {
      // Check for duplicate email error
      let errorMessage = error;
      
      if (error.toLowerCase().includes('already') || error.toLowerCase().includes('exist')) {
        errorMessage = t.errors.duplicateEmail;
      } else if (error.toLowerCase().includes('invalid') || error.toLowerCase().includes('otp')) {
        errorMessage = t.errors.invalidOtp;
      }
      
      showAlert(t.error, errorMessage);
    } else {
      showAlert(t.success, t.success);
      router.replace('/(tabs)');
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert(t.error, t.errors.fillAllFields);
      return;
    }

    const { error, user } = await signInWithPassword(email, password);
    if (error) {
      // Check for specific error types
      let errorMessage = error;
      
      if (error.toLowerCase().includes('invalid') || error.toLowerCase().includes('credentials')) {
        errorMessage = t.errors.invalidCredentials;
      } else if (error.toLowerCase().includes('not found') || error.toLowerCase().includes('user')) {
        errorMessage = t.errors.userNotFound;
      }
      
      showAlert(t.error, errorMessage);
    } else {
      router.replace('/(tabs)');
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
        <View style={styles.languageSelector}>
          {(['uz', 'en', 'ru'] as Language[]).map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.languageButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                language === lang && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setLanguage(lang)}
            >
              <Text style={[
                styles.languageButtonText,
                { color: colors.text },
                language === lang && { color: '#FFFFFF' }
              ]}>
                {lang === 'uz' ? 'UZ' : lang === 'en' ? 'EN' : 'RU'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="search" size={48} color={colors.white} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t.appName}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t.appTagline}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, { backgroundColor: colors.surface, borderColor: colors.border }, mode === 'login' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => {
                setMode('login');
                setOtpSent(false);
                setOtp('');
              }}
            >
              <Text style={[styles.modeButtonText, { color: colors.text }, mode === 'login' && { color: colors.white }]}>
                {t.auth.login}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, { backgroundColor: colors.surface, borderColor: colors.border }, mode === 'register' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => {
                setMode('register');
                setOtpSent(false);
                setOtp('');
              }}
            >
              <Text style={[styles.modeButtonText, { color: colors.text }, mode === 'register' && { color: colors.white }]}>
                {t.auth.register}
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={email}
            onChangeText={setEmail}
            placeholder={t.auth.email}
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!otpSent}
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={password}
            onChangeText={setPassword}
            placeholder={t.auth.password}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            editable={!otpSent || mode === 'login'}
          />

          {mode === 'register' && !otpSent && (
            <>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t.auth.confirmPassword}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />

              <View style={[styles.privacyInfoBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                <MaterialIcons name="security" size={24} color={colors.primary} />
                <View style={styles.privacyInfoContent}>
                  <Text style={[styles.privacyInfoTitle, { color: colors.primary }]}>
                    {t.auth.privacyInfo}
                  </Text>
                  <Text style={[styles.privacyInfoText, { color: colors.text }]}>
                    {t.auth.privacyDescription}
                  </Text>
                </View>
              </View>

              <View style={styles.termsContainer}>
                <TouchableOpacity onPress={() => setTermsAccepted(!termsAccepted)}>
                  <MaterialIcons
                    name={termsAccepted ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={termsAccepted ? colors.primary : colors.textSecondary}
                  />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.termsText, { color: colors.text }]}>
                    {t.auth.termsAgree.split(t.auth.privacyPolicy)[0]}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                    <TouchableOpacity onPress={(e) => {
                      e.stopPropagation();
                      router.push('/privacy-policy');
                    }}>
                      <Text style={[styles.termsLink, { color: colors.primary }]}>
                        {t.auth.privacyPolicy}
                      </Text>
                    </TouchableOpacity>
                    <Text style={[styles.termsText, { color: colors.text }]}> {t.auth.and} </Text>
                    <TouchableOpacity onPress={(e) => {
                      e.stopPropagation();
                      router.push('/terms-of-service');
                    }}>
                      <Text style={[styles.termsLink, { color: colors.primary }]}>
                        {t.auth.termsOfService}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}

          {mode === 'register' && otpSent && (
            <>
              <Text style={[styles.otpInfo, { color: colors.textSecondary }]}>
                {t.auth.otpSent}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={otp}
                onChangeText={setOtp}
                placeholder={t.auth.enterOtp}
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={6}
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }, (operationLoading || (mode === 'register' && !termsAccepted)) && styles.submitButtonDisabled]}
            onPress={mode === 'login' ? handleLogin : handleRegister}
            disabled={operationLoading || (mode === 'register' && !termsAccepted)}
          >
            {operationLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === 'login' ? t.auth.login : otpSent ? t.auth.verifyAndRegister : t.auth.register}
              </Text>
            )}
          </TouchableOpacity>

          {mode === 'register' && otpSent && (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleSendOTP}
              disabled={operationLoading}
            >
              <Text style={[styles.resendButtonText, { color: colors.primary }]}>{t.auth.otpSent}</Text>
            </TouchableOpacity>
          )}

          {mode === 'login' && (
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => {
                console.log('[LOGIN] Forgot password pressed, email:', email);
                // Pass email to reset-password screen
                router.push({
                  pathname: '/reset-password',
                  params: { email: email || '' }
                });
              }}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>{t.auth.forgotPassword}</Text>
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
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  modeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 8,
    paddingHorizontal: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  privacyInfoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  privacyInfoContent: {
    flex: 1,
    gap: 4,
  },
  privacyInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  privacyInfoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  otpInfo: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  forgotPasswordButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  languageButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    minWidth: 60,
    alignItems: 'center',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
