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
    // "Next" on each step. onSubmit receives an object containing whatever
    // fields have been filled so far:
    //   { email }               -> step 1
    //   { email, verificationCode } -> step 2
    //   { email, verificationCode, newPassword } -> step 3 (final)
    setLoading(true);

    try {
      const { username, verificationCode, newPassword } = data;

      // NOTE: the backend endpoints used below do not exist yet in the repo;
      // you'll need to implement them (example names shown).  Adjust paths
      // as necessary based on your API design.

      if (!verificationCode) {
        // step 1: request a reset code be emailed
        const resp = await fetch('http://10.181.206.201:5200/api/auth/recovery/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.message || `Request failed (status ${resp.status})`);
        }
        const body = await resp.json().catch(() => ({}));
        
        // Check if the username/role is valid before proceeding
        if (!body.isValid) {
          throw new Error('Invalid credentials');
        }
        
        // clear any previous token
        setResetToken(null);
        Alert.alert('Proceed', 'Username and role matched. You may now enter the master recovery PIN.');
        return body;
      } else if (!newPassword) {
        // step 2: verify the code
        const resp = await fetch('http://10.181.206.201:5200/api/auth/recovery/verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, pin: verificationCode })
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.message || `Code verification failed (status ${resp.status})`);
        }
        // read token from response and keep in memory (frontend-only)
        const body = await resp.json().catch(() => ({}));
        if (body && body.token) {
          setResetToken(body.token);
          Alert.alert('Code Verified', 'You may now enter a new password.');
        } else {
          // generic failure (do not reveal details)
          throw new Error('Invalid credentials');
        }
        return body;
      } else {
        // step 3: submit new password
        const resp = await fetch('http://10.181.206.201:5200/api/auth/recovery/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, token: resetToken, newPassword })
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.message || `Reset failed (status ${resp.status})`);
        }
        const body = await resp.json().catch(() => ({}));
        Alert.alert('Success', 'Your password has been reset. You can now log in.');
        setShowForgotPassword(false);
        return body;
      }
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
      const response = await fetch('http://10.181.206.201:5200/api/auth/login', {
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
