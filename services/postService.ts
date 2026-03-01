import { getSupabaseClient } from '@/template';
import { Post, PostFormData, Comment } from '@/types';

const supabase = getSupabaseClient();

export const postService = {
  async fetchPosts(limit?: number, offset?: number): Promise<{ data: Post[] | null; error: string | null; hasMore: boolean }> {
    try {
      let query = supabase
        .from('posts')
        .select('*, user_profiles(username, avatar_url)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }
      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      
      const hasMore = count ? (offset || 0) + (data?.length || 0) < count : false;
      return { data, error: null, hasMore };
    } catch (error) {
      return { data: null, error: (error as Error).message, hasMore: false };
    }
  },

  async fetchPostsByType(type: 'found' | 'lost' | 'reward', limit?: number, offset?: number): Promise<{ data: Post[] | null; error: string | null; hasMore: boolean }> {
    try {
      let query = supabase
        .from('posts')
        .select('*, user_profiles(username, avatar_url)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (type === 'reward') {
        query = query.not('reward', 'is', null);
      } else {
        query = query.eq('type', type);
      }

      if (limit) {
        query = query.limit(limit);
      }
      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      
      const hasMore = count ? (offset || 0) + (data?.length || 0) < count : false;
      return { data, error: null, hasMore };
    } catch (error) {
      return { data: null, error: (error as Error).message, hasMore: false };
    }
  },

  async fetchPostById(id: string): Promise<{ data: Post | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, user_profiles(username, avatar_url)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  async createPost(postData: PostFormData): Promise<{ data: Post | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Tizimga kirish kerak');

      let imageUrl = postData.image_url;

      if (imageUrl && imageUrl.startsWith('data:image')) {
        const { url, error: uploadError } = await this.uploadImage(imageUrl);
        if (uploadError) {
          console.error('Rasm yuklashda xatolik:', uploadError);
        }
        imageUrl = url || undefined;
      }

      const insertData: any = {
        type: postData.type,
        title: postData.title,
        description: postData.description,
        location: postData.location,
        region: postData.region,
        contact: postData.contact,
        image_url: imageUrl,
        user_id: user.id,
      };

      if (postData.reward) insertData.reward = postData.reward;
      if (postData.date_occurred) insertData.date_occurred = postData.date_occurred;

      const { data, error } = await supabase
        .from('posts')
        .insert([insertData])
        .select('*, user_profiles(username, avatar_url)')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  async deletePost(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  async fetchComments(postId: string): Promise<{ data: Comment[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, user_profile:user_profiles(username, email)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  async addComment(postId: string, comment: string): Promise<{ data: Comment | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Tizimga kirish kerak');

      const { data, error } = await supabase
        .from('comments')
        .insert([{ post_id: postId, user_id: user.id, comment }])
        .select('*, user_profile:user_profiles(username, email)')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  async uploadImage(base64: string): Promise<{ url: string | null; error: string | null }> {
    try {
      const fileName = `${Date.now()}.jpg`;
      const base64Data = base64.split(',')[1];
      
      const { data, error } = await supabase.storage
        .from('posts')
        .upload(fileName, decode(base64Data), {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName);

      return { url: urlData.publicUrl, error: null };
    } catch (error) {
      return { url: null, error: (error as Error).message };
    }
  },
};

function decode(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
