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

export default function ForgotPasswordForm({
  onBack,
  onSubmit,
  loading = false,
}) {
  const [step, setStep] = useState(1); // 1: email, 2: verification code, 3: new password
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!email.trim()) e.email = 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email format';
    } else if (step === 2) {
      if (!verificationCode.trim()) e.verificationCode = 'Verification code is required';
      if (verificationCode.length < 6) e.verificationCode = 'Verification code must be 6 numbers';
    } else if (step === 3) {
      if (!newPassword) e.newPassword = 'New password is required';
      if (newPassword.length < 6) e.newPassword = 'Password must be at least 6 characters';
      if (!confirmPassword) e.confirmPassword = 'Please confirm your password';
      if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    return e;
  };

  const handleNext = () => {
    const e = validateStep();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    onSubmit({
      email: email.trim(),
      verificationCode: verificationCode.trim(),
      newPassword: newPassword,
    });
    setSubmitted(true);
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
              setEmail('');
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
        return 'Verify Code';
      case 3:
        return 'New Password';
      default:
        return 'Forgot Password?';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1:
        return 'Enter your email address';
      case 2:
        return 'Enter the verification code sent to your email';
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

        {/* Step 1: Email */}
        {step === 1 && (
          <AppTextInput
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={(t) => { setEmail(t); setErrors(e => ({ ...e, email: undefined })); }}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
          />
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <View>
            <AppTextInput
              label="Verification Code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChangeText={(t) => { setVerificationCode(t); setErrors(e => ({ ...e, verificationCode: undefined })); }}
              error={errors.verificationCode}
              keyboardType="number-pad"
              maxLength={6}
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
              secureTextEntry
              returnKeyType="next"
            />
            <AppTextInput
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setErrors(e => ({ ...e, confirmPassword: undefined })); }}
              error={errors.confirmPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleNext}
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
