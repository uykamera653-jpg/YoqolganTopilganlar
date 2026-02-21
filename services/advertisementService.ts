import { getSupabaseClient } from '@/template';
import { Advertisement, AdvertisementFormData } from '@/types';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const supabase = getSupabaseClient();

export const advertisementService = {
  // Preload all advertisements on app startup (background silent download)
  async preloadAllAds(): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      console.log('🚀 [App Startup] Preloading advertisements...');
      
      // Fetch active ads from database
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true);
      
      if (error || !data) {
        console.error('❌ [Preload] Database error:', error?.message);
        return;
      }
      
      console.log(`📦 [Preload] Found ${data.length} ads to preload`);
      
      // Download all media files in parallel (background)
      const downloadPromises = data.map(async (ad) => {
        if (ad.media_url && (ad.type === 'image' || ad.type === 'video')) {
          const cachedUri = await this.checkCachedMedia(ad.media_url, ad.id);
          
          if (cachedUri) {
            console.log('✅ [Preload] Already cached:', ad.id);
          } else {
            console.log('⬇️ [Preload] Downloading:', ad.id);
            await this.downloadAndCacheMedia(ad.media_url, ad.id);
          }
        }
      });
      
      await Promise.all(downloadPromises);
      console.log('✅ [Preload] All advertisements preloaded successfully!');
    } catch (error) {
      console.error('❌ [Preload] Error:', error);
    }
  },
  // Public: Get active advertisements with instant local caching
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

      // Mobile: Return cached URLs immediately for instant loading
      if (data && Platform.OS !== 'web') {
        // Process all ads synchronously to check cache FIRST
        const cachedAds = await Promise.all(
          data.map(async (ad) => {
            if (ad.media_url && (ad.type === 'image' || ad.type === 'video')) {
              // Check if file already cached
              const cachedUri = await this.checkCachedMedia(ad.media_url, ad.id);
              
              if (cachedUri) {
                console.log('✅ [Cache HIT] Using cached:', ad.id);
                return { ...ad, media_url: cachedUri };
              } else {
                // Not cached - start download in background and return original URL
                console.log('⬇️ [Cache MISS] Downloading:', ad.id);
                this.downloadAndCacheMedia(ad.media_url, ad.id);
                return ad; // Return original URL, next time will use cache
              }
            }
            return ad;
          })
        );
        console.log('✅ Ads processed with instant cache lookup');
        return { data: cachedAds, error: null };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message };
    }
  },

  // Check if media is already cached (synchronous check)
  async checkCachedMedia(remoteUrl: string, adId: string): Promise<string | null> {
    if (Platform.OS === 'web') return null;
    
    try {
      const urlParts = remoteUrl.split('.');
      const extension = urlParts[urlParts.length - 1].split('?')[0];
      const cacheDir = `${FileSystem.cacheDirectory}advertisements/`;
      const localPath = `${cacheDir}${adId}.${extension}`;
      
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      
      if (fileInfo.exists) {
        return localPath;
      }
      
      return null;
    } catch (error) {
      console.error('❌ [Cache Check] Error:', error);
      return null;
    }
  },

  // Download and cache media in background
  async downloadAndCacheMedia(remoteUrl: string, adId: string): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      const urlParts = remoteUrl.split('.');
      const extension = urlParts[urlParts.length - 1].split('?')[0];
      const cacheDir = `${FileSystem.cacheDirectory}advertisements/`;
      const localPath = `${cacheDir}${adId}.${extension}`;
      
      console.log('⬇️ [Background Download] Starting:', adId);
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      
      const downloadResult = await FileSystem.downloadAsync(remoteUrl, localPath);
      
      if (downloadResult.status === 200) {
        console.log('✅ [Background Download] Complete:', adId);
      } else {
        console.warn('⚠️ [Background Download] Failed:', downloadResult.status);
      }
    } catch (error) {
      console.error('❌ [Background Download] Error:', error);
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
