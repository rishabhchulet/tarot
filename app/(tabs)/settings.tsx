import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, User, Heart, CreditCard, CircleHelp as HelpCircle, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import { scheduleNotification, cancelAllNotifications } from '@/utils/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { getSubscriptionStatus } from '@/utils/database';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    const status = await getSubscriptionStatus();
    setSubscriptionStatus(status);
  };

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    
    if (value) {
      await scheduleNotification();
    } else {
      await cancelAllNotifications();
    }
  };

  const handleProfile = () => {
    console.log('📱 Navigating to profile...');
    router.push('/profile');
  };

  const handleSubscription = () => {
    console.log('📱 Navigating to subscription...');
    // For now, just show an alert since paywall isn't implemented
    Alert.alert(
      'Subscription',
      'Subscription management coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleHelpSupport = () => {
    console.log('📱 Help & Support pressed');
    Alert.alert(
      'Help & Support',
      'For support, please contact us at support@dailytarot.com',
      [{ text: 'OK' }]
    );
  };

  const handleSignOut = () => {
    console.log('🚪 Sign out pressed');
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            console.log('🚪 Confirming sign out...');
            try {
              await signOut();
              console.log('✅ Sign out successful, navigating to auth...');
              router.replace('/auth');
            } catch (error) {
              console.error('❌ Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Icon size={24} color="#9CA3AF" strokeWidth={2} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement}
    </Pressable>
  );

  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.userName}>Welcome back, {user?.name || 'friend'}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem
            icon={Bell}
            title="Daily Reminders"
            subtitle="Get gentle reminders for your daily practice"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#374151', true: '#F59E0B' }}
                thumbColor={notificationsEnabled ? '#FFFFFF' : '#9CA3AF'}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <SettingItem
            icon={CreditCard}
            title={subscriptionStatus?.has_active_subscription ? 'Manage Subscription' : 'Upgrade to Premium'}
            subtitle={
              subscriptionStatus?.has_active_subscription 
                ? 'You have unlimited access' 
                : subscriptionStatus?.trialDaysLeft > 0 
                  ? `${subscriptionStatus.trialDaysLeft} trial days remaining`
                  : 'Trial expired - Subscribe to continue'
            }
            onPress={handleSubscription}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            icon={User}
            title="Profile"
            subtitle="Manage your personal information"
            onPress={handleProfile}
          />
          <SettingItem
            icon={HelpCircle}
            title="Help & Support"
            subtitle="Get answers to common questions"
            onPress={handleHelpSupport}
          />
        </View>

        <View style={styles.section}>
          <SettingItem
            icon={LogOut}
            title="Sign Out"
            subtitle="Sign out of your account"
            onPress={handleSignOut}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>Daily Tarot Reflection v1.0</Text>
          <Text style={styles.footerText}>Made with ♡ for your spiritual journey</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F3F4F6',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  version: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});