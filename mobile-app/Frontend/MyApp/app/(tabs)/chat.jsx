import React, { useState, useContext, useEffect } from 'react';
import { StatusBar as RNStatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import FoodParadiseLogo from '@/components/FoodParadiselogo';
import Chatroom from '@/components/Chatroom';
import { NotificationContext } from '@/context/NotificationContext';

export default function MessagesScreen() {
  const router = useRouter();
  const [selectedChat, setSelectedChat] = useState(null);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [branches, setBranches] = useState([]);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // update branch preview when a new message arrives
  const handleNewMessage = (branchId, text, senderName, time) => {
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId.toString()
          ? { ...b, lastMessage: text, lastMessageTime: time, senderName }
          : b
      )
    );
  };
  const [loading, setLoading] = useState(true);
  const { notifications, toggleNotificationRead, unreadCount, auth, handleNotificationClick, logout } = useContext(NotificationContext);

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
  useEffect(() => {
    const fetchBranches = async () => {
      if (!auth?.token) return;
      try {
        setLoading(true);
        const response = await fetch('https://deployment-backend-repo-production.up.railway.app/api/chat/branches-with-messages', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch branches');
        const data = await response.json();
        
        // Debug raw response
        console.log('🔍 branches-with-messages response:', data);
        // Format branches for display
        const formattedBranches = data.map((branch, index) => ({
          id: branch.branch_id.toString(),
          branchName: branch.branch_name,
          // API now returns lastMessage/lastTime and sender_name
          lastMessage: branch.lastMessage || branch.last_message || 'No messages yet',
          lastMessageTime: branch.lastTime || branch.last_message_time || '',
          senderName: branch.sender_name || '',
          isOnline: true, // You can determine this based on last activity
          avatar: String(index + 1),
        }));
        
        setBranches(formattedBranches);
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [auth?.token]);

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

  // If a chat is selected, show the chatroom
  if (selectedChat) {
    return (
      <Chatroom
        branchName={selectedChat.branchName}
        branchId={selectedChat.id}
        onClose={() => setSelectedChat(null)}
        isOnline={selectedChat.isOnline}
        onNewMessage={handleNewMessage}
      />
    );
  }

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
                  <Text style={styles.menuText}>Admin</Text>
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
      >
        {/* Title */}
        <Text style={styles.pageTitle}>Messages</Text>

        {/* Section title */}
        <Text style={styles.sectionTitle}>Branch Chats</Text>
        <Text style={styles.sectionSubtitle}>
          Chat with your employees in the dedicated{'\n'}chat rooms of the branches
        </Text>

        {/* Chat list */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primaryGreen} />
          </View>
        ) : branches.length === 0 ? (
          <View style={styles.emptyChatContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
            <Text style={styles.emptyChatText}>No branches available</Text>
          </View>
        ) : (
          <View style={styles.chatList}>
            {branches.map((chat) => (
              <TouchableOpacity key={chat.id} style={styles.chatItem} onPress={() => setSelectedChat(chat)}>
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, { backgroundColor: chat.id === '1' ? '#a78bfa' : '#60a5fa' }]}>
                    <Text style={styles.avatarText}>{chat.avatar}</Text>
                  </View>
                  <View style={[styles.statusIndicator, { backgroundColor: chat.isOnline ? '#10b981' : '#9ca3af' }]} />
                </View>
                <View style={styles.chatInfo}>
                  <Text style={styles.chatBranch}>{chat.branchName}</Text>
                  <Text style={styles.statusText} numberOfLines={1}>
                    {chat.senderName ? `${chat.senderName}: ` : ''}{chat.lastMessage}
                  </Text>
                </View>
                <Text style={styles.chatTime}>{chat.lastMessageTime}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Chat rooms are dedicated messaging tool allowing you to communicate with different branch managers.
          </Text>
        </View>
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
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  chatList: {
    gap: 8,
    marginBottom: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyChatContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyChatText: {
    fontSize: 14,
    color: '#999',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  statusIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusText: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  chatInfo: {
    flex: 1,
  },
  chatBranch: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  chatTime: {
    fontSize: 12,
    color: '#888',
  },
  infoBox: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
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
});
