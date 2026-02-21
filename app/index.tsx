import { AuthRouter } from '@/template';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { advertisementService } from '@/services/advertisementService';

export default function RootScreen() {
  // Preload advertisements on app startup (silent background download)
  useEffect(() => {
    console.log('🚀 [App Startup] Starting advertisement preload...');
    advertisementService.preloadAllAds();
  }, []);

  return (
    <AuthRouter loginRoute="/login">
      <Redirect href="/(tabs)" />
    </AuthRouter>
  );
}
