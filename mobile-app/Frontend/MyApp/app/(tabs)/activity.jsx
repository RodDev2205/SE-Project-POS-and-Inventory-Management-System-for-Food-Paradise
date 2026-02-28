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
import BarChart from '@/components/Dashboard/BarChart';
import { NotificationContext } from '@/context/NotificationContext';

const CHART_DATA = [
  { day: 'M', value: 45 },
  { day: 'T', value: 65 },
  { day: 'W', value: 80 },
  { day: 'T', value: 85 },
  { day: 'F', value: 70 },
  { day: 'S', value: 95 },
  { day: 'S', value: 75 },
];

export default function ReportsScreen() {
  const [selectedBranch, setSelectedBranch] = useState('branch1');
  const [selectedFormat, setSelectedFormat] = useState('daily');
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { notifications, toggleNotificationRead, unreadCount } = useContext(NotificationContext);

  const getDaysInMonth = (date) => {
    return new Array(42).fill(null).map((_, i) => {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
      const dayOfMonth = i - firstDay + 1;
      if (dayOfMonth < 1 || dayOfMonth > new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()) {
        return null;
      }
      return new Date(date.getFullYear(), date.getMonth(), dayOfMonth);
    });
  };

  const formatDateDisplay = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

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
        <Text style={styles.pageTitle}>Reports</Text>

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

        {/* Heading */}
        <Text style={styles.sectionHeading}>
          Viewing: {selectedBranch === 'branch1' ? 'Branch 1' : 'Branch 2'} {selectedFormat.charAt(0).toUpperCase() + selectedFormat.slice(1)} performance
        </Text>

        {/* Date picker row */}
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <TouchableOpacity 
            style={styles.datePickerBox}
            onPress={() => setShowCalendar(true)}
          >
            <Text style={styles.dateText}>{formatDateDisplay(selectedDate)}</Text>
            <Ionicons name="calendar" size={16} color={Colors.primaryGreen} />
          </TouchableOpacity>
        </View>

        {/* Format selector */}
        <View style={[styles.row, { marginTop: 12 }]}>
          <Text style={styles.label}>Format:</Text>
          <View style={styles.formatButtons}>
            <TouchableOpacity
              style={[styles.formatBtn, selectedFormat === 'daily' && styles.formatBtnActive]}
              onPress={() => setSelectedFormat('daily')}
            >
              <Text style={[styles.formatBtnText, selectedFormat === 'daily' && styles.formatBtnTextActive]}>
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formatBtn, selectedFormat === 'weekly' && styles.formatBtnActive]}
              onPress={() => setSelectedFormat('weekly')}
            >
              <Text style={[styles.formatBtnText, selectedFormat === 'weekly' && styles.formatBtnTextActive]}>
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formatBtn, selectedFormat === 'monthly' && styles.formatBtnActive]}
              onPress={() => setSelectedFormat('monthly')}
            >
              <Text style={[styles.formatBtnText, selectedFormat === 'monthly' && styles.formatBtnTextActive]}>
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartWrapper}>
          <BarChart data={CHART_DATA} />
        </View>

        {/* Performance Detail Summary */}
        <Text style={styles.summaryTitle}>Performance Detail Summary</Text>
        <Text style={styles.summarySubtitle}>Details of the branch performance summary:</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Overall Sales:</Text>
            <Text style={styles.tableValue}>₱ 4,932.22</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Total Orders:</Text>
            <Text style={styles.tableValue}>75 Orders</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Due In-orders:</Text>
            <Text style={styles.tableValue}>37</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Rejected orders:</Text>
            <Text style={styles.tableValue}>25</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Refunded:</Text>
            <Text style={styles.tableValue}>13</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Voided Items:</Text>
            <Text style={styles.tableValue}>5</Text>
          </View>
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

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}>
                <Ionicons name="chevron-back" size={24} color={Colors.primaryGreen} />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}>
                <Ionicons name="chevron-forward" size={24} color={Colors.primaryGreen} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekDays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={styles.weekDay}>{day}</Text>
              ))}
            </View>

            <View style={styles.calendarDays}>
              {getDaysInMonth(selectedDate).map((date, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.calendarDay,
                    !date && styles.calendarDayEmpty,
                    date && date.toDateString() === selectedDate.toDateString() && styles.calendarDaySelected,
                  ]}
                  onPress={() => date && handleDateSelect(date)}
                  disabled={!date}
                >
                  {date && (
                    <Text style={[
                      styles.calendarDayText,
                      date.toDateString() === selectedDate.toDateString() && styles.calendarDaySelectedText,
                    ]}>
                      {date.getDate()}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.calendarCloseBtn}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.calendarCloseBtnText}>Close</Text>
            </TouchableOpacity>
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
    marginBottom: 12,
    textAlign: 'center',
  },
  branchSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
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
  sectionHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    width: 50,
  },
  datePickerBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateText: {
    fontSize: 13,
    color: '#333',
  },
  formatButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  formatBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  formatBtnActive: {
    backgroundColor: '#f0f0f0',
    borderColor: '#999',
  },
  formatBtnText: {
    fontSize: 12,
    color: '#666',
  },
  formatBtnTextActive: {
    color: '#111',
    fontWeight: '600',
  },
  chartWrapper: {
    marginTop: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableLabel: {
    fontSize: 13,
    color: '#555',
  },
  tableValue: {
    fontSize: 13,
    fontWeight: '600',
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
  // Calendar styles
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '85%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primaryGreen,
  },
  calendarWeekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: '14.2%',
    textAlign: 'center',
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  calendarDay: {
    width: '14.2%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  calendarDayEmpty: {
    backgroundColor: 'transparent',
  },
  calendarDaySelected: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: 8,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  calendarDaySelectedText: {
    color: '#fff',
  },
  calendarCloseBtn: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  calendarCloseBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
