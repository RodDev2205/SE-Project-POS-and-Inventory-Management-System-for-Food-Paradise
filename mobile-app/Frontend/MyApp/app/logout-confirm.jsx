import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

export default function LogoutConfirmScreen() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleCancel = () => {
    router.back();
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Simulate logout process
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('User logged out successfully');
      
      // TODO: Clear user data/tokens here
      // TODO: Navigate to login screen
      router.push('/Login');
    } catch (err) {
      console.error('Logout error:', err);
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryGreen} />

      {/* Background overlay */}
      <View style={styles.overlay} />

      {/* Modal Card */}
      <View style={styles.modalCard}>
        {!isLoggingOut ? (
          <>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="log-out-outline" size={56} color={Colors.appleRed} />
            </View>

            {/* Text */}
            <Text style={styles.title}>Logout</Text>
            <Text style={styles.message}>Are you sure you want to log out?</Text>
            <Text style={styles.subtitle}>
              You will need to log in again to access your account.
            </Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCancel}
                disabled={isLoggingOut}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleConfirmLogout}
                disabled={isLoggingOut}
              >
                <Text style={styles.logoutBtnText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Loading State */}
            <ActivityIndicator
              size="large"
              color={Colors.primaryGreen}
              style={styles.spinner}
            />
            <Text style={styles.loadingText}>Logging out...</Text>
            <Text style={styles.loadingSubtext}>Please wait while we log you out</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  // Modal Card
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl + 8,
    marginHorizontal: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },

  // Icon
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffebee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },

  // Text
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },

  message: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },

  // Buttons
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
  },

  cancelBtn: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  cancelBtnText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  logoutBtn: {
    backgroundColor: Colors.appleRed,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },

  logoutBtnText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: '#fff',
  },

  // Loading State
  spinner: {
    marginBottom: Spacing.lg,
  },

  loadingText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },

  loadingSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
