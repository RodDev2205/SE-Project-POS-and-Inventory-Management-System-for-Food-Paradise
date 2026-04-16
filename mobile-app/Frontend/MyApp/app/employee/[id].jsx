import React, { useState, useContext, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import EmployeeDetail from '@/components/EmployeeDetail'; // Your working UI component
import { NotificationContext } from '@/context/NotificationContext';
import { Colors } from '@/constants/theme';

export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { auth } = useContext(NotificationContext);
  
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEmployeeData = async () => {
    if (!id || !auth?.token) return;

    try {
      setLoading(true);
      // We use the 'staff' endpoint because we know it's working in your profile.jsx
      const res = await fetch('https://deployment-backend-repo-production.up.railway.app/api/superadmin/staff', {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      
      if (!res.ok) throw new Error('Failed to fetch staff list');
      
      const data = await res.json();
      const allStaff = data.staff || [];
      
      // Find the specific user from the list using the ID from the URL
      const foundEmployee = allStaff.find(u => String(u.user_id) === String(id));
      
      if (foundEmployee) {
        setEmployee(foundEmployee);
      } else {
        Alert.alert('Error', 'Employee not found');
        router.back();
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Could not load employee details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [id, auth?.token]);

  // This handles the status toggle logic from your original EmployeeDetail file
  const handleStatusChange = (userId, newStatus) => {
    setEmployee(prev => prev ? { ...prev, status: newStatus } : prev);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primaryGreen} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {employee && (
        <EmployeeDetail
          employee={employee}
          onClose={() => router.back()}
          onStatusChange={handleStatusChange}
          onRefresh={fetchEmployeeData} // Pass the refresh function to the component
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});