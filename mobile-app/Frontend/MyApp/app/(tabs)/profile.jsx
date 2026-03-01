import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import FoodParadiseLogo from '@/components/FoodParadiselogo';
import { NotificationContext } from '@/context/NotificationContext';

// dynamic data will replace the hardcoded lists

export default function EmployeesScreen() {
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [branches, setBranches] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [branchModalVisible, setBranchModalVisible] = useState(false);

  const { auth } = useContext(NotificationContext);

  const fetchBranches = async () => {
    try {
      const res = await fetch('http://10.181.206.201:5200/api/sales-superadmin/branches', {
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
      let url = 'http://10.181.206.201:5200/api/superadmin/staff';
      if (branchId && branchId !== 'all') {
        url = `http://10.181.206.201:5200/api/superadmin/${branchId}/staff`;
      }
      const res = await fetch(url, {
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined,
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
  const router = useRouter();
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const { notifications, toggleNotificationRead, unreadCount, handleNotificationClick } = useContext(NotificationContext);

  const handleNotifications = () => {
    setNotificationsVisible(true);
  };

  const getIconColor = (type) => {
    const colorMap = {
      order: '#10b981',
      inventory: '#ef4444',
      message: '#f59e0b',
      system: '#06b6d4',
      payment: '#10b981',
    };
    return colorMap[type] || '#666';
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryGreen} />

      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <FoodParadiseLogo size="xsmall" showSubtitle={false} align="left" />
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleNotifications}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.notificationIconBadge}>
                <Text style={styles.notificationIconBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.pageTitle}>Employees</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Employees that would log in or office can{'\n'}be monitored here.
        </Text>

        {/* Branch selector dropdown button */}
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => setBranchModalVisible(true)}
        >
          <Text
            style={styles.dropdownTriggerText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {selectedBranch === 'all'
              ? 'All Branches'
              : branches.find((b) => b.branch_id === selectedBranch)?.branch_name ||
                'Select Branch'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={Colors.primaryGreen} />
        </TouchableOpacity>
        {/* branch chooser modal */}
        <Modal
          visible={branchModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setBranchModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                {/* All Branches option */}
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedBranch('all');
                    setBranchModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>All Branches</Text>
                </TouchableOpacity>
                {branches.map((b) => (
                  <TouchableOpacity
                    key={b.branch_id}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedBranch(b.branch_id);
                      setBranchModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{b.branch_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setBranchModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Users listing (active / deactivated) */}
        {loadingStaff && <ActivityIndicator size="small" color={Colors.primaryGreen} />}
        {staff.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Active Users</Text>
            {staff
              .filter((u) => u.status === 'Activate' || u.status === 1)
              .map((u) => (
                <View key={u.user_id} style={styles.employeeRow}>
                  <View style={styles.employeeInfo}>
                    <View
                      style={[styles.avatar, { backgroundColor: Colors.primaryGreen }]}
                    />
                    <Text style={styles.employeeName}>{u.name}</Text>
                  </View>
                  <Text style={styles.employeeRole}>{u.role_name}</Text>
                </View>
              ))}

            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Deactivated Users</Text>
            {staff
              .filter((u) => u.status === 'Deactivate' || u.status === 0)
              .map((u) => (
                <View key={u.user_id} style={styles.employeeRow}>
                  <View style={styles.employeeInfo}>
                    <View style={[styles.avatar, { backgroundColor: '#ccc' }]} />
                    <Text style={styles.employeeName}>{u.name}</Text>
                  </View>
                  <Text style={styles.employeeRole}>{u.role_name}</Text>
                </View>
              ))}
          </>
        )}
      </ScrollView>

      {/* Notifications Dropdown */}
      {notificationsVisible && (
        <View style={styles.notificationsDropdown}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownHeaderText}>Notifications</Text>
          </View>
          <ScrollView style={{ maxHeight: 280 }} scrollEnabled={true}>
            {notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.notificationDropdownItem,
                  !item.read && styles.notificationDropdownItemUnread,
                ]}
                onPress={() => handleNotificationClick(item, router)}
              >
                <View
                  style={[
                    styles.notificationIconSmall,
                    { backgroundColor: getIconColor(item.type) },
                  ]}
                >
                  <Ionicons name={item.icon} size={12} color="#fff" />
                </View>
                <View style={styles.notificationDropdownContent}>
                  <Text style={styles.notificationDropdownTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.notificationDropdownMessage} numberOfLines={1}>
                    {item.message}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {notifications.length > 0 && (
            <TouchableOpacity
              style={styles.dropdownFooter}
              onPress={() => setNotificationsVisible(false)}
            >
              <Text style={styles.dropdownFooterText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: Colors.primaryGreenDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 1,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 2,
    minHeight: 72,
  },
  logoWrap: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  branchSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownTriggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  branchTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  branchTabActive: {
    backgroundColor: Colors.primaryGreen,
  },
  branchTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  branchTabTextActive: {
    color: '#fff',
  },

  // branch modal styles
  modalOverlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseBtn: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Colors.primaryGreen,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 14,
  },
  // employee rows
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  employeeRole: {
    fontSize: 13,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  notificationsDropdown: {
    position: 'absolute',
    top: 50,
    right: 12,
    width: 320,
    maxHeight: 380,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 2000,
    overflow: 'hidden',
  },
  dropdownHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
  },
  dropdownHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  notificationDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  notificationDropdownItemUnread: {
    backgroundColor: '#f9fafb',
  },
  notificationIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  notificationDropdownContent: {
    flex: 1,
  },
  notificationDropdownTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  notificationDropdownMessage: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  dropdownFooter: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#f9fafb',
  },
  dropdownFooterText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primaryGreen,
  },
  notificationIconBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationIconBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});
