import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import { NotificationContext } from '@/context/NotificationContext';

const API_BASE = 'https://deployment-backend-repo-production.up.railway.app';

export default function ProfileScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [role, setRole] = useState('Super Admin');
  const [createdAt, setCreatedAt] = useState('');
  const [status, setStatus] = useState('');

  // branch/staff management
  const { auth, setAuth } = useContext(NotificationContext);

  // load profile details from server (fallback to context)
  useEffect(() => {
    if (!auth?.token) return;
    const load = async () => {
      try {
        const res = await fetch(
          `https://deployment-backend-repo-production.up.railway.app/api/users/user/me`,
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setUsername(data.username || '');
          setContactNumber(data.contact_number || '');
          setRole(data.role_name || '');
          setCreatedAt(data.created_at || '');
          setStatus(data.status || '');
          // keep context in sync
          setAuth((prev) => ({
            token: prev.token,
            user: { ...prev.user, ...data, role_name: data.role_name || prev.user?.role_name }
          }));
        } else {
          setFirstName(auth.user.first_name || '');
          setLastName(auth.user.last_name || '');
          setUsername(auth.user.username || '');
          setContactNumber(auth.user.contact_number || '');
          setRole(auth.user.role_name || auth.user.role || '');
          setCreatedAt(auth.user.created_at || '');
          setStatus(auth.user.status || '');
        }
      } catch (err) {
        console.error('Failed to load profile', err);
        setFirstName(auth.user.first_name || '');
        setLastName(auth.user.last_name || '');
        setUsername(auth.user.username || '');
        setContactNumber(auth.user.contact_number || '');
        setRole(auth.user.role_name || auth.user.role || '');
      }
    };
    load();
  }, [auth]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleEditPress = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    // send update request
    try {
      const body = {
        first_name: firstName,
        last_name: lastName,
        username,
        contact_number: contactNumber,
        branch_id: auth.user.branch_id || null,
      };
      const res = await fetch(`${API_BASE}/api/users/${auth.user.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Update failed');
      }
      const data = await res.json();
      Alert.alert('Success', 'Profile updated successfully');
      // update context and fields
      setAuth((prev) => ({
        token: prev.token,
        user: { ...prev.user, ...data.user, first_name: firstName, last_name: lastName, contact_number: contactNumber, username }
      }));
      setIsEditing(false);
    } catch (err) {
      console.error('update profile error', err);
      Alert.alert('Error', err.message);
    }
  };

  // ---------- branches & staff network ----------
  const fetchBranches = async () => {
    try {
      const res = await fetch('https://deployment-backend-repo-production.up.railway.app/api/sales-superadmin/branches', {
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to fetch branches');
      const data = await res.json();
      setBranches(data || []);
    } catch (err) {
      console.error('Failed to load branches', err);
    }
  };

  const fetchStaff = async (branchId) => {
    setLoadingStaff(true);
    try {
      let url = 'https://deployment-backend-repo-production.up.railway.app/api/superadmin/staff';
      if (branchId && branchId !== 'all') {
        url = `https://deployment-backend-repo-production.up.railway.app/api/superadmin/${branchId}/staff`;
      }
      const res = await fetch(url, {
        headers: auth.token
          ? { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' }
          : { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch staff');
      const data = await res.json();
      setStaff(data.staff || []);
    } catch (err) {
      console.error('Error loading staff:', err);
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchStaff(selectedBranch);
  }, [selectedBranch]);

  return (
    <View style={[styles.root, { backgroundColor: Colors.greyBg }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryGreen} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={Colors.primaryGreen} />
            </View>
          </View>

          {/* User Info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>First Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              ) : (
                <Text style={styles.value}>{firstName}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>Last Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                />
              ) : (
                <Text style={styles.value}>{lastName}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>Username</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                />
              ) : (
                <Text style={styles.value}>{username}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>Contact Number</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.value}>{contactNumber || '-'}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{role}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>Account Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: status === 'Activate' || status === 1 ? '#e0f2e0' : '#fde0e0' }] }>
                <Ionicons name={status === 'Activate' || status === 1 ? "checkmark-circle" : "close-circle"} size={14} color={status === 'Activate' || status === 1 ? Colors.primaryGreen : '#d9534f'} />
                <Text style={[styles.statusText, { color: status === 'Activate' || status === 1 ? Colors.primaryGreen : '#d9534f' }]}>{status === 'Activate' || status === 1 ? 'Active' : 'Inactive'}</Text>
              </View>
            </View>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={[styles.editBtn, isEditing && styles.editBtnActive]}
            onPress={isEditing ? handleSaveChanges : handleEditPress}
          >
            {isEditing ? (
              <>
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.editBtnText}>Save Changes</Text>
              </>
            ) : (
              <>
                <Ionicons name="pencil" size={18} color="#fff" />
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.primaryGreen} />
            <Text style={styles.settingText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={20} color={Colors.primaryGreen} />
            <Text style={styles.settingText}>Notification Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="shield-outline" size={20} color={Colors.primaryGreen} />
            <Text style={styles.settingText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Account Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoBox}>
            <View style={styles.infoBoxRow}>
              <Text style={styles.infoBoxLabel}>Member Since</Text>
              <Text style={styles.infoBoxValue}>{createdAt ? new Date(createdAt).toLocaleString() : '-'}</Text>
            </View>
            <View style={styles.infoBoxRow}>
              <Text style={styles.infoBoxLabel}>Last Login</Text>
              <Text style={styles.infoBoxValue}>Today at 9:30 AM</Text>
            </View>
            <View style={styles.infoBoxRow}>
              <Text style={styles.infoBoxLabel}>Login Attempts</Text>
              <Text style={styles.infoBoxValue}>2 from this device</Text>
            </View>
          </View>
        </View>

        {/* Employee Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employees</Text>

          {/* branch filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.branchScroll}>
            <TouchableOpacity
              onPress={() => setSelectedBranch('all')}
              style={[
                styles.branchBtn,
                selectedBranch === 'all' && styles.branchBtnSelected,
              ]}
            >
              <Text
                style={[
                  styles.branchBtnText,
                  selectedBranch === 'all' && styles.branchBtnTextSelected,
                ]}
              >
                All Branches
              </Text>
            </TouchableOpacity>
            {branches.map((b) => (
              <TouchableOpacity
                key={b.branch_id}
                onPress={() => setSelectedBranch(b.branch_id)}
                style={[
                  styles.branchBtn,
                  selectedBranch === b.branch_id && styles.branchBtnSelected,
                ]}
              >
                <Text
                  style={[
                    styles.branchBtnText,
                    selectedBranch === b.branch_id && styles.branchBtnTextSelected,
                  ]}
                >
                  {b.branch_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loadingStaff && <ActivityIndicator size="small" color={Colors.primaryGreen} />}

          {/* split active / deactivated */}
          {staff.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Active Users</Text>
              {staff
                .filter((u) => u.status === 'Activate' || u.status === 1)
                .map((u) => (
                  <View key={u.user_id} style={styles.employeeRow}>
                    <View style={styles.employeeAvatar}>
                      <Text style={styles.employeeAvatarText}>{u.name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: Spacing.md }}>
                      <Text style={styles.value}>{u.name}</Text>
                      <Text style={styles.label}>{u.role_name}</Text>
                    </View>
                  </View>
                ))}

              <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Deactivated Users</Text>
              {staff
                .filter((u) => u.status === 'Deactivate' || u.status === 0)
                .map((u) => (
                  <View key={u.user_id} style={styles.employeeRow}>
                    <View style={styles.employeeAvatarInactive}>
                      <Text style={styles.employeeAvatarText}>{u.name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: Spacing.md }}>
                      <Text style={styles.value}>{u.name}</Text>
                      <Text style={styles.label}>{u.role_name}</Text>
                    </View>
                  </View>
                ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.greyBg,
  },

  // Header
  header: {
    backgroundColor: Colors.primaryGreen,
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

  // Profile Card
  profileCard: {
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

  // Avatar
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primaryGreen,
  },

  // Info Container
  infoContainer: {
    marginBottom: Spacing.lg,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  infoRow: {
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
  },

  // Role Badge
  roleBadge: {
    backgroundColor: '#e0f2e0',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  roleText: {
    fontSize: FontSize.sm,
    color: Colors.primaryGreen,
    fontWeight: '600',
  },

  // Status Badge
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

  // Edit Button
  editBtn: {
    backgroundColor: Colors.primaryGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  editBtnActive: {
    backgroundColor: Colors.primaryGreen,
  },
  editBtnText: {
    color: '#fff',
    fontSize: FontSize.base,
    fontWeight: '600',
  },

  // Section
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  // Setting Item
  settingItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  settingText: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: '500',
  },

  // Info Box
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  infoBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoBoxLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoBoxValue: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '600',
  },

  // branch filters
  branchScroll: {
    marginVertical: Spacing.sm,
  },
  branchBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: '#f0f0f0',
    borderRadius: Radius.md,
    marginRight: Spacing.sm,
  },
  branchBtnSelected: {
    backgroundColor: Colors.primaryGreen,
  },
  branchBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
  },
  branchBtnTextSelected: {
    color: '#fff',
  },

  // employee rows
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  employeeAvatarInactive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  employeeAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSize.base,
  },
});
