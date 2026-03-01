import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import FoodParadiseLogo from '@/components/FoodParadiselogo';
import StatCard from '@/components/Dashboard/StatCard';
import BarChart from '@/components/Dashboard/BarChart';
import { NotificationContext } from '@/context/NotificationContext';

const { width } = Dimensions.get('window');
const API_BASE = 'http://10.181.206.201:5200';

// dummy weekly sales data used in demo charts (can be replaced with real data later)
const BRANCH1_DATA = [
  { day: 'M', value: 60 },
  { day: 'T', value: 80 },
  { day: 'W', value: 55 },
  { day: 'T', value: 90 },
  { day: 'F', value: 75 },
  { day: 'S', value: 95 },
  { day: 'S', value: 70 },
];

const BRANCH2_DATA = [
  { day: 'M', value: 40 },
  { day: 'T', value: 65 },
  { day: 'W', value: 50 },
  { day: 'T', value: 70 },
  { day: 'F', value: 60 },
  { day: 'S', value: 80 },
  { day: 'S', value: 55 },
];

export default function DashboardScreen() {
  const router = useRouter();
  const socketRef = useRef(null);

  const {
    notifications,
    toggleNotificationRead,
    unreadCount,
    auth,
  } = useContext(NotificationContext);

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const [totalSales, setTotalSales] = useState(null);
  const [transactionCounts, setTransactionCounts] = useState({
    completed_count: 0,
    partial_refunded_count: 0,
    refunded_count: 0,
    voided_count: 0,
  });
  const [lowStockCount, setLowStockCount] = useState(null);
  const [activeEmployees, setActiveEmployees] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ================================
  // FETCH DASHBOARD STATS
  // ================================
  const fetchDashboardStats = async () => {
    if (!auth?.token) return;

    console.log('fetchDashboardStats called for', auth.user);
    try {
      setStatsLoading(true);

      const headers = {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
      };

      const [salesResp, lowStockResp, empResp] = await Promise.all([
        fetch(`${API_BASE}/api/sales-admin/today-sales`, { headers }),
        fetch(`${API_BASE}/api/inventory/low-stock-count`, { headers }),
        fetch(`${API_BASE}/api/users/active-count`, { headers }),
      ]);

      console.log('dashboard stats responses', salesResp.status, lowStockResp.status, empResp.status);

      if (salesResp.ok) {
        const salesData = await salesResp.json();
        console.log('salesData', salesData);
        setTotalSales(salesData.total_sales ?? 0);
        setTransactionCounts({
          completed_count: salesData.completed_count ?? 0,
          partial_refunded_count: salesData.partial_refunded_count ?? 0,
          refunded_count: salesData.refunded_count ?? 0,
          voided_count: salesData.voided_count ?? 0,
        });
      } else {
        console.warn('salesResp not ok', salesResp.status);
      }

      if (lowStockResp.ok) {
        const { count } = await lowStockResp.json();
        console.log('lowStock count', count);
        setLowStockCount(count ?? 0);
      } else {
        console.warn('lowStockResp not ok', lowStockResp.status);
      }

      if (empResp.ok) {
        const { count } = await empResp.json();
        console.log('active emp count', count);
        setActiveEmployees(count ?? 0);
      } else {
        console.warn('empResp not ok', empResp.status);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // ================================
  // SOCKET INITIALIZATION
  // ================================
  useEffect(() => {
    const branchId = auth?.user?.branch_id;
    // token is required; branch only required for non-superadmins (role 2 = admin)
    if (!auth?.token) return;
    if (auth.user?.role_id === 2 && !branchId) return;

    fetchDashboardStats();

    socketRef.current = io(API_BASE, {
      auth: { token: auth.token },
      transports: ['websocket'], // more stable on mobile
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Dashboard socket connected:', socketRef.current.id);

      if (branchId) {
        socketRef.current.emit('joinBranchRoom', {
          branch_id: Number(branchId),
        });
      }
    });

    socketRef.current.on('dashboardUpdate', () => {
      console.log('📡 Dashboard update received');
      fetchDashboardStats();
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    socketRef.current.on('connect_error', (err) => {
      console.log('⚠️ Socket connection error:', err.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [auth?.token, auth?.user?.branch_id, auth?.user?.role_id]);

  // ================================
  // HANDLERS
  // ================================
  const handleProfileEdit = () => {
    setShowSettingsMenu(false);
    router.push('/profile-edit');
  };

  const handleBugReports = () => {
    setShowSettingsMenu(false);
    router.push('/bug-reports');
  };

  const handleViewBranchPerformance = () => {
    setShowSettingsMenu(false);
    router.push('activity');
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      setShowLogoutModal(false);
      router.replace('/Login'); // better than push
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
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

  const handleLogout = () => {
    setShowSettingsMenu(false);
    setShowLogoutModal(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };


  const handleNotifications = () => {
    setShowSettingsMenu(false);
    setNotificationsVisible(!notificationsVisible);
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
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleProfileEdit}
                >
                  <Ionicons name="person-outline" size={18} color={Colors.textPrimary} />
                  <Text style={styles.menuText}>Super Admin</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleBugReports}
                >
                  <Ionicons name="bug-outline" size={18} color={Colors.textPrimary} />
                  <Text style={styles.menuText}>Bug Reports</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={18} color={Colors.appleRed} />
                  <Text style={[styles.menuText, { color: Colors.appleRed }]}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── Scrollable body ────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard title */}
        <Text style={styles.pageTitle}>Dashboard</Text>

        {/* Greeting */}
        <Text style={styles.greeting}>Good Day,</Text>
        <Text style={styles.date}>Friday, October 31, 2025</Text>

        {/* ── Stat cards 2x2 ─────────────────────────────────── */}
        <View style={styles.cardsGrid}>
          <StatCard
            label="Total Sales today"
            value={
              statsLoading
                ? 'Loading...'
                : totalSales != null
                ? `₱ ${totalSales.toLocaleString()}`
                : 'N/A'
            }
            dotColor="#22c55e"
            bg="#dcfce7"
          />
          <StatCard
            label="Transactions"
            value={
              statsLoading
                ? 'Loading...'
                : transactionCounts
                ? `C:${transactionCounts.completed_count} P:${transactionCounts.partial_refunded_count} R:${transactionCounts.refunded_count} V:${transactionCounts.voided_count}`
                : 'N/A'
            }
            dotColor="#06b6d4"
            bg="#cffafe"
          />
          <StatCard
            label="Low Stock Items"
            value={
              statsLoading
                ? 'Loading...'
                : lowStockCount != null
                ? `${lowStockCount} Items`
                : 'N/A'
            }
            dotColor="#ef4444"
            bg="#fee2e2"
          />
          <StatCard
            label="Active Employees"
            value={
              statsLoading
                ? 'Loading...'
                : activeEmployees != null
                ? `${activeEmployees} Staff`
                : 'N/A'
            }
            dotColor="#f97316"
            bg="#ffedd5"
          />
        </View>

        {/* ── Weekly Sales Overview ───────────────────────────── */}
        <Text style={styles.sectionTitle}>Weekly Sales Overview</Text>

        <Text style={styles.branchTitle}>Branch 1 performance</Text>
        <BarChart data={BRANCH1_DATA} />

        <Text style={[styles.branchTitle, { marginTop: 16 }]}>Branch 2 performance</Text>
        <BarChart data={BRANCH2_DATA} />

        {/* View details link */}
        <TouchableOpacity 
          style={styles.viewDetails}
          onPress={handleViewBranchPerformance}
        >
          <Text style={styles.viewDetailsText}>View branch performances details </Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.primaryGreen} />
        </TouchableOpacity>
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
                onPress={() => toggleNotificationRead(item.id)}
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

  // Header
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
  settingsContainer: {
    position: 'relative',
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

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // Title & greeting
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginTop: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginTop: 8,
  },
  date: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },

  // Cards
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },

  // Section
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  branchTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },

  // View details
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  viewDetailsText: {
    fontSize: 13,
    color: Colors.primaryGreen,
    fontWeight: '500',
  },

  // Logout Modal
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
