import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppTextInput from '@/components/AppText';
import PrimaryButton from '@/components/Button';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

export default function ProfileEditScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('Super Admin');
  const [email, setEmail] = useState('superadmin@example.com');
  const [phoneNumber, setPhoneNumber] = useState('+63 912 345 6789');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email format';
    if (!phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
    return e;
  };

  const handleSaveChanges = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with your real API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log('Profile update request:', {
        fullName,
        email,
        phoneNumber,
      });
      
      Alert.alert('Success', 'Profile updated successfully!');
      handleGoBack();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: '#fff' }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryGreen} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={Colors.primaryGreen} />
          </View>
          <TouchableOpacity style={styles.changeAvatarBtn}>
            <Ionicons name="camera" size={16} color="#fff" />
            <Text style={styles.changeAvatarText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <AppTextInput
            label="Full Name"
            placeholder="Enter full name"
            value={fullName}
            onChangeText={(t) => {
              setFullName(t);
              setErrors(e => ({ ...e, fullName: undefined }));
            }}
            error={errors.fullName}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <AppTextInput
            label="Email Address"
            placeholder="Enter email address"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setErrors(e => ({ ...e, email: undefined }));
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />

          <AppTextInput
            label="Phone Number"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChangeText={(t) => {
              setPhoneNumber(t);
              setErrors(e => ({ ...e, phoneNumber: undefined }));
            }}
            error={errors.phoneNumber}
            keyboardType="phone-pad"
            returnKeyType="done"
          />

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title="Save Changes"
              onPress={handleSaveChanges}
              loading={loading}
              style={styles.saveBtn}
            />
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleGoBack}
              disabled={loading}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Created</Text>
              <Text style={styles.infoValue}>January 15, 2024</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Type</Text>
              <Text style={styles.infoValue}>Super Admin</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.primaryGreen} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Header
  header: {
    backgroundColor: Colors.primaryGreenDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: Spacing.lg + 4,
  },
  backBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primaryGreen,
    marginBottom: Spacing.md,
  },
  changeAvatarBtn: {
    backgroundColor: Colors.primaryGreen,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  changeAvatarText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Section Title
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },

  // Button Container
  buttonContainer: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  saveBtn: {
    marginTop: Spacing.md,
  },
  cancelBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Info Section
  infoSection: {
    marginBottom: Spacing.xl,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  infoLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#e0f2e0',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  statusText: {
    fontSize: FontSize.sm,
    color: Colors.primaryGreen,
    fontWeight: '600',
  },
});
