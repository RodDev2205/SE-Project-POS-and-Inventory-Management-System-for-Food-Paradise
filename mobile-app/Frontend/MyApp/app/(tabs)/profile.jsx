import React, { useState, useContext, useEffect } from 'react';
import { StatusBar as RNStatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import FoodParadiseLogo from '@/components/FoodParadiselogo';
import EmployeeDetail from '@/components/EmployeeDetail';
import { NotificationContext } from '@/context/NotificationContext';

// dynamic data will replace the hardcoded lists

export default function EmployeesScreen() {
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [branches, setBranches] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [branchDropdownVisible, setBranchDropdownVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeUsersExpanded, setActiveUsersExpanded] = useState(true);
  const [deactivatedUsersExpanded, setDeactivatedUsersExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh staff list and reset modal states when this tab regains focus
  useFocusEffect(
    React.useCallback(() => {
      fetchStaff(selectedBranch);

      return () => {
        setNotificationsVisible(false);
        setShowSettingsMenu(false);
        setShowLogoutModal(false);
      };
    }, [selectedBranch])
  );

  const { auth, notifications, toggleNotificationRead, markAllAsRead, toggleAllReadUnread, unreadCount, handleNotificationClick, logout } = useContext(NotificationContext);
  const router = useRouter();

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

  const handleNotifications = () => {
    setShowSettingsMenu(false);
    setNotificationsVisible(!notificationsVisible);
  };

  const handleProfileEdit = () => {
    setShowSettingsMenu(false);
    router.push('/profile-edit');
  };

  const handleBugReports = () => {
    setShowSettingsMenu(false);
    router.push('/bug-reports');
  };

  const handleLogout = () => {
    setShowSettingsMenu(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await logout();
      setShowLogoutModal(false);
      router.replace('/Login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleStatusChange = (userId, newStatus) => {
    setStaff((prevStaff) =>
      prevStaff.map((employee) =>
        employee.user_id === userId ? { ...employee, status: newStatus } : employee
      )
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchBranches(),
        fetchStaff(selectedBranch)
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryGreen}
        translucent={Platform.OS === 'android'}
      />

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
          <View style={styles.settingsContainer}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setShowSettingsMenu(!showSettingsMenu)}
            >
              <Ionicons name="settings-outline" size={22} color="#fff" />
            </TouchableOpacity>
            {showSettingsMenu && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity style={styles.menuItem} onPress={handleProfileEdit}>
                  <Ionicons name="person-outline" size={18} color={Colors.textPrimary} />
                  <Text style={styles.menuText}>Super Admin</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={handleBugReports}>
                  <Ionicons name="bug-outline" size={18} color={Colors.textPrimary} />
                  <Text style={styles.menuText}>Bug Reports</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={18} color={Colors.appleRed} />
                  <Text style={[styles.menuText, { color: Colors.appleRed }]}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primaryGreen]}
            tintColor={Colors.primaryGreen}
          />
        }
      >
        {/* Title */}
        <Text style={styles.pageTitle}>Employees</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Employees that would log in or office can{'\n'}be monitored here.
        </Text>

        {/* Branch selector dropdown button */}
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={styles.timeRangeButton}
            onPress={() => setBranchDropdownVisible(!branchDropdownVisible)}
          >
            <Text
              style={styles.timeRangeButtonText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selectedBranch === 'all'
                ? 'All Branches'
                : branches.find((b) => b.branch_id === selectedBranch)?.branch_name ||
                  'Select Branch'}
            </Text>
            <Ionicons
              name={branchDropdownVisible ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.primaryGreen}
            />
          </TouchableOpacity>

          {branchDropdownVisible && (
            <View style={[styles.timeRangeDropdown, { maxHeight: 300 }]}>
              <ScrollView
                style={{ flexGrow: 0 }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {/* All Branches option */}
                <TouchableOpacity
                  style={[
                    styles.timeRangeOption,
                    selectedBranch === 'all' && styles.timeRangeOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedBranch('all');
                    setBranchDropdownVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeRangeOptionText,
                      selectedBranch === 'all' && styles.timeRangeOptionTextActive,
                    ]}
                  >
                    All Branches
                  </Text>
                  {selectedBranch === 'all' && (
                    <Ionicons name="checkmark" size={18} color={Colors.primaryGreen} />
                  )}
                </TouchableOpacity>
                {branches.map((b) => (
                  <TouchableOpacity
                    key={b.branch_id}
                    style={[
                      styles.timeRangeOption,
                      selectedBranch === b.branch_id && styles.timeRangeOptionActive,
                    ]}
                    onPress={() => {
                      setSelectedBranch(b.branch_id);
                      setBranchDropdownVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.timeRangeOptionText,
                        selectedBranch === b.branch_id && styles.timeRangeOptionTextActive,
                      ]}
                    >
                      {b.branch_name}
                    </Text>
                    {selectedBranch === b.branch_id && (
                      <Ionicons name="checkmark" size={18} color={Colors.primaryGreen} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Users listing (active / deactivated) */}
        {loadingStaff && <ActivityIndicator size="small" color={Colors.primaryGreen} />}

        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Active Users</Text>
        <TouchableOpacity
          style={styles.sectionToggleButton}
          onPress={() => setActiveUsersExpanded((prev) => !prev)}
        >
          <Text style={styles.sectionToggleText}>
            {activeUsersExpanded ? 'Hide' : 'Show'} Active Users
          </Text>
          <Ionicons
            name={activeUsersExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.primaryGreen}
          />
        </TouchableOpacity>
        {activeUsersExpanded && (
          <View style={styles.sectionBody}>
            {staff.filter((u) => u.status === 'Activate' || u.status === 1).length === 0 ? (
              <Text style={styles.noUserText}>No user yet</Text>
            ) : (
              staff
                .filter((u) => u.status === 'Activate' || u.status === 1)
                .map((u) => {
                  const userName = u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.name;
                  return (
                    <TouchableOpacity
                      key={u.user_id}
                      style={styles.employeeRow}
                      onPress={() => router.push(`/employee/${u.user_id}`)}
                    >
                      <View style={styles.employeeInfo}>
                        <View style={[styles.avatar, { backgroundColor: Colors.primaryGreen }]}>
                          <Text style={styles.avatarText}>
                            {(u.first_name || u.name || 'U').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.employeeName}>{userName}</Text>
                          <Text style={styles.employeeRole}>{u.role_name}</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={Colors.primaryGreen} />
                    </TouchableOpacity>
                  );
                })
            )}
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Deactivated Users</Text>
        <TouchableOpacity
          style={styles.sectionToggleButton}
          onPress={() => setDeactivatedUsersExpanded((prev) => !prev)}
        >
          <Text style={styles.sectionToggleText}>
            {deactivatedUsersExpanded ? 'Hide' : 'Show'} Deactivated Users
          </Text>
          <Ionicons
            name={deactivatedUsersExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.primaryGreen}
          />
        </TouchableOpacity>
        {deactivatedUsersExpanded && (
          <View style={styles.sectionBody}>
            {staff.filter((u) => u.status === 'Deactivate' || u.status === 0).length === 0 ? (
              <Text style={styles.noUserText}>No user yet</Text>
            ) : (
              staff
                .filter((u) => u.status === 'Deactivate' || u.status === 0)
                .map((u) => {
                  const userName = u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.name;
                  return (
                    <TouchableOpacity
                      key={u.user_id}
                      style={styles.employeeRow}
                      onPress={() => router.push(`/employee/${u.user_id}`)}
                    >
                      <View style={styles.employeeInfo}>
                        <View style={[styles.avatar, { backgroundColor: '#ccc' }]}>
                          <Text style={styles.avatarText}>
                            {(u.first_name || u.name || 'U').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.employeeName}>{userName}</Text>
                          <Text style={styles.employeeRole}>{u.role_name}</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={Colors.primaryGreen} />
                    </TouchableOpacity>
                  );
                })
            )}
          </View>
        )}
      </ScrollView>

      {/* Notifications Dropdown */}
      {notificationsVisible && (
        <View style={styles.notificationsDropdown}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownHeaderText}>Notifications</Text>
            {notifications.length > 0 && (
              <TouchableOpacity
                style={styles.readAllButton}
                onPress={toggleAllReadUnread}
              >
                <Text style={styles.readAllButtonText}>
                  {unreadCount > 0 ? 'Read All' : 'Unread All'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView style={{ maxHeight: 280 }} scrollEnabled={true}>
            {notifications.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <Text style={{ color: '#666', textAlign: 'center' }}>
                  No low or out of stock
                </Text>
              </View>
            ) : (
              notifications.map((item) => (
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
              ))
            )}
          </ScrollView>
          <TouchableOpacity
            style={styles.dropdownFooter}
            onPress={() => setNotificationsVisible(false)}
          >
            <Text style={styles.dropdownFooterText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelLogout}
      >
        <View style={styles.logoutOverlay}>
          <View style={styles.logoutModalCard}>
            {!isLoggingOut ? (
              <>
                <View style={styles.logoutIconContainer}>
                  <Ionicons name="log-out-outline" size={56} color={Colors.appleRed} />
                </View>

                <Text style={styles.logoutTitle}>Logout</Text>
                <Text style={styles.logoutMessage}>Are you sure you want to log out?</Text>
                <Text style={styles.logoutSubtitle}>
                  You will need to log in again to access your account.
                </Text>

                <View style={styles.logoutButtonContainer}>
                  <TouchableOpacity
                    style={styles.logoutConfirmBtn}
                    onPress={handleConfirmLogout}
                    disabled={isLoggingOut}
                  >
                    <Text style={styles.logoutConfirmBtnText}>Yes, Logout</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.logoutCancelBtn}
                    onPress={handleCancelLogout}
                    disabled={isLoggingOut}
                  >
                    <Text style={styles.logoutCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <ActivityIndicator
                  size="large"
                  color={Colors.primaryGreen}
                  style={styles.logoutSpinner}
                />
                <Text style={styles.logoutLoadingText}>Logging out...</Text>
                <Text style={styles.logoutLoadingSubtext}>Please wait while we log you out</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 12,
    paddingBottom: 7,
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
  timeRangeContainer: {
    marginBottom: 16,
    zIndex: 10,
  },
  timeRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timeRangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryGreen,
  },
  timeRangeDropdown: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  timeRangeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeRangeOptionActive: {
    backgroundColor: Colors.primaryGreen + '15',
  },
  timeRangeOptionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  timeRangeOptionTextActive: {
    fontWeight: '600',
    color: Colors.primaryGreen,
  },
  // employee rows
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
  employeeRowToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  employeeDetailsPanel: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  employeeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  employeeDetailLabel: {
    fontSize: 12,
    color: '#555',
    textTransform: 'capitalize',
    flex: 1,
  },
  employeeDetailValue: {
    fontSize: 12,
    color: '#111',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  sectionToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryGreen,
  },
  sectionBody: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    paddingVertical: 8,
  },
  noUserText: {
    padding: 16,
    color: '#666',
    textAlign: 'center',
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
  settingsContainer: {
    position: 'relative',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 48,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  logoutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    width: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },
  logoutIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoutTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  logoutMessage: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  logoutSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 15,
  },
  logoutButtonContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  logoutCancelBtn: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  logoutCancelBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  logoutConfirmBtn: {
    backgroundColor: Colors.appleRed,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  logoutConfirmBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: '#fff',
  },
  logoutSpinner: {
    marginBottom: Spacing.md,
  },
  logoutLoadingText: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  logoutLoadingSubtext: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  readAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.primaryGreen,
    borderRadius: 4,
  },
  readAllButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
