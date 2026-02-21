import { getSupabaseClient } from '@/template';
import { Advertisement, AdvertisementFormData } from '@/types';

const supabase = getSupabaseClient();

export const advertisementService = {
  // Public: Get active advertisements
  async getActiveAds(): Promise<{ data: Advertisement[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message };
    }
  },

  // Admin: Get all advertisements
  async getAllAds(): Promise<{ data: Advertisement[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message };
    }
  },

  // Admin: Upload image to storage
  async uploadImage(imageBase64: string): Promise<{ url: string | null; error: string | null }> {
    try {
      const timestamp = Date.now();
      const fileName = `ad_${timestamp}.jpg`;

      // Remove data:image/...;base64, prefix
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      
      // Decode base64 to binary string
      const binaryString = atob(base64Data);
      
      // Convert binary string to Uint8Array (React Native compatible)
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Upload directly with Uint8Array (no Blob needed)
      const { data, error } = await supabase.storage
        .from('advertisements')
        .upload(fileName, bytes, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });

      if (error) {
        return { url: null, error: error.message };
      }

      const { data: publicUrlData } = supabase.storage
        .from('advertisements')
        .getPublicUrl(data.path);

      return { url: publicUrlData.publicUrl, error: null };
    } catch (err) {
      return { url: null, error: (err as Error).message };
    }
  },

  // Admin: Upload video to storage
  async uploadVideo(videoBase64: string): Promise<{ url: string | null; error: string | null }> {
    try {
      console.log('🎬 Starting video upload...');
      console.log('📦 Video size (base64):', Math.round(videoBase64.length / 1024), 'KB');
      
      const timestamp = Date.now();
      const fileName = `ad_${timestamp}.mp4`;

      // Remove data:video/...;base64, prefix
      const base64Data = videoBase64.replace(/^data:video\/\w+;base64,/, '');
      console.log('✂️ Base64 prefix removed, new size:', Math.round(base64Data.length / 1024), 'KB');
      
      // Decode base64 to binary string
      const binaryString = atob(base64Data);
      console.log('🔓 Base64 decoded to binary, size:', Math.round(binaryString.length / 1024), 'KB');
      
      // Convert binary string to Uint8Array (React Native compatible)
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      console.log('📊 Uint8Array created, size:', Math.round(bytes.length / 1024), 'KB');

      // Upload directly with Uint8Array (no Blob needed)
      console.log('⬆️ Uploading to Supabase Storage...');
      const { data, error } = await supabase.storage
        .from('advertisements')
        .upload(fileName, bytes, {
          contentType: 'video/mp4',
          cacheControl: '3600',
        });

      if (error) {
        console.error('❌ Upload error:', error.message);
        return { url: null, error: error.message };
      }

      console.log('✅ Upload successful, path:', data.path);
      const { data: publicUrlData } = supabase.storage
        .from('advertisements')
        .getPublicUrl(data.path);

      console.log('🔗 Public URL:', publicUrlData.publicUrl.substring(0, 80) + '...');
      return { url: publicUrlData.publicUrl, error: null };
    } catch (err) {
      console.error('❌ Video upload exception:', err);
      return { url: null, error: (err as Error).message };
    }
  },

  // Admin: Create advertisement
  async createAd(adData: AdvertisementFormData): Promise<{ data: Advertisement | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .insert([{
          type: adData.type,
          title: adData.title,
          content: adData.content,
          media_url: adData.media_url,
          link_url: adData.link_url,
          display_order: adData.display_order || 0,
        }])
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message };
    }
  },

  // Admin: Update advertisement
  async updateAd(id: string, adData: Partial<AdvertisementFormData>): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update(adData)
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      return { error: (err as Error).message };
    }
  },

  // Admin: Toggle advertisement active status
  async toggleAdStatus(id: string, isActive: boolean): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      return { error: (err as Error).message };
    }
  },

  // Admin: Delete advertisement
  async deleteAd(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      return { error: (err as Error).message };
    }
  },
};
