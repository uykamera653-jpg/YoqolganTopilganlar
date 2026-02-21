import { getSupabaseClient } from '@/template';

const supabase = getSupabaseClient();

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  foundPosts: number;
  lostPosts: number;
  rewardPosts: number;
}

export const adminService = {
  async getStats(): Promise<{ data: AdminStats | null; error: string | null }> {
    try {
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true });

      if (usersError) {
        return { data: null, error: usersError.message };
      }

      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('type, reward');

      if (postsError) {
        return { data: null, error: postsError.message };
      }

      const totalUsers = users?.length || 0;
      const totalPosts = posts?.length || 0;
      const foundPosts = posts?.filter(p => p.type === 'found').length || 0;
      const lostPosts = posts?.filter(p => p.type === 'lost').length || 0;
      const rewardPosts = posts?.filter(p => p.reward).length || 0;

      return {
        data: {
          totalUsers,
          totalPosts,
          foundPosts,
          lostPosts,
          rewardPosts,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: (err as Error).message };
    }
  },

  async getAllUsers(): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, username, email, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message };
    }
  },

  async deletePost(postId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      return { error: (err as Error).message };
    }
  },

  async checkIsAdmin(): Promise<{ isAdmin: boolean; error: string | null }> {
    try {
      // Get current session to ensure we have fresh user data
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        return { isAdmin: false, error: null };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin, email')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Admin check error:', error.message);
        return { isAdmin: false, error: error.message };
      }

      console.log('Admin check result:', {
        userId: session.user.id,
        email: data?.email,
        isAdmin: data?.is_admin
      });

      return { isAdmin: data?.is_admin === true, error: null };
    } catch (err) {
      console.error('Admin check exception:', err);
      return { isAdmin: false, error: (err as Error).message };
    }
  },
};
