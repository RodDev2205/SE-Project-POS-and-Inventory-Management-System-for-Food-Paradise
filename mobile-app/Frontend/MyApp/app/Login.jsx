import { router } from 'expo-router';
import LoginScreen from '@/components/LoginScreen';

export default function Login() {
  return (
    <LoginScreen
      variant="light"
      onLoginSuccess={() => router.replace('/(tabs)')}
      onForgotPassword={() => {}}
    />
  );
}
