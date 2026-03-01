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

export default function ForgotPasswordForm({
  onBack,
  onSubmit,
  loading = false,
}) {
  const [step, setStep] = useState(1); // 1: username, 2: verification code, 3: new password
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!username.trim()) e.username = 'Username is required';
    } else if (step === 2) {
      if (!verificationCode.trim()) e.verificationCode = 'Verification code is required';
      if (verificationCode.length < 8) e.verificationCode = 'Verification code must be 8 digits';
    } else if (step === 3) {
      if (!newPassword) e.newPassword = 'New password is required';
      if (newPassword.length < 6) e.newPassword = 'Password must be at least 6 characters';
      if (!confirmPassword) e.confirmPassword = 'Please confirm your password';
      if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    return e;
  };

  const handleNext = async () => {
    const e = validateStep();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});

    try {
      if (step === 1) {
        // start recovery; check if username is valid before advancing
        const result = await onSubmit({ username: username.trim() });
        // Only advance if backend confirms username exists and is superadmin
        if (result && result.isValid === true) {
          setStep(2);
        } else {
          // If isValid is false or missing, don't advance
          throw new Error('Invalid credentials');
        }
        return;
      }

      if (step === 2) {
        // verify PIN; parent should return { token } on success
        const result = await onSubmit({ username: username.trim(), verificationCode: verificationCode.trim() });
        if (result && result.token) {
          setStep(3);
        } else {
          throw new Error('Invalid credentials');
        }
        return;
      }

      // step === 3: perform reset
      await onSubmit({ username: username.trim(), verificationCode: verificationCode.trim(), newPassword });
      setSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed';
      Alert.alert('Error', message);
      // keep the user on the same step
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    } else {
      onBack();
    }
  };

  if (submitted) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <View style={styles.successIconWrapper}>
            <Ionicons name="checkmark-circle" size={60} color={Colors.primaryGreen} />
          </View>

          <Text style={styles.successHeading}>Password Reset</Text>

          <Text style={styles.successMessage}>
            Your password has been{'\n'}reset successfully!
          </Text>

          <Text style={styles.successSubtext}>
            You can now log in with your new password.
          </Text>

          <PrimaryButton
            title="Back to Login"
            onPress={() => {
              setSubmitted(false);
              setUsername('');
              setVerificationCode('');
              setNewPassword('');
              setConfirmPassword('');
              setStep(1);
              onBack();
            }}
            style={styles.backBtn}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Reset Password';
      case 2:
        return 'Recovery PIN';
      case 3:
        return 'New Password';
      default:
        return 'Forgot Password?';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1:
        return 'Enter your username';
      case 2:
        return 'Enter the 8-digit recovery PIN for your account';
      case 3:
        return 'Create a new password';
      default:
        return '';
    }
  };

  const getButtonLabel = () => {
    switch (step) {
      case 1:
      case 2:
        return 'Next';
      case 3:
        return 'Reset Password';
      default:
        return 'Next';
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.heading}>{getStepTitle()}</Text>

        <Text style={styles.subheading}>{getStepSubtitle()}</Text>

        {/* Step 1: Username */}
        {step === 1 && (
          <AppTextInput
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChangeText={(t) => { setUsername(t); setErrors(e => ({ ...e, username: undefined })); }}
            error={errors.username}
            autoCapitalize="none"
            returnKeyType="next"
          />
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <View>
            <AppTextInput
              label="Master Recovery PIN"
              placeholder="Enter 8-digit pin"
              value={verificationCode}
              onChangeText={(t) => { setVerificationCode(t); setErrors(e => ({ ...e, verificationCode: undefined })); }}
              error={errors.verificationCode}
              keyboardType="number-pad"
              maxLength={8}
              returnKeyType="next"
            />
            <Text style={styles.helperText}>
              Didn't receive the code?{' '}
              <Text style={styles.helperLink} onPress={() => console.log('Resend code')}>
                Resend
              </Text>
            </Text>
          </View>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <View>
            <AppTextInput
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={(t) => { setNewPassword(t); setErrors(e => ({ ...e, newPassword: undefined })); }}
              error={errors.newPassword}
              secureTextEntry={!showPassword}
              returnKeyType="next"
              rightIcon={showPassword ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowPassword(v => !v)}
            />
            <AppTextInput
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setErrors(e => ({ ...e, confirmPassword: undefined })); }}
              error={errors.confirmPassword}
              secureTextEntry={!showConfirm}
              returnKeyType="done"
              onSubmitEditing={handleNext}
              rightIcon={showConfirm ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowConfirm(v => !v)}
            />
          </View>
        )}

        <PrimaryButton
          title={getButtonLabel()}
          onPress={handleNext}
          loading={loading}
          style={styles.submitBtn}
        />

        {/* Step Indicator Bubbles */}
        <View style={styles.stepBubbleContainer}>
          <View style={[styles.stepBubble, step >= 1 && styles.stepBubbleActive]}>
            <Text style={[styles.stepBubbleText, step >= 1 && styles.stepBubbleTextActive]}>1</Text>
          </View>
          <View style={[styles.stepBubbleLine, step >= 2 && styles.stepBubbleLineActive]} />
          <View style={[styles.stepBubble, step >= 2 && styles.stepBubbleActive]}>
            <Text style={[styles.stepBubbleText, step >= 2 && styles.stepBubbleTextActive]}>2</Text>
          </View>
          <View style={[styles.stepBubbleLine, step >= 3 && styles.stepBubbleLineActive]} />
          <View style={[styles.stepBubble, step >= 3 && styles.stepBubbleActive]}>
            <Text style={[styles.stepBubbleText, step >= 3 && styles.stepBubbleTextActive]}>3</Text>
          </View>
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
    marginTop: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
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
  submitBtn: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backLinkWrapper: {
    alignItems: 'center',
  },
  backLink: {
    fontSize: FontSize.sm,
    color: Colors.primaryGreen,
    fontWeight: '500',
  },
  successIconWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successHeading: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailHighlight: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  successSubtext: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    lineHeight: 16,
  },
  backBtn: {
    marginTop: Spacing.md,
  },
  helperText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  helperLink: {
    color: Colors.primaryGreen,
    fontWeight: '600',
  },
  stepBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  stepBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.greyBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.inputBorder,
  },
  stepBubbleActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  stepBubbleText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  stepBubbleTextActive: {
    color: Colors.white,
  },
  stepBubbleLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.inputBorder,
    marginHorizontal: Spacing.sm,
  },
  stepBubbleLineActive: {
    backgroundColor: Colors.primaryGreen,
  },
});
