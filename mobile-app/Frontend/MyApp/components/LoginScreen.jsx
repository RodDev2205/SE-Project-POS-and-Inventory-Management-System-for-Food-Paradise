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
      // Call backend authentication API using machine IP instead of localhost
      const response = await fetch('http://10.181.206.201:5200/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      // Check if user is superadmin (role_id = 3)
      if (data.role_id !== 3) {
        Alert.alert(
          'Access Denied',
          'Only Super Admin accounts can access this application.'
        );
        return;
      }

      // Store token in memory (or pass via context prop to parent)
      console.log('Login successful:', { 
        username, 
        role_id: data.role_id,
        token: data.token,
        user_id: data.user_id,
        branch_id: data.branch_id
      });
      
      // Pass user data to parent component
      if (onLoginSuccess) {
        onLoginSuccess({
          username,
          token: data.token,
          user_id: data.user_id,
          role_id: data.role_id,
          branch_id: data.branch_id
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      Alert.alert('Login Failed', message);
      console.error('Login error:', err);
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
