import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';
import { NotificationContext } from '@/context/NotificationContext';

const API_BASE = 'https://deployment-backend-repo-production.up.railway.app';

export default function MenuApprovalDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { auth } = useContext(NotificationContext);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  const [linkedIngredients, setLinkedIngredients] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const fetchLinkedIngredients = async (productId) => {
    if (!productId || !auth?.token) return;
    try {
      setIngredientsLoading(true);
      const res = await fetch(`${API_BASE}/api/menu-superadmin/menu-inventory/${productId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) {
        console.warn('Failed to load linked ingredients', res.status);
        setLinkedIngredients([]);
        return;
      }

      const data = await res.json();
      setLinkedIngredients(data || []);
    } catch (err) {
      console.error('MenuApprovalDetail fetchLinkedIngredients error:', err);
      setLinkedIngredients([]);
    } finally {
      setIngredientsLoading(false);
    }
  };

  const fetchItem = async () => {
    if (!id || !auth?.token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/menu-superadmin/products`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to load menu items');
      }

      const data = await res.json();
      const found = (data || []).find((product) => String(product.product_id) === String(id));

      if (!found) {
        Alert.alert('Not found', 'Unable to locate this menu item.');
        router.back();
        return;
      }

      setItem(found);
      if (found.approval_status === 'DECLINED' && found.decline_reason) {
        setDeclineReason(found.decline_reason);
      }
      fetchLinkedIngredients(found.product_id);
    } catch (err) {
      console.error('MenuApprovalDetail fetchItem error:', err);
      Alert.alert('Error', 'Could not load menu item details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id, auth?.token]);

  const submitApproval = async (status) => {
    if (!item || !auth?.token) return;
    if (status === 'DECLINED' && !declineReason.trim()) {
      Alert.alert('Reason required', 'Please provide a reason for declining this menu item.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE}/api/menu-superadmin/products/${item.product_id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          approval_status: status,
          decline_reason: status === 'DECLINED' ? declineReason : null,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Update failed');
      }

      Alert.alert('Success', `Menu item ${status.toLowerCase()} successfully.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('MenuApprovalDetail submitApproval error:', err);
      Alert.alert('Error', err.message || 'Failed to update approval status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primaryGreen} />
      </View>
    );
  }

  if (!item) {
    return null;
  }

  const isPending = item.approval_status === 'PENDING';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu Approval</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{item.product_name}</Text>
          <Text style={styles.subtitle}>{item.category_name || 'Uncategorized'}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Branch</Text>
            <Text style={styles.metaValue}>{item.branch_name || 'All branches'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Price</Text>
            <Text style={styles.metaValue}>₱{Number(item.price).toFixed(2)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={styles.metaValue}>{item.status || 'Unknown'}</Text>
          </View>
          <View style={styles.metaRow}> 
            <Text style={styles.metaLabel}>Approval</Text>
            <Text style={styles.statusTag(item.approval_status)}>{item.approval_status}</Text>
          </View>

          <View style={styles.section}> 
            <Text style={styles.sectionTitle}>Created by</Text>
            <Text style={styles.sectionText}>{item.created_by_name || 'Unknown user'}</Text>
          </View>

          {item.decline_reason ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Decline reason</Text>
              <Text style={styles.sectionText}>{item.decline_reason}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Linked Ingredients</Text>
            {ingredientsLoading ? (
              <ActivityIndicator size="small" color={Colors.primaryGreen} style={{ marginTop: 8 }} />
            ) : linkedIngredients.length > 0 ? (
              linkedIngredients.map((ingredient) => (
                <View key={`${ingredient.inventory_id}-${ingredient.servings_required}`} style={styles.ingredientRow}>
                  <View style={styles.ingredientTextWrap}>
                    <Text style={styles.ingredientName}>{ingredient.item_name}</Text>
                    <Text style={styles.ingredientMeta}>
                      Servings required: {ingredient.servings_required}
                    </Text>
                  </View>
                  <Text style={styles.ingredientStock}>
                    {ingredient.total_servings ?? 0} left
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.sectionText}>No linked inventory items found.</Text>
            )}
          </View>

          {isPending ? (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Decline reason</Text>
              <TextInput
                style={styles.textInput}
                value={declineReason}
                onChangeText={setDeclineReason}
                placeholder="Enter decline reason"
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => submitApproval('DECLINED')}
                  disabled={actionLoading}
                >
                  <Text style={styles.actionText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => submitApproval('APPROVED')}
                  disabled={actionLoading}
                >
                  <Text style={styles.actionText}>Approve</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={[styles.section, { marginTop: 20 }]}> 
              <Text style={styles.sectionTitle}>No actions available</Text>
              <Text style={styles.sectionText}>This menu item has already been {item.approval_status.toLowerCase()}.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  header: {
    backgroundColor: Colors.primaryGreenDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 12,
    paddingBottom: 7,
    minHeight: 92,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  metaLabel: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  metaValue: {
    color: '#111827',
    fontSize: 13,
    maxWidth: '60%',
    textAlign: 'right',
  },
  statusTag: (status) => ({
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: status === 'APPROVED' ? '#d1fae5' : status === 'DECLINED' ? '#fee2e2' : '#e0f2fe',
    color: status === 'APPROVED' ? '#166534' : status === 'DECLINED' ? '#991b1b' : '#0c4a6e',
    fontWeight: '700',
    fontSize: 12,
  }),
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 6,
  },
  sectionText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  ingredientRow: {
    marginTop: 10,
    backgroundColor: '#f8fafc',
    borderRadius: Radius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ingredientTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  ingredientMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  ingredientStock: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryGreen,
  },
  textInput: {
    minHeight: 100,
    marginTop: 8,
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 12,
    color: '#0f172a',
    textAlignVertical: 'top',
  },
  buttonRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: Colors.primaryGreen,
  },
  declineButton: {
    backgroundColor: '#ef4444',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7fafc',
  },
});