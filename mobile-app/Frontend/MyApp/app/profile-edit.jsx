import React, { useState, useEffect, useContext } from 'react';
import { StatusBar as RNStatusBar } from 'react-native';
import { NotificationContext } from '@/context/NotificationContext';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// personal info is display-only, no text inputs needed
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

export default function ProfileEditScreen() {
  const router = useRouter();
  const { auth, setAuth } = useContext(NotificationContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [roleName, setRoleName] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [status, setStatus] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    contact_number: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [emailSupported, setEmailSupported] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleUpdateProfile = async () => {
    if (!editForm.first_name.trim() || !editForm.last_name.trim() || !editForm.username.trim()) {
      Alert.alert('Error', 'First name, last name, and username are required');
      return;
    }

    setIsUpdating(true);
    try {
      const url = `https://deployment-backend-repo-production.up.railway.app/api/superadmin/profile`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(editForm),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        data = { error: text };
      }

      if (response.ok) {
        const updatedUser = data.user;

        setFirstName(updatedUser.first_name);
        setLastName(updatedUser.last_name);
        setEmail(updatedUser.email || '');
        setUsername(updatedUser.username);
        setContactNumber(updatedUser.contact_number || '');
        setEmailSupported(updatedUser.hasOwnProperty('email'));

        setAuth(prev => ({
          token: prev.token,
          user: { ...prev.user, ...updatedUser }
        }));

        setIsEditModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
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
        console.log('Profile API response status:', res.status);
        if (res.ok) {
          const data = await res.json();
          console.log('Profile API response data:', data);
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setEmail(data.email || ''); // Email might not exist in database yet
          setUsername(data.username || '');
          setContactNumber(data.contact_number || '');
          // Check if email is supported (if it's returned in the response)
          setEmailSupported(data.hasOwnProperty('email'));
          // use role_name from API directly (joined in controller)
          setRoleName(data.role_name || '');
          setCreatedAt(data.created_at || '');
          setStatus(data.status || '');
          // optionally update context if missing details
          setAuth((prev) => ({ token: prev.token, user: { ...prev.user, ...data } }));
          // Initialize edit form
          setEditForm({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || '', // Email might not exist
            username: data.username || '',
            contact_number: data.contact_number || '',
          });
        } else {
          const authUser = auth.user || {};
          const errorData = await res.json().catch(() => ({}));
          console.log('Profile API error:', errorData);
          // fallback to whatever is in context
          setFirstName(authUser.first_name || authUser.full_name?.split(' ')[0] || '');
          setLastName(authUser.last_name || authUser.full_name?.split(' ').slice(1).join(' ') || '');
          setEmail(authUser.email || ''); // Email might not exist
          setUsername(authUser.username || '');
          setContactNumber(authUser.contact_number || '');
          setRoleName(authUser.role_name || '');
          setCreatedAt(authUser.created_at || '');
          setStatus(authUser.status || '');
          setEmailSupported(authUser.email != null);
          // Initialize edit form from context
          setEditForm({
            first_name: authUser.first_name || authUser.full_name?.split(' ')[0] || '',
            last_name: authUser.last_name || authUser.full_name?.split(' ').slice(1).join(' ') || '',
            email: authUser.email || '', // Email might not exist
            username: authUser.username || '',
            contact_number: authUser.contact_number || '',
          });
        }
      } catch (err) {
        console.error('Failed to load profile', err);
        const authUser = auth.user || {};
        setFirstName(authUser.first_name || authUser.full_name?.split(' ')[0] || '');
        setLastName(authUser.last_name || authUser.full_name?.split(' ').slice(1).join(' ') || '');
        setEmail(authUser.email || ''); // Email might not exist
        setUsername(authUser.username || '');
        setContactNumber(authUser.contact_number || '');
        setRoleName(authUser.role_name || '');
        setCreatedAt(authUser.created_at || '');
        setStatus(authUser.status || '');
        setEmailSupported(authUser.email != null);
        // Initialize edit form from context
        setEditForm({
          first_name: authUser.first_name || authUser.full_name?.split(' ')[0] || '',
          last_name: authUser.last_name || authUser.full_name?.split(' ').slice(1).join(' ') || '',
          email: authUser.email || '', // Email might not exist
          username: authUser.username || '',
          contact_number: authUser.contact_number || '',
        });
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>User Information</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditModalVisible(true)}
            >
              <Ionicons name="pencil" size={16} color={Colors.primaryGreen} />
              <Text style={styles.editButtonText}>Edit User Info</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || '-'}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{emailSupported ? (email || 'Not set') : 'Not supported'}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{username}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact Number</Text>
            <Text style={styles.infoValue}>{contactNumber || 'Not set'}</Text>
          </View>

        </View>

        {/* Account Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Created</Text>
              <Text style={styles.infoValue}>
                {createdAt ? (() => {
                  try {
                    const date = new Date(createdAt);
                    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
                  } catch {
                    return '-';
                  }
                })() : '-'}
              </Text>
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

      {/* Edit Personal Information Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Personal Information</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.first_name}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, first_name: text }))}
                  placeholder="Enter first name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.last_name}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, last_name: text }))}
                  placeholder="Enter last name"
                />
              </View>

              {emailSupported && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.email}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                    placeholder="Enter email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.username}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, username: text }))}
                  placeholder="Enter username"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.contact_number}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, contact_number: text }))}
                  placeholder="Enter contact number"
                  keyboardType="phone-pad"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
      

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, isUpdating && styles.disabledButton]}
                onPress={handleUpdateProfile}
                disabled={isUpdating}
              >
                <Text style={styles.saveButtonText}>
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 12,
    minHeight: 60 + (Platform.OS === 'android' ? RNStatusBar.currentHeight : 0),
    paddingBottom: 12,
    gap: 12,
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

  // Section Header with Edit Button
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryGreen + '10',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  editButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primaryGreen,
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalScroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    backgroundColor: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primaryGreen,
  },
  saveButtonText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
