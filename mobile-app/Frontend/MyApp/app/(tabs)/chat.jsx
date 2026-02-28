import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import FoodParadiseLogo from '@/components/FoodParadiselogo';
import Chatroom from '@/components/Chatroom';
import { NotificationContext } from '@/context/NotificationContext';

const CHATS = [
  { id: '1', branch: 'Branch 1 Chatroom', time: '3:00 pm', avatar: '1', isOnline: true },
  { id: '2', branch: 'Branch 2 Chatroom', time: '2:55 pm', avatar: '2', isOnline: false },
];

export default function MessagesScreen() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const { notifications, toggleNotificationRead, unreadCount } = useContext(NotificationContext);

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

  // If a chat is selected, show the chatroom
  if (selectedChat) {
    return (
      <Chatroom
        branchName={selectedChat.branch}
        branchId={selectedChat.id}
        onClose={() => setSelectedChat(null)}
        isOnline={selectedChat.isOnline}
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
        <View style={styles.chatList}>
          {CHATS.map((chat) => (
            <TouchableOpacity key={chat.id} style={styles.chatItem} onPress={() => setSelectedChat(chat)}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: chat.id === '1' ? '#a78bfa' : '#60a5fa' }]}>
                  <Text style={styles.avatarText}>{chat.avatar}</Text>
                </View>
                <View style={[styles.statusIndicator, { backgroundColor: chat.isOnline ? '#10b981' : '#9ca3af' }]} />
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatBranch}>{chat.branch}</Text>
                <Text style={styles.statusText}>{chat.isOnline ? 'Online' : 'Offline'}</Text>
              </View>
              <Text style={styles.chatTime}>{chat.time}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
            {notifications.slice(0, 5).map((item) => (
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
});
