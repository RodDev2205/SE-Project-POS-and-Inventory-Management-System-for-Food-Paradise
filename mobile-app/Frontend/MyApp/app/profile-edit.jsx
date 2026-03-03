import React, { useState, useEffect, useContext } from 'react';
import { NotificationContext } from '@/context/NotificationContext';
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
// personal info is display-only, no text inputs needed
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

export default function ProfileEditScreen() {
  const router = useRouter();
  const { auth, setAuth } = useContext(NotificationContext);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [roleName, setRoleName] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [status, setStatus] = useState('');

  const handleGoBack = () => {
    router.back();
  };

  // load profile from context when screen mounts
  useEffect(() => {
    const load = async () => {
      if (!auth?.token) {
        return; // nothing to load yet
      }

      const url = `https://deployment-backend-repo-production.up.railway.app/api/users/user/me`;
      try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${auth.token}` } });
        if (res.ok) {
          const data = await res.json();
          setFullName(data.full_name || '');
          setUsername(data.username || '');
          // use role_name from API directly (joined in controller)
          setRoleName(data.role_name || '');
          setCreatedAt(data.created_at || '');
          setStatus(data.status || '');
          // optionally update context if missing details
          setAuth((prev) => ({ token: prev.token, user: { ...prev.user, ...data } }));
        } else {
          // fallback to whatever is in context
          setFullName(auth.user.full_name || '');
          setUsername(auth.user.username || '');
          setRoleName(auth.user.role_name || '');
          setCreatedAt(auth.user.created_at || '');
          setStatus(auth.user.status || '');
        }
      } catch (err) {
        console.error('Failed to load profile', err);
        setFullName(auth.user.full_name || '');
        setUsername(auth.user.username || '');
        setRoleName(auth.user.role_name || '');
        setCreatedAt(auth.user.created_at || '');
        setStatus(auth.user.status || '');
      }
    };
    load();
  }, [auth, setAuth]);

  // editing disabled: personal info is shown in text only

  return (
    <View style={[styles.root, { backgroundColor: '#fff' }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryGreen} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
          {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{fullName}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{username}</Text>
          </View>

        </View>

        {/* Account Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Created</Text>
              <Text style={styles.infoValue}>{createdAt ? new Date(createdAt).toLocaleDateString() : '-'}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{roleName || 'Super Admin'}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <View style={[styles.statusBadge, {backgroundColor: status === 'Activate' || status === 1 ? '#e0f2e0' : '#fde0e0'}]}>
                <Ionicons name={status === 'Activate' || status === 1 ? "checkmark-circle" : "close-circle"} size={14} color={status === 'Activate' || status === 1 ? Colors.primaryGreen : '#d9534f'} />
                <Text style={[styles.statusText, {color: status === 'Activate' || status === 1 ? Colors.primaryGreen : '#d9534f'}]}>{status === 'Activate' || status === 1 ? 'Activated' : 'Deactivated'}</Text>
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
