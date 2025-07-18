import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Pressable, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, User, CreditCard, CircleHelp as HelpCircle, LogOut, Settings as SettingsIcon, Clock, Sparkles, MessageCircle, Calendar, Music } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { SignOutTestButton } from '@/components/SignOutTestButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  getUserNotificationPreferences, 
  updateUserNotificationPreferences,
  scheduleSmartDailyNotifications 
} from '@/utils/notifications';

interface NotificationPreferences {
  enabled: boolean;
  preferredTime: string;
  messageStyle: 'mystical' | 'gentle' | 'motivational';
  weekendsEnabled: boolean;
  timezone: string;
}

export default function SettingsScreen() {
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    enabled: true,
    preferredTime: '09:00',
    messageStyle: 'mystical',
    weekendsEnabled: true,
    timezone: 'UTC'
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  const loadNotificationPreferences = async () => {
    try {
      const prefs = await getUserNotificationPreferences();
      setNotificationPrefs(prefs);
    } catch (error) {
      console.error('❌ Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: any) => {
    try {
      const newPrefs = { ...notificationPrefs, [key]: value };
      setNotificationPrefs(newPrefs);
      
      await updateUserNotificationPreferences({ [key]: value });
      
      if (key === 'enabled' && !value) {
        Alert.alert(
          'Notifications Disabled',
          'You won\'t receive daily reminders for your card readings.',
          [{ text: 'OK' }]
        );
      } else if (key === 'enabled' && value) {
        Alert.alert(
          'Notifications Enabled',
          'You\'ll receive beautiful daily reminders to connect with your inner wisdom.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error updating notification preference:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
    }
  };

  const formatTime = (time24: string) => {
    const [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push({
          value: time24,
          label: formatTime(time24)
        });
      }
    }
    return times;
  };

  const messageStyles = [
    {
      id: 'mystical' as const,
      title: 'Mystical',
      description: 'Cosmic, magical, universe-focused',
      icon: '✨',
      example: 'Your cosmic guidance awaits'
    },
    {
      id: 'gentle' as const,
      title: 'Gentle',
      description: 'Peaceful, nurturing, soft approach',
      icon: '🌸',
      example: 'A moment for your soul'
    },
    {
      id: 'motivational' as const,
      title: 'Motivational',
      description: 'Empowering, action-oriented',
      icon: '🚀',
      example: 'Unlock your inner power'
    }
  ];

  const SettingItem = ({ icon: Icon, title, subtitle, onPress, rightElement, isDestructive = false }) => (
    <Pressable style={styles.itemContainer} onPress={onPress}>
      <View style={[styles.iconContainer, isDestructive && { backgroundColor: 'rgba(239, 68, 68, 0.1)'}]}>
        <Icon size={22} color={isDestructive ? '#F87171' : '#3B82F6'} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, isDestructive && { color: '#F87171'}]}>{title}</Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.rightElement}>
        {rightElement}
      </View>
    </Pressable>
  );

  const TimePickerModal = () => (
    <Modal
      visible={showTimePicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowTimePicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Notification Time</Text>
            <Pressable onPress={() => setShowTimePicker(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
          </View>
          
          <ScrollView style={styles.timeOptions} showsVerticalScrollIndicator={false}>
            {generateTimeOptions().map((time) => (
              <Pressable
                key={time.value}
                style={[
                  styles.timeOption,
                  notificationPrefs.preferredTime === time.value && styles.timeOptionSelected
                ]}
                onPress={() => {
                  updatePreference('preferredTime', time.value);
                  setShowTimePicker(false);
                }}
              >
                <Text style={[
                  styles.timeOptionText,
                  notificationPrefs.preferredTime === time.value && styles.timeOptionTextSelected
                ]}>
                  {time.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const StylePickerModal = () => (
    <Modal
      visible={showStylePicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowStylePicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Message Style</Text>
            <Pressable onPress={() => setShowStylePicker(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
          </View>
          
          <View style={styles.styleOptions}>
            {messageStyles.map((style) => (
              <Pressable
                key={style.id}
                style={[
                  styles.styleOption,
                  notificationPrefs.messageStyle === style.id && styles.styleOptionSelected
                ]}
                onPress={() => {
                  updatePreference('messageStyle', style.id);
                  setShowStylePicker(false);
                }}
              >
                <Text style={styles.styleEmoji}>{style.icon}</Text>
                <View style={styles.styleContent}>
                  <Text style={[
                    styles.styleTitle,
                    notificationPrefs.messageStyle === style.id && styles.styleTextSelected
                  ]}>
                    {style.title}
                  </Text>
                  <Text style={styles.styleDescription}>{style.description}</Text>
                  <Text style={styles.styleExample}>"{style.example}"</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0a0a0a', '#171717', '#0a0a0a']} style={StyleSheet.absoluteFill} />
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <SettingsIcon size={28} color="#3B82F6" />
          <Text style={styles.title}>Settings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading preferences...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#171717', '#0a0a0a']}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <SettingsIcon size={28} color="#3B82F6" />
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            icon={User}
            title="Profile"
            onPress={() => router.push('/profile')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Reminders</Text>
          
          <SettingItem
            icon={Bell}
            title="Enable Notifications"
            subtitle="Receive daily reminders for your card readings"
            rightElement={
              <Switch
                value={notificationPrefs.enabled}
                onValueChange={(value) => updatePreference('enabled', value)}
                trackColor={{ false: '#374151', true: '#3B82F6' }}
                thumbColor={notificationPrefs.enabled ? '#F9FAFB' : '#6B7280'}
              />
            }
          />

          {notificationPrefs.enabled && (
            <>
              <SettingItem
                icon={Clock}
                title="Notification Time"
                subtitle={`Daily reminder at ${formatTime(notificationPrefs.preferredTime)}`}
                onPress={() => setShowTimePicker(true)}
              />

              <SettingItem
                icon={Sparkles}
                title="Message Style"
                subtitle={`${messageStyles.find(s => s.id === notificationPrefs.messageStyle)?.title} messages`}
                onPress={() => setShowStylePicker(true)}
              />

              <SettingItem
                icon={Calendar}
                title="Weekend Reminders"
                subtitle="Include weekends in daily notifications"
                rightElement={
                  <Switch
                    value={notificationPrefs.weekendsEnabled}
                    onValueChange={(value) => updatePreference('weekendsEnabled', value)}
                    trackColor={{ false: '#374151', true: '#3B82F6' }}
                    thumbColor={notificationPrefs.weekendsEnabled ? '#F9FAFB' : '#6B7280'}
                  />
                }
              />
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <SettingItem
            icon={Music}
            title="Ambient Sounds"
            subtitle="Enhance your practice with nature and cosmic sounds"
            onPress={() => router.push('/ambient-sounds')}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & More</Text>
          <SettingItem
            icon={CreditCard}
            title="Manage Subscription"
            onPress={() => Alert.alert('Subscription', 'Manage your subscription here.')}
          />
          <SettingItem
            icon={HelpCircle}
            title="Help & Support"
            onPress={() => Alert.alert('Help', 'Contact support@example.com for help.')}
          />
        </View>

        <View style={[styles.section, {marginTop: 24, alignItems: 'center'}]}>
          <SignOutTestButton />
        </View>
      </ScrollView>

      <TimePickerModal />
      <StylePickerModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
    paddingRight: 20, // Extra padding for Android switches
    minHeight: 70, // Consistent height for toggle items
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    paddingRight: 12, // Space before right element/switch
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#F3F4F6',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  rightElement: {
    marginLeft: 12,
    minWidth: 60, // Ensure switches have enough space on Android
    alignItems: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 85, 99, 0.3)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F3F4F6',
  },
  modalCancel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  
  // Time picker styles
  timeOptions: {
    maxHeight: 300,
  },
  timeOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 85, 99, 0.2)',
  },
  timeOptionSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  timeOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    textAlign: 'center',
  },
  timeOptionTextSelected: {
    color: '#3B82F6',
    fontFamily: 'Inter-SemiBold',
  },
  
  // Style picker styles
  styleOptions: {
    padding: 20,
  },
  styleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
  },
  styleOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  styleEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  styleContent: {
    flex: 1,
  },
  styleTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F3F4F6',
    marginBottom: 4,
  },
  styleTextSelected: {
    color: '#3B82F6',
  },
  styleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  styleExample: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    fontStyle: 'italic',
  },
});