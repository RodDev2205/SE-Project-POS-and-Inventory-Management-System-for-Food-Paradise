import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, StatusBar as RNStatusBar, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius } from '@/constants/theme';
import { NotificationContext } from '@/context/NotificationContext';

const API_BASE = 'https://deployment-backend-repo-production.up.railway.app';

export default function MenuApprovalListScreen() {
  const router = useRouter();
  const { auth } = useContext(NotificationContext);
  const [menuItems, setMenuItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBranches = async () => {
    if (!auth?.token) return;
    try {
      const res = await fetch(`${API_BASE}/api/sales-superadmin/branches`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch branches');
      const data = await res.json();
      setBranches((data || []).sort((a, b) => String(a.branch_name).localeCompare(String(b.branch_name))));
    } catch (err) {
      console.error('Failed to load branches', err);
    }
  };

  const fetchMenuApprovals = async () => {
    if (!auth?.token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/menu-superadmin/products`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch menu approval items');
      const data = await res.json();
      setMenuItems(data || []);
    } catch (err) {
      console.error('Failed to load menu approval items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchMenuApprovals();
  }, [auth?.token]);

  useFocusEffect(
    React.useCallback(() => {
      fetchBranches();
      fetchMenuApprovals();
    }, [auth?.token])
  );

  const filteredItems = menuItems.filter((item) => {
    const branchMatches = selectedBranch === 'all' || String(item.branch_id) === String(selectedBranch);
    const statusMatches = selectedStatus === 'ALL' || item.approval_status === selectedStatus;
    const searchMatches = searchQuery.trim() === '' || item.product_name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return branchMatches && statusMatches && searchMatches;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBranches(), fetchMenuApprovals()]);
    setRefreshing(false);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu Approval</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primaryGreen]} tintColor={Colors.primaryGreen} />
        }
      >
        <Text style={styles.sectionTitle}>Filter by Branch</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, selectedBranch === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedBranch('all')}
          >
            <Text style={[styles.filterText, selectedBranch === 'all' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          {branches.map((branch) => (
            <TouchableOpacity
              key={branch.branch_id}
              style={[styles.filterChip, String(selectedBranch) === String(branch.branch_id) && styles.filterChipActive]}
              onPress={() => setSelectedBranch(String(branch.branch_id))}
            >
              <Text style={[styles.filterText, String(selectedBranch) === String(branch.branch_id) && styles.filterTextActive]}>
                {branch.branch_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Filter by Approval Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {['ALL', 'PENDING', 'APPROVED', 'DECLINED'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, selectedStatus === status && styles.filterChipActive]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text style={[styles.filterText, selectedStatus === status && styles.filterTextActive]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primaryGreen} style={{ marginTop: 24 }} />
        ) : filteredItems.length === 0 ? (
          <Text style={styles.emptyText}>No menu items found.</Text>
        ) : (
          filteredItems.map((item) => (
            <TouchableOpacity
              key={item.product_id}
              style={styles.itemCard}
              onPress={() => router.push(`/menu-approval/${item.product_id}`)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemMeta}>{item.category_name} • ₱{Number(item.price).toFixed(2)}</Text>
                <Text style={styles.itemMeta}>{item.branch_name || 'No branch'}</Text>
              </View>
              <View style={styles.statusBadge(item.approval_status)}>
                <Text style={styles.statusBadgeText}>{item.approval_status}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: Colors.primaryGreenDark, paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 12, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 7, minHeight: 92, gap: 12, },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginTop: 16, marginBottom: 8 },
  filterRow: { flexDirection: 'row' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', marginRight: 10 },
  filterChipActive: { backgroundColor: Colors.primaryGreen, borderColor: Colors.primaryGreen },
  filterText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  filterTextActive: { color: '#fff' },
  itemCard: { marginTop: 12, backgroundColor: '#fff', borderRadius: Radius.lg, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#111' },
  itemMeta: { fontSize: 13, color: '#64748b', marginTop: 4 },
  statusBadge: (status) => ({ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: status === 'PENDING' ? '#f8fafc' : status === 'APPROVED' ? '#dcfce7' : '#fee2e2' }),
  statusBadgeText: { fontSize: 12, fontWeight: '700', color: '#111' },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 32 },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'android' ? 0 : 8,
    marginTop: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    minHeight: 40,
  },
});