import React, { useState, useContext } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Alert } from 'react-native';
import FoodParadiseLogo from '@/components/FoodParadiselogo';
import LoginForm from '@/components/LoginForm';
import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import CreateAccountScreen from '@/components/CreateAccountScreen';
import { Colors, Spacing } from '@/constants/theme';
import { NotificationContext } from '@/context/NotificationContext';

export default function LoginScreen({
  onLoginSuccess,
  onSignupPress,
  variant = 'dark',
}) {
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const bg = variant === 'dark' ? Colors.greyBg : Colors.white;

  const handleForgotPassword = async (data) => {
    // this handler is invoked by <ForgotPasswordForm> when the user clicks
    // "Next" on each step. onSubmit receives an object containing:
    //   { endpoint, data } where endpoint is 'send-otp', 'verify-otp', or 'reset-password'
    setLoading(true);
    console.log('handleForgotPassword called with:', data);

    try {
      const { endpoint, data: requestData } = data;

      // Base API URL - adjust as needed
      const baseUrl = 'https://deployment-backend-repo-production.up.railway.app/api/auth';

      if (endpoint === 'send-otp') {
        console.log('Sending OTP request to:', `${baseUrl}/send-otp`, 'with data:', requestData);
        // Step 1: Send OTP to email
        const resp = await fetch(`${baseUrl}/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });
        console.log('OTP send response status:', resp.status);
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          console.error('OTP send error:', err);
          throw new Error(err.error || `Request failed (status ${resp.status})`);
        }
        const body = await resp.json().catch(() => ({}));
        console.log('OTP send success:', body);
        Alert.alert('OTP Sent', 'Please check your email for the 6-digit OTP code.');
        return body;
      } else if (endpoint === 'verify-otp') {
        // Step 2: Verify OTP code
        const resp = await fetch(`${baseUrl}/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error || `OTP verification failed (status ${resp.status})`);
        }
        const body = await resp.json().catch(() => ({}));
        if (body.verified) {
          Alert.alert('OTP Verified', 'You may now enter a new password.');
        } else {
          throw new Error('Invalid OTP code');
        }
        return body;
      } else if (endpoint === 'reset-password') {
        // Step 3: Reset password
        const resp = await fetch(`${baseUrl}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error || `Password reset failed (status ${resp.status})`);
        }
        const body = await resp.json().catch(() => ({}));
        Alert.alert('Success', 'Your password has been reset successfully. You can now log in.');
        setShowForgotPassword(false);
        return body;
      } else if (endpoint === 'resend-otp') {
        // Handle resend OTP
        const resp = await fetch(`${baseUrl}/resend-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error || `Resend failed (status ${resp.status})`);
        }
        const body = await resp.json().catch(() => ({}));
        return body;
      }

      throw new Error('Unknown endpoint');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password.';
      Alert.alert('Error', message);
      console.warn('Forgot password error:', err);
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

  const { setAuth } = useContext(NotificationContext);

  const handleLogin = async (username, password) => {
    setLoading(true);
    try {
      // Call backend authentication API using machine IP instead of localhost
      const response = await fetch('https://deployment-backend-repo-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        // attempt to read error body, but guard against non-json
        let message = 'Login failed';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            message = errorData.message;
          }
        } catch (_err) {
          // ignore parse error
        }

        // Add status code for debugging
        const statusInfo = response.status ? ` (status ${response.status})` : '';
        throw new Error(message + statusInfo);
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

      // store auth info in context as well as notify parent
      console.log('Login successful:', { 
        username, 
        role_id: data.role_id,
        token: data.token,
        user_id: data.user_id,
        branch_id: data.branch_id
      });
      setAuth({ token: data.token, user: data });

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
      // ensure we surface a user-friendly message
      let message = 'Something went wrong.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }

      Alert.alert('Login Failed', message);
      // use warn instead of error so it doesn't trigger a red box in dev mode
      console.warn('Login error:', err);
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
