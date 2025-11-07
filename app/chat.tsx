import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { staticColors, spacing } from '@/constants/theme';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/template';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { userId, username } = useLocalSearchParams<{ userId: string; username: string }>();
  const { user } = useAuth();
  const { messages, loading, sending, sendMessage } = useMessages(userId);
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!messageText.trim() || !userId) return;

    const result = await sendMessage(userId, messageText);
    if (!result.error) {
      setMessageText('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: username || t.messages.chatWith,
          headerStyle: { backgroundColor: staticColors.primary },
          headerTintColor: staticColors.white,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {loading && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={staticColors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isMine = item.sender_id === user?.id;
              return (
                <View
                  style={[
                    styles.messageContainer,
                    isMine ? styles.myMessage : styles.theirMessage,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isMine ? [styles.myBubble, { backgroundColor: staticColors.primary }] : [styles.theirBubble, { backgroundColor: colors.surface }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isMine ? { color: staticColors.white } : { color: colors.text },
                      ]}
                    >
                      {item.message}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        isMine ? { color: 'rgba(255, 255, 255, 0.7)', textAlign: 'right' } : { color: colors.textSecondary },
                      ]}
                    >
                      {formatTime(item.created_at)}
                    </Text>
                  </View>
                </View>
              );
            }}
            contentContainerStyle={[
              styles.messagesList,
              { paddingBottom: insets.bottom + spacing.md },
            ]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom, backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
            placeholder={t.messages.typeMessage}
            placeholderTextColor={colors.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: staticColors.primary }, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={staticColors.white} />
            ) : (
              <MaterialIcons name="send" size={24} color={staticColors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '75%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
