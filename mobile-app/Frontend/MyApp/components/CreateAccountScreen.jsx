import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Alert, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FoodParadiseLogo from '@/components/FoodParadiselogo';
import CreateAccountForm from '@/components/CreateAccountForm';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';

export default function CreateAccountScreen({
  onAccountCreated,
  onBackToLogin,
  variant = 'dark',
}) {
  const [loading, setLoading] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [createdAccountData, setCreatedAccountData] = useState(null);

  const bg = variant === 'dark' ? Colors.greyBg : Colors.white;

  const handleCreateAccount = async (accountData) => {
    setLoading(true);
    try {
      // Call backend signup API — mobile-created accounts are Super Admin (role_id=3)
      const { fullName, username, password, role_id } = accountData;
      const resp = await fetch('https://deployment-backend-repo-production.up.railway.app/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, username, password, role_id })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || err.message || `Signup failed (status ${resp.status})`);
      }

      const body = await resp.json().catch(() => ({}));
      // Show success and display created account summary
      setCreatedAccountData({ fullName, username, role: role_id });
      setAccountCreated(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    setAccountCreated(false);
    setCreatedAccountData(null);
    if (onBackToLogin) {
      onBackToLogin();
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
        
        {accountCreated ? (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={60} color={Colors.primaryGreen} />
            <Text style={styles.successHeading}>Account Created!</Text>
            <Text style={styles.successMessage}>
              Your account has been successfully created.{'\n'}You can now log in with your credentials.
            </Text>
            <TouchableOpacity 
              style={styles.goToLoginBtn}
              onPress={handleGoToLogin}
            >
              <Text style={styles.goToLoginBtnText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CreateAccountForm
            onCreateAccount={handleCreateAccount}
            onBackToLogin={onBackToLogin}
            loading={loading}
          />
        )}
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
  successCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    marginHorizontal: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successHeading: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  goToLoginBtn: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  goToLoginBtnText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});
