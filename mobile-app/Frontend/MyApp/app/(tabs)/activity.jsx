import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import FoodParadiseLogo from '@/components/FoodParadiselogo';
import BarChart from '@/components/Dashboard/BarChart';
import { NotificationContext } from '@/context/NotificationContext';

// placeholder data removed; chart will load from API


export default function ReportsScreen() {
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState([]);
  const [branchDropdownVisible, setBranchDropdownVisible] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [timeRangeDropdownVisible, setTimeRangeDropdownVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({
    total_sales: 0,
    transaction_count: 0,
    partial_refunded_count: 0,
    refunded_count: 0,
    voided_count: 0,
  });
  const { notifications, toggleNotificationRead, unreadCount, auth } = useContext(NotificationContext);

  const TIME_RANGE_OPTIONS = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
  ];

  const handleNotifications = () => {
    setNotificationsVisible(true);
  };

  // fetch branches from backend
  const fetchBranches = async () => {
    try {
      const res = await fetch('https://deployment-backend-repo-production.up.railway.app/api/sales-superadmin/branches', {
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined,
      });
      if (!res.ok) throw new Error(`Failed to fetch branches (${res.status})`);
      const data = await res.json();
      setBranches(data || []);
      if (data && data.length) setSelectedBranch(data[0].branch_id.toString());
    } catch (err) {
      console.error('Failed to load branches:', err.message || err);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // re-fetch chart whenever branch or time range changes
  useEffect(() => {
    const fetchChart = async () => {
      if (!auth?.token || !selectedBranch) return;

      let period;
      let startDate;
      let endDate;
      const now = new Date();
      switch (selectedTimeRange) {
        case 'today':
          period = 'hourly';
          startDate = now.toISOString().slice(0, 10);
          endDate = startDate;
          break;
        case 'yesterday':
          period = 'hourly';
          const y = new Date(now);
          y.setDate(y.getDate() - 1);
          startDate = y.toISOString().slice(0, 10);
          endDate = startDate;
          break;
        case 'week':
          period = 'daily';
          const day = now.getDay();
          const mon = new Date(now);
          mon.setDate(now.getDate() - ((day + 6) % 7));
          const sun = new Date(mon);
          sun.setDate(mon.getDate() + 6);
          startDate = mon.toISOString().slice(0, 10);
          endDate = sun.toISOString().slice(0, 10);
          break;
        case 'month':
          period = 'monthly';
          const first = new Date(now.getFullYear(), now.getMonth(), 1);
          const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          startDate = first.toISOString().slice(0, 10);
          endDate = last.toISOString().slice(0, 10);
          break;
        case 'year':
          period = 'yearly';
          const start = new Date(now.getFullYear(), 0, 1);
          const end = new Date(now.getFullYear(), 11, 31);
          startDate = start.toISOString().slice(0, 10);
          endDate = end.toISOString().slice(0, 10);
          break;
        default:
          period = 'daily';
      }

      try {
        let url = `https://deployment-backend-repo-production.up.railway.app/api/sales-superadmin/sales-trend?period=${period}&branchId=${
          selectedBranch || 'all'
        }`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        const resp = await fetch(url, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        });
        const arr = await resp.json();
        const chartArr = arr.map((r) => {
          let label = r.period_key;
          if (period === 'hourly') {
            // Extract hour from datetime string (e.g., "2026-03-02 14:00:00" → "14:00")
            const timePart = label.split(' ')[1];
            if (timePart) {
              label = timePart.slice(0, 5); // HH:MM
            } else {
              const d = new Date(label);
              label = `${String(d.getHours()).padStart(2, '0')}:00`;
            }
          } else if (period === 'daily') {
            // Extract day label from date (M T W T F S S)
            const dateStr = label.split(' ')[0] || label;
            const d = new Date(dateStr);
            const dayNames = ['S','M','T','W','T','F','S'];
            label = dayNames[d.getDay()];
          } else if (period === 'weekly') {
            label = label.split('-')[1];
          } else if (period === 'monthly') {
            const monthNum = parseInt(label.split('-')[1], 10);
            const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            label = monthNames[monthNum - 1] || label;
          } else if (period === 'yearly') {
            // label already year
          }
          const val = typeof r.total_sales === 'number' ? r.total_sales : Number(r.total_sales) || 0;
          return { day: label, value: val };
        });
        setChartData(chartArr);

        // fetch KPI summary for the same filters
        try {
          let kpiUrl = `https://deployment-backend-repo-production.up.railway.app/api/sales-superadmin/kpis?branchId=${
            selectedBranch || 'all'
          }`;
          if (startDate) kpiUrl += `&startDate=${startDate}`;
          if (endDate) kpiUrl += `&endDate=${endDate}`;
          const kpiResp = await fetch(kpiUrl, {
            headers: {
              Authorization: `Bearer ${auth.token}`,
              'Content-Type': 'application/json',
            },
          });
          if (kpiResp.ok) {
            const kpiData = await kpiResp.json();
            setSummary({
              total_sales: kpiData.total_sales || 0,
              transaction_count: kpiData.transaction_count || 0,
              partial_refunded_count: kpiData.partial_refunded_count || 0,
              refunded_count: kpiData.refunded_count || 0,
              voided_count: kpiData.voided_count || 0,
            });
          } else {
            console.error('Failed to fetch summary', kpiResp.status);
          }
        } catch (err) {
          console.error('Error fetching summary data:', err.message || err);
        }
      } catch (err) {
        console.error('Error fetching chart data:', err.message || err);
      }
    };

    fetchChart();
  }, [selectedBranch, selectedTimeRange, auth]);

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

        {/* Branch selector dropdown */}
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={styles.timeRangeButton}
            onPress={() => setBranchDropdownVisible(!branchDropdownVisible)}
          >
            <Text style={styles.timeRangeButtonText} numberOfLines={1} ellipsizeMode="tail">
              {branches.find((b) => b.branch_id.toString() === selectedBranch)?.branch_name || 'Select Branch'}
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
                      selectedBranch === b.branch_id.toString() && styles.timeRangeOptionActive,
                    ]}
                    onPress={() => {
                      setSelectedBranch(b.branch_id.toString());
                      setBranchDropdownVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.timeRangeOptionText,
                        selectedBranch === b.branch_id.toString() && styles.timeRangeOptionTextActive,
                      ]}
                    >
                      {b.branch_name}
                    </Text>
                    {selectedBranch === b.branch_id.toString() && (
                      <Ionicons name="checkmark" size={18} color={Colors.primaryGreen} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Time Range Dropdown */}
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={styles.timeRangeButton}
            onPress={() => setTimeRangeDropdownVisible(!timeRangeDropdownVisible)}
          >
            <Text style={styles.timeRangeButtonText}>
              {TIME_RANGE_OPTIONS.find(o => o.id === selectedTimeRange)?.label}
            </Text>
            <Ionicons
              name={timeRangeDropdownVisible ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.primaryGreen}
            />
          </TouchableOpacity>

          {timeRangeDropdownVisible && (
            <View style={styles.timeRangeDropdown}>
              {TIME_RANGE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.timeRangeOption,
                    selectedTimeRange === option.id && styles.timeRangeOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedTimeRange(option.id);
                    setTimeRangeDropdownVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeRangeOptionText,
                      selectedTimeRange === option.id && styles.timeRangeOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selectedTimeRange === option.id && (
                    <Ionicons name="checkmark" size={18} color={Colors.primaryGreen} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Heading */}
        <Text style={styles.sectionHeading}>
          Viewing: {branches.find((b) => b.branch_id.toString() === selectedBranch)?.branch_name || 'Branch'} {TIME_RANGE_OPTIONS.find(o => o.id === selectedTimeRange)?.label} Report
        </Text>

        {/* Chart */}
        <View style={styles.chartWrapper}>
          <BarChart data={chartData} />
        </View>

        {/* Performance Detail Summary */}
        <Text style={styles.summaryTitle}>Performance Detail Summary</Text>
        <Text style={styles.summarySubtitle}>Details of the branch performance summary:</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Overall Sales:</Text>
            <Text style={styles.tableValue}>₱ {summary.total_sales.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Total Transactions:</Text>
            <Text style={styles.tableValue}>{summary.transaction_count} Orders</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Partial Refunded:</Text>
            <Text style={styles.tableValue}>{summary.partial_refunded_count}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Refunded:</Text>
            <Text style={styles.tableValue}>{summary.refunded_count}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Voided Orders:</Text>
            <Text style={styles.tableValue}>{summary.voided_count}</Text>
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
    marginBottom: 16,
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
});
