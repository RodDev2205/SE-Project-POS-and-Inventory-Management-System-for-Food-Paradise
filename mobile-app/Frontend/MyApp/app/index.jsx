import { router } from 'expo-router';
import SplashScreen from '@/components/SplashScreen';

export default function Index() {
  return (
    <SplashScreen
      variant="light"
      duration={2000}
      onFinish={() => router.replace('/Login')}
    />
  );
}
