import React, { useState } from 'react';
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

export default function BugReportsScreen() {
  const router = useRouter();
  const [bugReport, setBugReport] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loadingBug, setLoadingBug] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleSubmitBugReport = async () => {
    if (!bugReport.trim()) {
      Alert.alert('Error', 'Please enter your bug report');
      return;
    }

    setLoadingBug(true);
    try {
      // TODO: Replace with your real API call to submit bug report
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log('Bug report submitted:', bugReport);
      Alert.alert('Success', 'Thank you! Your bug report has been submitted.');
      setBugReport('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit bug report.';
      Alert.alert('Error', message);
    } finally {
      setLoadingBug(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert('Error', 'Please enter your feedback');
      return;
    }

    setLoadingFeedback(true);
    try {
      // TODO: Replace with your real API call to submit feedback
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log('Feedback submitted:', feedback);
      Alert.alert('Success', "Thank you! We'd love to hear your feedback.");
      setFeedback('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send feedback.';
      Alert.alert('Error', message);
    } finally {
      setLoadingFeedback(false);
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
        {/* Bug Reports Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bug Reports</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Found bugs or errors? Please let your managers know about it.
          </Text>

          <View style={styles.card}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your report here and specify where the bug was found."
              placeholderTextColor={Colors.inputPlaceholder}
              value={bugReport}
              onChangeText={setBugReport}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitBtn, loadingBug && styles.submitBtnDisabled]}
              onPress={handleSubmitBugReport}
              disabled={loadingBug}
            >
              {loadingBug ? (
                <Text style={styles.submitBtnText}>Submitting...</Text>
              ) : (
                <Text style={styles.submitBtnText}>Submit bug report</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Feedback Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Got any Feedback or Suggestions?</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Feedback on the systems performance is always welcomed! Let us work together to improve the systems
          </Text>

          <View style={styles.card}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your feedback/suggestions here. We'd love to hear your opinion!"
              placeholderTextColor={Colors.inputPlaceholder}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitBtn, loadingFeedback && styles.submitBtnDisabled]}
              onPress={handleSendFeedback}
              disabled={loadingFeedback}
            >
              {loadingFeedback ? (
                <Text style={styles.submitBtnText}>Sending...</Text>
              ) : (
                <Text style={styles.submitBtnText}>Send us your feedback</Text>
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
