import { getSupabaseClient } from '@/template';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    username: string;
    email: string;
  };
  receiver?: {
    username: string;
    email: string;
  };
}

export interface Conversation {
  user_id: string;
  username: string;
  email: string;
  avatar_url?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const supabase = getSupabaseClient();

export const messageService = {
  // Send a message
  async sendMessage(receiverId: string, message: string, senderId: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        message,
      })
      .select()
      .single();

    return { data, error };
  },

  // Get messages between two users
  async getMessages(userId: string, otherUserId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(username, email),
        receiver:receiver_id(username, email)
      `)
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    return { data, error };
  },

  // Get conversations list
  async getConversations(userId: string) {
    // Get all messages where user is sender or receiver
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, username, email, avatar_url),
        receiver:receiver_id(id, username, email, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error || !messages) {
      return { data: null, error };
    }

    // Group by other user
    const conversationsMap = new Map<string, Conversation>();

    messages.forEach((msg: any) => {
      const isReceiver = msg.receiver_id === userId;
      const otherUser = isReceiver ? msg.sender : msg.receiver;
      const otherUserId = isReceiver ? msg.sender_id : msg.receiver_id;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user_id: otherUserId,
          username: otherUser?.username || 'Foydalanuvchi',
          email: otherUser?.email || '',
          avatar_url: otherUser?.avatar_url,
          last_message: msg.message,
          last_message_time: msg.created_at,
          unread_count: 0,
        });
      }

      // Count unread messages
      if (msg.receiver_id === userId && !msg.is_read) {
        const conv = conversationsMap.get(otherUserId)!;
        conv.unread_count += 1;
      }
    });

    const conversations = Array.from(conversationsMap.values());
    return { data: conversations, error: null };
  },

  // Mark messages as read
  async markAsRead(userId: string, senderId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', userId)
      .eq('sender_id', senderId)
      .eq('is_read', false);

    return { error };
  },

  // Get unread count
  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);

    return { count: count || 0, error };
  },
};
