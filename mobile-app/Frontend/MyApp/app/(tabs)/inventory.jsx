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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import FoodParadiseLogo from '@/components/FoodParadiselogo';
import { NotificationContext } from '@/context/NotificationContext';

const LOW_STOCK_ITEMS = [
  { name: 'Item Name', status: 'Remaining stock' },
  { name: 'Item Name', status: 'Remaining stock' },
  { name: 'Item Name', status: 'Remaining stock' },
  { name: 'Item Name', status: 'Remaining stock' },
  { name: 'Item Name', status: 'Remaining stock' },
  { name: 'Item Name', status: 'Remaining stock' },
];

const OTHER_ITEMS = [
  { name: 'Item Name', status: 'Remaining stock' },
  { name: 'Item Name', status: 'Remaining stock' },
  { name: 'Item Name', status: 'Remaining stock' },
  { name: 'Item Name', status: 'Remaining stock' },
  { name: 'Item Name', status: 'Remaining stock' },
];

export default function InventoryStatusScreen() {
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState('branch1');
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
        <Text style={styles.pageTitle}>Inventory Status</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Inventory status such as item stocks can be{'\n'}monitored here:
        </Text>

        {/* Branch selector */}
        <View style={styles.branchSelector}>
          <TouchableOpacity
            style={[styles.branchTab, selectedBranch === 'branch1' && styles.branchTabActive]}
            onPress={() => setSelectedBranch('branch1')}
          >
            <Text style={[styles.branchTabText, selectedBranch === 'branch1' && styles.branchTabTextActive]}>
              Branch 1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.branchTab, selectedBranch === 'branch2' && styles.branchTabActive]}
            onPress={() => setSelectedBranch('branch2')}
          >
            <Text style={[styles.branchTabText, selectedBranch === 'branch2' && styles.branchTabTextActive]}>
              Branch 2
            </Text>
          </TouchableOpacity>
        </View>

        {/* Low Stock Items section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircleRed}>
              <Ionicons name="alert-circle" size={16} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Low Stock Items</Text>
          </View>

          {LOW_STOCK_ITEMS.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemStatus}>{item.status}</Text>
            </View>
          ))}

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

          {OTHER_ITEMS.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemStatus}>{item.status}</Text>
            </View>
          ))}
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
});
