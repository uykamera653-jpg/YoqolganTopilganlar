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

      // Convert base64 to blob
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const { data, error } = await supabase.storage
        .from('advertisements')
        .upload(fileName, blob, {
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
      const timestamp = Date.now();
      const fileName = `ad_${timestamp}.mp4`;

      // Convert base64 to blob
      const base64Data = videoBase64.replace(/^data:video\/\w+;base64,/, '');
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'video/mp4' });

      const { data, error } = await supabase.storage
        .from('advertisements')
        .upload(fileName, blob, {
          contentType: 'video/mp4',
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
