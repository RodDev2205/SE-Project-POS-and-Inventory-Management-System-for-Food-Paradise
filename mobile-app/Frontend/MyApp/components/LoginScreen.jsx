import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Alert } from 'react-native';
import FoodParadiseLogo from '@/components/FoodParadiselogo';
import LoginForm from '@/components/LoginForm';
import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import CreateAccountScreen from '@/components/CreateAccountScreen';
import { Colors, Spacing } from '@/constants/theme';

export default function LoginScreen({
  onLoginSuccess,
  onSignupPress,
  variant = 'dark',
}) {
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const bg = variant === 'dark' ? Colors.greyBg : Colors.white;

  const handleForgotPassword = async (data) => {
    setLoading(true);
    try {
      // TODO: Replace with your real API call to reset password
      const { email, verificationCode, newPassword } = data;
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log('Password reset request:', { email, verificationCode, newPassword });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    setShowSignup(true);
  };

  const handleAccountCreated = (accountData) => {
    setShowSignup(false);
    if (onSignupPress) {
      onSignupPress(accountData);
    }
  };

  if (showSignup) {
    return (
      <CreateAccountScreen
        onAccountCreated={handleAccountCreated}
        onBackToLogin={() => setShowSignup(false)}
        variant={variant}
      />
    );
  }

  if (showForgotPassword) {
    return (
      <View style={[styles.root, { backgroundColor: bg }]}>
        <StatusBar
          barStyle={variant === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={bg}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoWrapper}>
            <FoodParadiseLogo size="medium" showSubtitle={false} />
          </View>
          <ForgotPasswordForm
            onBack={() => setShowForgotPassword(false)}
            onSubmit={handleForgotPassword}
            loading={loading}
          />
        </ScrollView>
      </View>
    );
  }

  const handleLogin = async (username, password) => {
    setLoading(true);
    try {
      // TODO: Replace with your real auth API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      if (username && password) {
        console.log('Login attempt:', { username, password });
        
        // TODO: Replace with actual backend authentication
        // Backend should verify credentials and return user data including role
        // Simulated user lookup - in production this comes from backend
        const users = {
          'superadmin': { email: 'superadmin@example.com', password: 'superadmin123', role: 'superadmin' },
          'admin': { email: 'admin@example.com', password: 'admin123', role: 'admin' },
          'cashier': { email: 'cashier@example.com', password: 'cashier123', role: 'cashier' },
        };
        
        const user = users[username];
        
        if (!user || user.password !== password) {
          Alert.alert('Login Failed', 'Invalid username or password.');
          return;
        }
        
        // Check if user role is superadmin
        if (user.role !== 'superadmin') {
          Alert.alert(
            'Access Denied',
            'Only superadmin users can access this application.'
          );
          return;
        }
        
        onLoginSuccess(username);
      } else {
        Alert.alert('Login Failed', 'Invalid username or password.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar
        barStyle={variant === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={bg}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoWrapper}>
          <FoodParadiseLogo size="medium" showSubtitle={false} />
        </View>
        <LoginForm
          onLogin={handleLogin}
          onForgotPassword={() => setShowForgotPassword(true)}
          onSignup={handleSignup}
          loading={loading}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
});
