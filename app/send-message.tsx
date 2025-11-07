
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing } from '@/constants/theme';
import { messageService } from '@/services/messageService';
import { useAuth, useAlert } from '@/template';
import { useTheme } from '@/contexts/ThemeContext';

export default function SendMessageScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userId, username } = useLocalSearchParams<{ userId: string; username: string }>();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || !userId || !user) {
      showAlert('Xatolik', 'Xabar bo\'sh bo\'lmasligi kerak');
      return;
    }

    setSending(true);
    const { error } = await messageService.sendMessage(userId, message.trim(), user.id);
    setSending(false);

    if (error) {
      showAlert('Xatolik', 'Xabar yuborishda xatolik yuz berdi');
    } else {
      showAlert('Muvaffaqiyatli', 'Xabar yuborildi');
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Stack.Screen
        options={{
          headerTitle: username ? `Send message to ${username}` : 'Send message',
          headerBackTitleVisible: false,
          headerTintColor: colors.text,
          headerStyle: {
            backgroundColor: colors.background,
          },
        }}
      />
      <View style={styles.content}>
        <View style={styles.userInfo}>
          <MaterialIcons name="person" size={64} color={colors.primary} />
          <Text style={styles.username}>{username}</Text>
        </View>

        <TextInput
          style={[styles.input, { borderColor: colors.border }]}
          placeholder="Type your message here..."
          placeholderTextColor={colors.textSecondary}
          multiline
          value={message}
          onChangeText={setMessage}
          maxLength={500}
          editable={!sending}
        />
        <Text style={styles.charCount}>{message.length}/500</Text>

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || sending) && styles.sendButtonDisabled,
            { backgroundColor: colors.primary },
          ]}
          onPress={handleSend}
          disabled={!message.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name="send" size={24} color="#FFFFFF" />
              <Text style={styles.sendButtonText}>Send Message</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    minHeight: 200,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
