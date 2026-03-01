import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppTextInput from '@/components/AppText';
import PrimaryButton from '@/components/Button';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

export default function LoginForm({
  onLogin,
  onForgotPassword,
  onSignup,
  loading = false,
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = 'Username is required';
    if (!password)        e.password  = 'Password is required';
    return e;
  };

  const handleLogin = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      // show a single alert instead of inline messages
      Alert.alert(
        'Validation Error',
        Object.values(e).join('\n')
      );
      return;
    }

    onLogin(username.trim(), password);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>

        <Text style={styles.heading}>Login</Text>

        <Text style={styles.subheading}>
          Hello there! Please input your username and{'\n'}password to login
        </Text>

        <View style={styles.warningBox}>
          <Ionicons name="information-circle" size={16} color={Colors.appleRed} />
          <Text style={styles.warningText}>
            Only Super Admin accounts can access the application
          </Text>
        </View>

        <AppTextInput
          label="Username"
          placeholder="Enter username here"
          value={username}
          onChangeText={(t) => setUsername(t)}
          autoCapitalize="none"
          returnKeyType="next"
        />

        <View style={styles.passwordContainer}>
          <AppTextInput
            label="Password"
            placeholder="Enter password here"
            value={password}
            onChangeText={(t) => setPassword(t)}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? 'eye' : 'eye-off'} 
              size={18} 
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title="Login"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginBtn}
        />

        <TouchableOpacity
          onPress={onForgotPassword}
          style={styles.forgotWrapper}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <View style={styles.signupWrapper}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={onSignup}>
            <Text style={styles.signupLink}>Sign up here</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.xl,
    marginHorizontal: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heading: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subheading: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    lineHeight: 18,
  },
  warningBox: {
    backgroundColor: '#ffebee',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  warningText: {
    fontSize: FontSize.sm,
    color: Colors.appleRed,
    fontWeight: '500',
    flex: 1,
  },
  forgotWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  forgotText: {
    fontSize: FontSize.xs,
    color: Colors.primaryGreen,
    fontWeight: '500',
  },
  loginBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  signupWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

  },
  signupText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  signupLink: {
    fontSize: FontSize.sm,
    color: Colors.primaryGreen,
    fontWeight: '600',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 8,
    top: 25,
    padding: 6,
    alignItems: 'center',
  },
});
