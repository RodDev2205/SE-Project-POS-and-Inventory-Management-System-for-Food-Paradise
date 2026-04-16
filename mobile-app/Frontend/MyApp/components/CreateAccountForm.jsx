import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppTextInput from '@/components/AppText';
import PrimaryButton from '@/components/Button';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

// role selection removed — mobile-created accounts become Super Admin (role_id=3)

export default function CreateAccountForm({
  onCreateAccount,
  onBackToLogin,
  loading = false,
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // role is fixed to superadmin (3) for mobile-created accounts
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!firstName || !firstName.trim()) e.firstName = 'First name is required';
    if (!lastName || !lastName.trim()) e.lastName = 'Last name is required';
    if (!username || !username.trim()) e.username = 'Username is required';
    if (!email || !email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email.trim())) e.email = 'Please enter a valid email address';
    if (!password) e.password = 'Password is required';
    if (password && password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password';
    if (password && password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleCreateAccount = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    onCreateAccount({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
      role_id: 3, // automatically assign Super Admin
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        {onBackToLogin && (
          <TouchableOpacity
            onPress={onBackToLogin}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
        
        <Text style={styles.heading}>Create Account</Text>

        <Text style={styles.subheading}>
          Create a new account for cashier,{'\n'}admin or super admin
        </Text>

        <AppTextInput
          label="First Name"
          placeholder="Enter first name"
          value={firstName}
          onChangeText={(t) => { setFirstName(t); setErrors(e => ({ ...e, firstName: undefined })); }}
          error={errors.firstName}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <AppTextInput
          label="Last Name"
          placeholder="Enter last name"
          value={lastName}
          onChangeText={(t) => { setLastName(t); setErrors(e => ({ ...e, lastName: undefined })); }}
          error={errors.lastName}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <AppTextInput
          label="Username"
          placeholder="Enter username"
          value={username}
          onChangeText={(t) => { setUsername(t); setErrors(e => ({ ...e, username: undefined })); }}
          error={errors.username}
          autoCapitalize="none"
          returnKeyType="next"
        />

        <AppTextInput
          label="Email"
          placeholder="Enter email address"
          value={email}
          onChangeText={(t) => { setEmail(t); setErrors(e => ({ ...e, email: undefined })); }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
        />

        <AppTextInput
          label="Password"
          placeholder="Enter password"
          value={password}
          onChangeText={(t) => { setPassword(t); setErrors(e => ({ ...e, password: undefined })); }}
          error={errors.password}
          secureTextEntry={!showPassword}
          returnKeyType="next"
          rightIcon={showPassword ? 'eye' : 'eye-off'}
          onRightIconPress={() => setShowPassword(v => !v)}
        />

        <AppTextInput
          label="Confirm Password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={(t) => { setConfirmPassword(t); setErrors(e => ({ ...e, confirmPassword: undefined })); }}
          error={errors.confirmPassword}
          secureTextEntry={!showConfirmPassword}
          returnKeyType="done"
          rightIcon={showConfirmPassword ? 'eye' : 'eye-off'}
          onRightIconPress={() => setShowConfirmPassword(v => !v)}
        />

        {/* Role is assigned automatically (Super Admin) — no selection */}

        <PrimaryButton
          title="Create Account"
          onPress={handleCreateAccount}
          loading={loading}
          style={styles.createBtn}
        />

        {onBackToLogin && (
          <View style={styles.loginWrapper}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={onBackToLogin}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl + 10,
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
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  roleWrapper: {
    marginBottom: Spacing.md,
  },
  roleButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleButtonError: {
    borderColor: Colors.appleRed,
  },
  roleButtonText: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    flex: 1,
  },
  rolePlaceholder: {
    color: Colors.inputPlaceholder,
  },
  errorText: {
    marginTop: Spacing.xs,
    fontSize: FontSize.xs,
    color: Colors.appleRed,
  },
  createBtn: {
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  roleOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.greyBg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleOptionSelected: {
    backgroundColor: Colors.inputBg,
  },
  roleOptionText: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    flex: 1,
  },
  roleOptionTextSelected: {
    fontWeight: '600',
    color: Colors.primaryGreen,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  loginWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  loginText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: FontSize.sm,
    color: Colors.primaryGreen,
    fontWeight: '600',
  },
});
