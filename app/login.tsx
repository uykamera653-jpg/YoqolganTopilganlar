import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useAuth, useAlert } from '@/template';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { sendOTP, verifyOTPAndLogin, signInWithPassword, signUpWithPassword, operationLoading } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      showAlert('Xato', 'Email manzilini kiriting');
      return;
    }

    const { error } = await sendOTP(email);
    if (error) {
      showAlert('Xato', error);
    } else {
      setOtpSent(true);
      showAlert('Muvaffaqiyatli', 'OTP kod emailingizga yuborildi');
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      showAlert('Xato', 'Barcha maydonlarni to\'ldiring');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Xato', 'Parollar mos kelmaydi');
      return;
    }

    if (password.length < 6) {
      showAlert('Xato', 'Parol kamida 6 belgidan iborat bo\'lishi kerak');
      return;
    }

    if (!otpSent) {
      await handleSendOTP();
      return;
    }

    if (!otp.trim()) {
      showAlert('Xato', 'OTP kodni kiriting');
      return;
    }

    const { error } = await verifyOTPAndLogin(email, otp, { password });
    if (error) {
      showAlert('Xato', error);
    } else {
      showAlert('Muvaffaqiyatli', 'Ro\'yxatdan o\'tdingiz!');
      router.replace('/(tabs)');
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Xato', 'Email va parolni kiriting');
      return;
    }

    const { error } = await signInWithPassword(email, password);
    if (error) {
      showAlert('Xato', error);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="search" size={48} color={colors.white} />
          </View>
          <Text style={styles.title}>FINDO</Text>
          <Text style={styles.subtitle}>Yo'qotdingizmi? Topdingizmi? E'lon qoldiring!</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]}
              onPress={() => {
                setMode('login');
                setOtpSent(false);
                setOtp('');
              }}
            >
              <Text style={[styles.modeButtonText, mode === 'login' && styles.modeButtonTextActive]}>
                Kirish
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'register' && styles.modeButtonActive]}
              onPress={() => {
                setMode('register');
                setOtpSent(false);
                setOtp('');
              }}
            >
              <Text style={[styles.modeButtonText, mode === 'register' && styles.modeButtonTextActive]}>
                Ro'yxatdan o'tish
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!otpSent}
          />

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Parol"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            editable={!otpSent || mode === 'login'}
          />

          {mode === 'register' && !otpSent && (
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Parolni tasdiqlash"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
          )}

          {mode === 'register' && otpSent && (
            <>
              <Text style={styles.otpInfo}>
                OTP kod emailingizga yuborildi. Kodni kiriting:
              </Text>
              <TextInput
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                placeholder="OTP kod"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={6}
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.submitButton, operationLoading && styles.submitButtonDisabled]}
            onPress={mode === 'login' ? handleLogin : handleRegister}
            disabled={operationLoading}
          >
            {operationLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === 'login' ? 'Kirish' : otpSent ? 'Tasdiqlash' : 'Ro\'yxatdan o\'tish'}
              </Text>
            )}
          </TouchableOpacity>

          {mode === 'register' && otpSent && (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleSendOTP}
              disabled={operationLoading}
            >
              <Text style={styles.resendButtonText}>OTP kodni qayta yuborish</Text>
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
    backgroundColor: colors.background,
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
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.white,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.base,
    color: colors.text,
    marginBottom: spacing.md,
  },
  otpInfo: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.lg,
    fontWeight: typography.semibold,
  },
  resendButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  resendButtonText: {
    color: colors.primary,
    fontSize: typography.base,
    fontWeight: typography.medium,
  },
});
