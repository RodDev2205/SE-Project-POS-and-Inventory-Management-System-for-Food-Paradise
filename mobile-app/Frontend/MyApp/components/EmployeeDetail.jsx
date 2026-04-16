import React, { useState, useContext, useEffect } from 'react';
import { StatusBar as RNStatusBar } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
  ScrollView,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import { NotificationContext } from '@/context/NotificationContext';

export default function EmployeeDetail({ employee, branchId, onClose, onStatusChange, onRefresh }) {
  const { auth } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isActive, setIsActive] = useState(
    employee.status === 'Activate' || employee.status === 1
  );
  const [employeeData, setEmployeeData] = useState(employee);

  const handleToggleStatus = async () => {
    try {
      setToggling(true);
      const newStatus = isActive ? 'Deactivate' : 'Activate';

      console.log(`🔄 Toggling employee ${employee.user_id} status to ${newStatus}`);

      const res = await fetch(
        `https://deployment-backend-repo-production.up.railway.app/api/superadmin/users/${employee.user_id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      console.log(`📊 Response status: ${res.status} ${res.statusText}`);

      if (!res.ok) {
        const responseText = await res.text();
        console.error('❌ Error response:', responseText.substring(0, 200));
        
        let errorMessage = 'Failed to update status';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Response wasn't JSON, use status text or generic message
          errorMessage = `Server error (HTTP ${res.status}): ${res.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const responseText = await res.text();
      console.log(`✅ Status toggled successfully. Response: ${responseText.substring(0, 100)}`);

      setIsActive(newStatus === 'Activate');
      setEmployeeData((prev) => ({ ...prev, status: newStatus }));

      // Notify parent component of status change
      if (onStatusChange) {
        onStatusChange(employee.user_id, newStatus);
      }

      Alert.alert(
        'Success',
        `Employee ${newStatus === 'Activate' ? 'activated' : 'deactivated'} successfully`
      );
    } catch (err) {
      console.error('Error updating employee status:', err);
      Alert.alert('Error', err.message || 'Failed to update employee status');
      setIsActive(!isActive);
    } finally {
      setToggling(false);
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Error refreshing employee data:', error);
      } finally {
        setRefreshing(false);
      }
    }
  };

  const userName =
    employeeData.first_name && employeeData.last_name
      ? `${employeeData.first_name} ${employeeData.last_name}`
      : employeeData.name;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryGreen}
        translucent={Platform.OS === 'android'}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employee Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentPadding}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primaryGreen]}
            tintColor={Colors.primaryGreen}
          />
        }
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: isActive ? Colors.primaryGreen : '#ccc' },
            ]}
          >
            <Text style={styles.avatarText}>
              {(employeeData.first_name || employeeData.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.employeeName}>{userName}</Text>
          <Text style={styles.employeeRole}>{employeeData.role_name || 'N/A'}</Text>
          <View
            style={[
              styles.statusBadge,
              isActive ? styles.statusBadgeActive : styles.statusBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isActive ? styles.statusBadgeTextActive : styles.statusBadgeTextInactive,
              ]}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>First Name</Text>
            <Text style={styles.detailValue}>{employeeData.first_name || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Name</Text>
            <Text style={styles.detailValue}>{employeeData.last_name || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contact Number</Text>
            <Text style={styles.detailValue}>{employeeData.contact_number || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Role</Text>
            <Text style={styles.detailValue}>{employeeData.role_name || 'N/A'}</Text>
          </View>

          {employeeData.branch_name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Branch</Text>
              <Text style={styles.detailValue}>{employeeData.branch_name}</Text>
            </View>
          )}
        </View>

        {/* Action Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Status</Text>

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>
                {isActive ? 'Deactivate Account' : 'Activate Account'}
              </Text>
              <Text style={styles.toggleDescription}>
                {isActive
                  ? 'Click to deactivate this employee'
                  : 'Click to activate this employee'}
              </Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={handleToggleStatus}
              disabled={toggling}
              trackColor={{ false: '#ccc', true: Colors.primaryGreen }}
              thumbColor={isActive ? Colors.primaryGreen : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 12,
    paddingBottom: 7,
    minHeight: 92,
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  employeeName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  employeeRole: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  statusBadgeActive: {
    backgroundColor: '#d1fae5',
  },
  statusBadgeInactive: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  statusBadgeTextActive: {
    color: '#047857',
  },
  statusBadgeTextInactive: {
    color: '#dc2626',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  toggleLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  toggleDescription: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
