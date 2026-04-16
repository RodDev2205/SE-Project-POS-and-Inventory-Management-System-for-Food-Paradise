import React, { useState, useContext } from 'react';
import { StatusBar as RNStatusBar } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import { NotificationContext } from '@/context/NotificationContext';

export default function BugReportsScreen() {
  const router = useRouter();
  const { auth } = useContext(NotificationContext);
  const [reportType, setReportType] = useState('bug');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }

    setLoading(true);
    try {
      const token = auth.token;
      const user_id = auth.user?.user_id;
      if (!token || !user_id) {
        Alert.alert('Error', 'Please log in first');
        return;
      }

      const feedbackData = {
        user_id,
        type: reportType,
        message,
        system_name: Platform.OS,
      };

      const response = await fetch('https://deployment-backend-repo-production.up.railway.app/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      const result = await response.json();
      console.log('Feedback submitted:', result);

      Alert.alert('Success', 'Thank you! Your feedback has been submitted successfully.');
      setMessage('');
      setReportType('bug');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', `Failed to send feedback: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: '#fff' }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryGreen} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports & Feedback</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Feedback Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Report an Issue or Send Feedback</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Choose the type then describe your message.
          </Text>

          <View style={styles.card}>
            {/* Radio Buttons */}
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setReportType('bug')}
              >
                <View style={styles.radioCircle}>
                  {reportType === 'bug' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioText}>Bug Report</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setReportType('feedback')}
              >
                <View style={styles.radioCircle}>
                  {reportType === 'feedback' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioText}>Feedback</Text>
              </TouchableOpacity>
            </View>

            {/* Message Input */}
            <TextInput
              style={styles.textInput}
              placeholder="Enter your message here"
              placeholderTextColor={Colors.inputPlaceholder}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.submitBtnText}>Submitting...</Text>
              ) : (
                <Text style={styles.submitBtnText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Header
    header: {
      backgroundColor: Colors.primaryGreenDark,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 12,
      minHeight: 60 + (Platform.OS === 'android' ? RNStatusBar.currentHeight : 0),
      paddingBottom: 12,
      gap: 12,
    },
  backBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Text Input
  textInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    minHeight: 120,
  },

  // Radio Group
  radioGroup: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryGreen,
  },
  radioText: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },

  // Image Picker
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  imagePickerText: {
    fontSize: FontSize.base,
    color: Colors.primaryGreen,
    textDecorationLine: 'underline',
  },
  imageSelected: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  // Submit Button
  submitBtn: {
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});
