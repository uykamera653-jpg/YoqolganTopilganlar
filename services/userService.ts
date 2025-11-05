import { getSupabaseClient } from '@/template';

const supabase = getSupabaseClient();

export const userService = {
  async updateProfile(userId: string, username: string, avatarUrl?: string) {
    const updateData: { username: string; avatar_url?: string } = { username };
    if (avatarUrl !== undefined) {
      updateData.avatar_url = avatarUrl;
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  },

  async uploadAvatar(userId: string, base64Image: string): Promise<{ url: string | null; error: string | null }> {
    try {
      const base64Data = base64Image.split(',')[1];
      const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const blob = new Blob([buffer], { type: 'image/jpeg' });

      const fileName = `${userId}/${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        return { url: null, error: uploadError.message };
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return { url: data.publicUrl, error: null };
    } catch (err) {
      return { url: null, error: 'Rasm yuklashda xatolik' };
    }
  },

  async deleteAvatar(avatarUrl: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const fileName = avatarUrl.split('/avatars/')[1];
      const { error } = await supabase.storage
        .from('avatars')
        .remove([fileName]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: 'Rasmni o\'chirishda xatolik' };
    }
  },
};
