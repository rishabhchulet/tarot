import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Send, RefreshCw, Settings, Database, TestTube } from 'lucide-react-native';
import {
  getUserNotificationPreferences,
  scheduleSmartDailyNotifications,
  scheduleSpecialNotification,
  fetchRemoteNotificationTemplates,
  getCachedNotificationTemplates,
  getRandomNotificationMessage,
  cancelAllNotifications,
  updateNotificationsWithFreshContent
} from '@/utils/notifications';

export function NotificationTest() {
  const [preferences, setPreferences] = useState<any>(null);
  const [remoteTemplates, setRemoteTemplates] = useState<any[]>([]);
  const [cachedTemplates, setCachedTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = async () => {
    try {
      const prefs = await getUserNotificationPreferences();
      const remote = await fetchRemoteNotificationTemplates();
      const cached = await getCachedNotificationTemplates();
      
      setPreferences(prefs);
      setRemoteTemplates(remote);
      setCachedTemplates(cached);
    } catch (error) {
      console.error('Error loading test data:', error);
    }
  };

  const testNotification = async () => {
    setLoading(true);
    try {
      await scheduleSpecialNotification(
        'Test Notification',
        'This is a test of your notification system! 🎯',
        5, // 5 seconds delay
        '🧪'
      );
      Alert.alert('Success', 'Test notification scheduled for 5 seconds from now!');
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule test notification');
    }
    setLoading(false);
  };

  const testRandomMessage = async () => {
    setLoading(true);
    try {
      const message = await getRandomNotificationMessage('daily');
      await scheduleSpecialNotification(
        message.title,
        message.body,
        3,
        message.emoji
      );
      Alert.alert('Random Message', `Scheduled: "${message.title}" in 3 seconds`);
    } catch (error) {
      Alert.alert('Error', 'Failed to get random message');
    }
    setLoading(false);
  };

  const rescheduleNotifications = async () => {
    setLoading(true);
    try {
      await scheduleSmartDailyNotifications();
      Alert.alert('Success', 'Daily notifications rescheduled with latest preferences!');
    } catch (error) {
      Alert.alert('Error', 'Failed to reschedule notifications');
    }
    setLoading(false);
  };

  const updateWithFreshContent = async () => {
    setLoading(true);
    try {
      await updateNotificationsWithFreshContent();
      await loadTestData(); // Refresh our test data
      Alert.alert('Success', 'Notifications updated with fresh content!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update with fresh content');
    }
    setLoading(false);
  };

  const cancelAll = async () => {
    setLoading(true);
    try {
      await cancelAllNotifications();
      Alert.alert('Success', 'All notifications cancelled!');
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel notifications');
    }
    setLoading(false);
  };

  const TestButton = ({ icon: Icon, title, onPress, color = '#3B82F6' }) => (
    <Pressable
      style={[styles.testButton, { borderColor: color + '40' }]}
      onPress={onPress}
      disabled={loading}
    >
      <Icon size={20} color={color} />
      <Text style={[styles.testButtonText, { color }]}>{title}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.1)', 'rgba(139, 92, 246, 0.1)']}
        style={styles.header}
      >
        <TestTube size={24} color="#3B82F6" />
        <Text style={styles.title}>Notification System Test</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Preferences */}
        {preferences && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Preferences</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>Enabled: {preferences.enabled ? '✅' : '❌'}</Text>
              <Text style={styles.infoText}>Time: {preferences.preferredTime}</Text>
              <Text style={styles.infoText}>Style: {preferences.messageStyle}</Text>
              <Text style={styles.infoText}>Weekends: {preferences.weekendsEnabled ? '✅' : '❌'}</Text>
              <Text style={styles.infoText}>Timezone: {preferences.timezone}</Text>
            </View>
          </View>
        )}

        {/* Test Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Actions</Text>
          <View style={styles.buttonGrid}>
            <TestButton
              icon={Send}
              title="Test Notification (5s)"
              onPress={testNotification}
              color="#10B981"
            />
            <TestButton
              icon={Bell}
              title="Random Message (3s)"
              onPress={testRandomMessage}
              color="#F59E0B"
            />
            <TestButton
              icon={RefreshCw}
              title="Reschedule Daily"
              onPress={rescheduleNotifications}
              color="#3B82F6"
            />
            <TestButton
              icon={Database}
              title="Update Fresh Content"
              onPress={updateWithFreshContent}
              color="#8B5CF6"
            />
            <TestButton
              icon={Settings}
              title="Cancel All"
              onPress={cancelAll}
              color="#EF4444"
            />
          </View>
        </View>

        {/* Template Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Template Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{remoteTemplates.length}</Text>
              <Text style={styles.statLabel}>Remote Templates</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{cachedTemplates.length}</Text>
              <Text style={styles.statLabel}>Cached Templates</Text>
            </View>
          </View>
        </View>

        {/* Sample Messages */}
        {remoteTemplates.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sample Messages (Remote)</Text>
            {remoteTemplates.slice(0, 3).map((template, index) => (
              <View key={index} style={styles.messageCard}>
                <Text style={styles.messageEmoji}>{template.emoji}</Text>
                <View style={styles.messageContent}>
                  <Text style={styles.messageTitle}>{template.title}</Text>
                  <Text style={styles.messageBody}>{template.body}</Text>
                  <Text style={styles.messageCategory}>Category: {template.category}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🧪 This component is for testing the notification system.{'\n'}
            Remove from production builds.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.2)',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#F1F5F9',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#94A3B8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#CBD5E1',
    marginBottom: 4,
  },
  buttonGrid: {
    gap: 12,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  testButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
  messageCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  messageEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  messageBody: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  messageCategory: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#D97706',
    textAlign: 'center',
    lineHeight: 16,
  },
}); 