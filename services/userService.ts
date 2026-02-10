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
      console.log('[USER_SERVICE] Starting avatar upload...');
      
      // Extract base64 data (remove 'data:image/jpeg;base64,' prefix)
      const base64Data = base64Image.includes('base64,') 
        ? base64Image.split('base64,')[1] 
        : base64Image;
      
      console.log('[USER_SERVICE] Base64 data length:', base64Data.length);
      
      // Convert base64 to arraybuffer (React Native compatible)
      const binaryString = typeof atob !== 'undefined' ? atob(base64Data) : Buffer.from(base64Data, 'base64').toString('binary');
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer;
      
      console.log('[USER_SERVICE] ArrayBuffer size:', arrayBuffer.byteLength);

      const fileName = `${userId}/${Date.now()}.jpg`;
      console.log('[USER_SERVICE] Uploading to:', fileName);
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('[USER_SERVICE] Upload error:', uploadError);
        return { url: null, error: uploadError.message };
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('[USER_SERVICE] Upload successful. Public URL:', data.publicUrl);
      return { url: data.publicUrl, error: null };
    } catch (err: any) {
      console.error('[USER_SERVICE] Upload exception:', err);
      return { url: null, error: err.message || 'Rasm yuklashda xatolik' };
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
