import React, { useState, useContext, useEffect, useRef } from 'react';
import { StatusBar as RNStatusBar } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import FoodParadiseLogo from '@/components/FoodParadiselogo';
import { NotificationContext } from '@/context/NotificationContext';
import { io as ioclient } from 'socket.io-client';


export default function InventoryStatusScreen() {
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchDropdownVisible, setBranchDropdownVisible] = useState(false);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [otherItems, setOtherItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Reset modal states when tab loses focus
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // This runs when the screen loses focus
        setNotificationsVisible(false);
        setShowSettingsMenu(false);
        setShowLogoutModal(false);
      };
    }, [])
  );

  const socketRef = useRef(null);
  const selectedBranchRef = useRef(null);
  const { notifications, toggleNotificationRead, markAllAsRead, toggleAllReadUnread, unreadCount, auth, addNotification, handleNotificationClick, logout } = useContext(NotificationContext);

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
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
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

  // Fetch branches (superadmin view)
  const fetchBranches = async () => {
    if (!auth?.token) return;
    try {
      const res = await fetch('https://deployment-backend-repo-production.up.railway.app/api/sales-superadmin/branches', {
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to fetch branches');
      const data = await res.json();
      setBranches(data || []);

      // auto-select branch named "Main" if present, otherwise first branch
      const main = (data || []).find((b) => b.branch_name && b.branch_name.toLowerCase() === 'main');
      const defaultBranch = main ? main.branch_id : (data && data[0] ? data[0].branch_id : null);
      setSelectedBranch(defaultBranch);
    } catch (err) {
      console.error('Failed to load branches', err);
    }
  };

  const fetchInventoryForBranch = async (branchId) => {
    if (!auth?.token) return;
    setLoading(true);
    try {
      let items = [];
      // superadmin can fetch all and we filter by branch
      if (auth?.user?.role_id === 3) {
        const res = await fetch('https://deployment-backend-repo-production.up.railway.app/api/inventory/all-inventory', {
          headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined,
        });
        if (!res.ok) throw new Error('Failed to fetch inventory');
        const data = await res.json();
        items = (data || []).filter((i) => String(i.branch_id) === String(branchId));
      } else {
        // admin: backend will return their branch based on token
        const res = await fetch('https://deployment-backend-repo-production.up.railway.app/api/inventory/get-ingredients', {
          headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined,
        });
        if (!res.ok) throw new Error('Failed to fetch inventory');
        items = await res.json();
      }

      // categorize inventory
      const out = items.filter((it) => Number(it.quantity || 0) === 0);
      const low = items.filter(
        (it) => Number(it.quantity || 0) > 0 && Number(it.quantity || 0) <= Number(it.low_stock_threshold || 0)
      );
      const others = items.filter(
        (it) => Number(it.quantity || 0) > 0 && Number(it.quantity || 0) > Number(it.low_stock_threshold || 0)
      );
      setOutOfStockItems(out);
      setLowStockItems(low);
      setOtherItems(others);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // initialize branches and socket
  useEffect(() => {
    fetchBranches();

    if (!auth?.token) return;
    // connect socket
      const socket = ioclient('https://deployment-backend-repo-production.up.railway.app', {
      auth: { token: auth.token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Inventory socket connected');
    });

    socket.on('dashboardUpdate', (payload) => {
      if (!payload) return;
      const current = selectedBranchRef.current;
      if (current && String(payload.branch_id) === String(current)) {
        fetchInventoryForBranch(current);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [auth?.token]);

  // join branch room and fetch inventory when selectedBranch changes
  useEffect(() => {
    if (!selectedBranch) return;
    selectedBranchRef.current = selectedBranch;
    fetchInventoryForBranch(selectedBranch);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('joinBranchRoom', { branch_id: selectedBranch });
    }
  }, [selectedBranch]);

  // whenever low-stock list changes, add new notifications for items not already notified
  useEffect(() => {
    if (!lowStockItems || lowStockItems.length === 0) return;
    lowStockItems.forEach((item) => {
      const already = notifications.some(
        (n) => n.type === 'inventory' && n.data?.inventory_id === item.inventory_id && !n.read
      );
      if (!already) {
        const title = item.quantity <= 0 ? 'No stock' : 'Low stock';
        addNotification({
          title: `${title}: ${item.item_name}`,
          message: `Qty: ${item.quantity}`,
          time: new Date().toLocaleTimeString(),
          icon: 'warning',
          type: 'inventory',
          target: 'inventory',
          data: { inventory_id: item.inventory_id },
        });
      }
    });
  }, [lowStockItems]);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchBranches(),
        selectedBranch ? fetchInventoryForBranch(selectedBranch) : Promise.resolve()
      ]);
    } catch (error) {
      console.error('Error refreshing inventory data:', error);
    } finally {
      setRefreshing(false);
    }
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
        <Text style={styles.pageTitle}>Inventory Status</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Inventory status such as item stocks can be{'\n'}monitored here:
        </Text>

        {/* Branch selector dropdown */}
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={styles.timeRangeButton}
            onPress={() => setBranchDropdownVisible(!branchDropdownVisible)}
          >
            <Text style={styles.timeRangeButtonText} numberOfLines={1} ellipsizeMode="tail">
              {branches.find((b) => String(b.branch_id) === String(selectedBranch))?.branch_name || 'Select Branch'}
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

        {/* Out‑of‑Stock Items section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircleRed}>
              <Ionicons name="close-circle" size={16} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Out of Stock Items</Text>
          </View>

          {loading ? (
            <Text style={{ color: '#666' }}>Loading...</Text>
          ) : outOfStockItems.length === 0 ? (
            <Text style={{ color: '#666' }}>No out‑of‑stock items</Text>
          ) : (
            outOfStockItems.map((item) => (
              <View key={item.inventory_id} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                <Text style={styles.itemStatus}>Qty: {item.quantity}</Text>
              </View>
            ))
          )}
        </View>

        {/* Low Stock Items section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircleRed}>
              <Ionicons name="alert-circle" size={16} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Low Stock Items</Text>
          </View>

          {loading ? (
            <Text style={{ color: '#666' }}>Loading...</Text>
          ) : lowStockItems.length === 0 ? (
            <Text style={{ color: '#666' }}>No low stock items</Text>
          ) : (
            lowStockItems.map((item) => (
              <View key={item.inventory_id} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                <Text style={styles.itemStatus}>Qty: {item.quantity}</Text>
              </View>
            ))
          )}

          <Text style={styles.infoText}>
            These are the items that are running low on supply. Inform employees to restock and update stock!
          </Text>

          <TouchableOpacity 
            style={styles.linkRow}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <Text style={styles.linkText}>Broadcast to Messages </Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primaryGreen} />
          </TouchableOpacity>
        </View>

        {/* Other Items section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircleGreen}>
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Other Inventory Items</Text>
          </View>

          {loading ? (
            <Text style={{ color: '#666' }}>Loading...</Text>
          ) : otherItems.length === 0 ? (
            <Text style={{ color: '#666' }}>No items</Text>
          ) : (
            otherItems.map((item) => (
              <View key={item.inventory_id} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                <Text style={styles.itemStatus}>Qty: {item.quantity}</Text>
              </View>
            ))
          )}
        </View>
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
    gap: 8,
  },
  iconCircleRed: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleGreen: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 13,
    color: '#333',
  },
  itemStatus: {
    fontSize: 13,
    color: '#888',
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    marginTop: 10,
    lineHeight: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    fontSize: 13,
    color: Colors.primaryGreen,
    fontWeight: '500',
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
