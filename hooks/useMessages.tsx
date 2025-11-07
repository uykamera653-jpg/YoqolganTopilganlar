import { useState, useEffect, useCallback } from 'react';
import { messageService, Message, Conversation } from '@/services/messageService';
import { useAuth } from '@/template';

export function useMessages(otherUserId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Load messages between two users
  const loadMessages = useCallback(async () => {
    if (!user || !otherUserId) return;
    
    setLoading(true);
    const { data, error } = await messageService.getMessages(user.id, otherUserId);
    
    if (data) {
      setMessages(data as Message[]);
      // Mark as read
      await messageService.markAsRead(user.id, otherUserId);
    }
    
    setLoading(false);
  }, [user, otherUserId]);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await messageService.getConversations(user.id);
    
    if (data) {
      setConversations(data);
    }
    
    setLoading(false);
  }, [user]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    if (!user) return;
    
    const { count } = await messageService.getUnreadCount(user.id);
    setUnreadCount(count);
  }, [user]);

  // Send message
  const sendMessage = async (receiverId: string, message: string) => {
    if (!user || !message.trim()) return { error: 'Xabar bo\'sh bo\'lmasligi kerak' };
    
    setSending(true);
    const result = await messageService.sendMessage(receiverId, message.trim(), user.id);
    setSending(false);
    
    if (!result.error && result.data) {
      setMessages(prev => [...prev, result.data as Message]);
    }
    
    return result;
  };

  // Polling for new messages
  useEffect(() => {
    if (!user) return;

    if (otherUserId) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    } else {
      loadConversations();
      loadUnreadCount();
      const interval = setInterval(() => {
        loadConversations();
        loadUnreadCount();
      }, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user, otherUserId, loadMessages, loadConversations, loadUnreadCount]);

  return {
    messages,
    conversations,
    unreadCount,
    loading,
    sending,
    sendMessage,
    refreshMessages: loadMessages,
    refreshConversations: loadConversations,
  };
}
