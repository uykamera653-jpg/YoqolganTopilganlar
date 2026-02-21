import { getSupabaseClient } from '@/template';
import { Advertisement, AdvertisementFormData } from '@/types';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const supabase = getSupabaseClient();

export const advertisementService = {
  // Public: Get active advertisements with local caching and auto-refresh
  async getActiveAds(): Promise<{ data: Advertisement[] | null; error: string | null }> {
    try {
      console.log('🔄 Fetching active ads from database...');
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      console.log(`📊 Found ${data?.length || 0} active ads`);

      // Aggressive caching: Cache all media files for instant loading (mobile only)
      if (data && Platform.OS !== 'web') {
        // Start caching immediately in background
        data.forEach(async (ad) => {
          if (ad.media_url && (ad.type === 'image' || ad.type === 'video')) {
            this.getCachedMedia(ad.media_url, ad.id);
          }
        });

        // Return data with cached URLs
        const cachedAds = await Promise.all(
          data.map(async (ad) => {
            if (ad.media_url && (ad.type === 'image' || ad.type === 'video')) {
              const localUri = await this.getCachedMedia(ad.media_url, ad.id);
              return { ...ad, media_url: localUri || ad.media_url };
            }
            return ad;
          })
        );
        console.log('✅ Ads processed with aggressive local cache');
        return { data: cachedAds, error: null };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message };
    }
  },

  // Cache media file locally
  async getCachedMedia(remoteUrl: string, adId: string): Promise<string | null> {
    if (Platform.OS === 'web') return null;
    
    try {
      // Extract file extension
      const urlParts = remoteUrl.split('.');
      const extension = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
      
      // Create cache directory path
      const cacheDir = `${FileSystem.cacheDirectory}advertisements/`;
      const localPath = `${cacheDir}${adId}.${extension}`;
      
      // Check if file exists locally
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      
      if (fileInfo.exists) {
        console.log('✅ [Cache] Using cached media:', adId);
        return localPath;
      }
      
      // Download and cache
      console.log('⬇️ [Cache] Downloading media to local storage:', adId);
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      
      const downloadResult = await FileSystem.downloadAsync(remoteUrl, localPath);
      
      if (downloadResult.status === 200) {
        console.log('✅ [Cache] Media cached successfully! Path:', localPath);
        return downloadResult.uri;
      } else {
        console.warn('⚠️ [Cache] Download failed:', downloadResult.status);
        return null;
      }
    } catch (error) {
      console.error('❌ [Cache] Error caching media:', error);
      return null;
    }
  },

  // Clear advertisement cache
  async clearCache(): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      const cacheDir = `${FileSystem.cacheDirectory}advertisements/`;
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(cacheDir, { idempotent: true });
        console.log('✅ [Cache] Advertisement cache cleared');
      }
    } catch (error) {
      console.error('❌ [Cache] Error clearing cache:', error);
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
