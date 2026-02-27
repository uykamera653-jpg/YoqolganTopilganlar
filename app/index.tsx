import { AuthRouter } from '@/template';
import { Redirect } from 'expo-router';

export default function RootScreen() {
  return (
    <AuthRouter 
      loginRoute="/login"
      excludeRoutes={['/privacy-policy', '/terms-of-service', '/reset-password']}
    >
      <Redirect href="/(tabs)" />
    </AuthRouter>
  );
}
