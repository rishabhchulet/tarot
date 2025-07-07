import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard, FloatingAction, ParticleSystem, designTokens, animationHelpers } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { Bell, User, Heart, CreditCard, CircleHelp as HelpCircle, LogOut, Settings as SettingsIcon, Crown, ChevronRight, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { scheduleNotification, cancelAllNotifications } from '@/utils/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { getSubscriptionStatus } from '@/utils/database';
import { SignOutTestButton } from '@/components/SignOutTestButton';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withDelay,
  interpolate
} from 'react-native-reanimated';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Enhanced animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(40);
  const backgroundGlow = useSharedValue(0);
  const sectionsOpacity = useSharedValue(0);

  console.log('signOut from useAuth at render:', signOut);

  useEffect(() => {
    loadSubscriptionStatus();
    startSettingsAnimations();
  }, []);

  const startSettingsAnimations = () => {
    // Background glow
    backgroundGlow.value = withTiming(1, { duration: 2000 });
    
    // Staggered entrance animations
    setTimeout(() => {
      animationHelpers.fadeIn(headerOpacity, 800);
      headerTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 200);

    setTimeout(() => {
      animationHelpers.fadeIn(sectionsOpacity, 600);
    }, 600);

    setTimeout(() => {
      animationHelpers.fadeIn(contentOpacity, 800);
      contentTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 1000);
  };

  const loadSubscriptionStatus = async () => {
    try {
      const status = await getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error loading subscription status:', error);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    await HapticManager.triggerSelection();
    setNotificationsEnabled(value);
    
    if (value) {
      await scheduleNotification();
    } else {
      await cancelAllNotifications();
    }
  };

  const handleProfile = async () => {
    await HapticManager.triggerSelection();
    console.log('📱 Navigating to profile...');
    router.push('/profile');
  };

  const handleSubscription = async () => {
    await HapticManager.triggerSelection();
    console.log('📱 Navigating to subscription...');
    // For now, just show an alert since paywall isn't implemented
    Alert.alert(
      'Subscription',
      'Subscription management coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleHelpSupport = async () => {
    await HapticManager.triggerSelection();
    console.log('📱 Help & Support pressed');
    Alert.alert(
      'Help & Support',
      'For support, please contact us at support@dailyinner.com',
      [{ text: 'OK' }]
    );
  };

  const handleSignOut = async () => {
    await HapticManager.triggerSelection();
    console.log('signOut from useAuth (in handleSignOut):', signOut);
    console.log('🚪 Sign out pressed');
    
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            console.log('Sign out Alert onPress fired, signOut is:', signOut);
            setIsSigningOut(true);
            signOut?.().catch(error => {
              console.error('Sign out error:', error);
            });
          }
        }
      ]
    );
  };

  // Enhanced animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const sectionsStyle = useAnimatedStyle(() => ({
    opacity: sectionsOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const backgroundGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backgroundGlow.value, [0, 1], [0, 0.5]),
  }));

  const EnhancedSettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    rightElement,
    disabled = false,
    accentColor = designTokens.colors.accent.brightBlue,
    showChevron = false,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    disabled?: boolean;
    accentColor?: string;
    showChevron?: boolean;
  }) => (
    <Pressable 
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      accessibilityRole="button"
    >
      <GlassCard 
        style={[styles.settingItem, disabled && styles.settingItemDisabled]} 
        intensity="medium"
      >
        <View style={styles.settingLeft}>
          <FloatingAction style={[styles.iconContainer, { borderColor: accentColor }]}>
            <Icon 
              size={20} 
              color={disabled ? designTokens.colors.text.muted : accentColor} 
              strokeWidth={1.5} 
            />
          </FloatingAction>
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, disabled && styles.settingTitleDisabled]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.settingSubtitle, disabled && styles.settingSubtitleDisabled]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.settingRight}>
          {rightElement}
          {showChevron && (
            <FloatingAction style={styles.chevronContainer}>
              <ChevronRight size={16} color={designTokens.colors.text.muted} />
            </FloatingAction>
          )}
        </View>
      </GlassCard>
    </Pressable>
  );

  const EnhancedSwitch = ({ value, onValueChange }: { value: boolean; onValueChange: (value: boolean) => void }) => (
    <Pressable 
      style={[styles.switchContainer, value && styles.switchContainerActive]}
      onPress={() => onValueChange(!value)}
    >
      <View style={[styles.switchTrack, value && styles.switchTrackActive]}>
        <Animated.View style={[
          styles.switchThumb, 
          value && styles.switchThumbActive,
          { transform: [{ translateX: value ? 20 : 2 }] }
        ]}>
          {value && <Sparkles size={12} color={designTokens.colors.text.primary} />}
        </Animated.View>
      </View>
    </Pressable>
  );

  return (
    <LinearGradient
      colors={designTokens.colors.gradients.cosmic}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ParticleSystem count={12} animate={true} />
        
        {/* Enhanced Background Glow */}
        <Animated.View style={[styles.backgroundGlow, backgroundGlowStyle]} />

        {/* Enhanced Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.headerContent}>
            <FloatingAction style={styles.titleIcon}>
              <SettingsIcon size={32} color={designTokens.colors.accent.purple} strokeWidth={1.5} />
            </FloatingAction>
            <View style={styles.titleSection}>
              <Text style={styles.title}>Settings</Text>
              <Text style={styles.userName}>Welcome back, {user?.name || 'friend'}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Content */}
        <Animated.View style={[styles.contentContainer, contentStyle]}>
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View style={sectionsStyle}>
              {/* Enhanced Notifications Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Bell size={18} color={designTokens.colors.accent.brightBlue} />
                  <Text style={styles.sectionTitle}>Notifications</Text>
                </View>
                <EnhancedSettingItem
                  icon={Bell}
                  title="Daily Reminders"
                  subtitle="Get gentle reminders for your daily practice"
                  accentColor={designTokens.colors.accent.brightBlue}
                  rightElement={
                    <EnhancedSwitch
                      value={notificationsEnabled}
                      onValueChange={toggleNotifications}
                    />
                  }
                />
              </View>

              {/* Enhanced Subscription Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Crown size={18} color={designTokens.colors.accent.gold} />
                  <Text style={styles.sectionTitle}>Subscription</Text>
                </View>
                <EnhancedSettingItem
                  icon={Crown}
                  title={subscriptionStatus?.has_active_subscription ? 'Manage Subscription' : 'Upgrade to Premium'}
                  subtitle={
                    subscriptionStatus?.has_active_subscription 
                      ? 'You have unlimited access' 
                      : subscriptionStatus?.trialDaysLeft > 0 
                        ? `${subscriptionStatus.trialDaysLeft} trial days remaining`
                        : 'Trial expired - Subscribe to continue'
                  }
                  onPress={handleSubscription}
                  accentColor={designTokens.colors.accent.gold}
                  showChevron={true}
                />
              </View>

              {/* Enhanced Account Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <User size={18} color={designTokens.colors.accent.purple} />
                  <Text style={styles.sectionTitle}>Account</Text>
                </View>
                <EnhancedSettingItem
                  icon={User}
                  title="Profile"
                  subtitle="Manage your personal information"
                  onPress={handleProfile}
                  accentColor={designTokens.colors.accent.purple}
                  showChevron={true}
                />
                <EnhancedSettingItem
                  icon={HelpCircle}
                  title="Help & Support"
                  subtitle="Get answers to common questions"
                  onPress={handleHelpSupport}
                  accentColor={designTokens.colors.accent.brightBlue}
                  showChevron={true}
                />
              </View>

              {/* Enhanced Sign Out Section */}
              <View style={styles.section}>
                <GlassCard style={styles.signOutCard} intensity="medium">
                  <View style={styles.signOutHeader}>
                    <LogOut size={18} color={designTokens.colors.accent.rose} />
                    <Text style={styles.signOutTitle}>Account Actions</Text>
                  </View>
                  <Pressable onPress={handleSignOut} style={styles.signOutButton}>
                    <View style={styles.signOutContent}>
                      <FloatingAction style={styles.signOutIcon}>
                        <LogOut size={20} color={designTokens.colors.accent.rose} strokeWidth={1.5} />
                      </FloatingAction>
                      <Text style={styles.signOutText}>Sign Out</Text>
                    </View>
                  </Pressable>
                </GlassCard>
              </View>

              {/* Enhanced Footer */}
              <View style={styles.footer}>
                <GlassCard style={styles.footerCard} intensity="light">
                  <View style={styles.footerContent}>
                    <Heart size={16} color={designTokens.colors.accent.rose} />
                    <Text style={styles.version}>Daily Inner Reflection v1.0</Text>
                  </View>
                  <Text style={styles.footerText}>Made with ♡ for your inner journey</Text>
                </GlassCard>
              </View>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  backgroundGlow: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    right: '15%',
    height: '35%',
    borderRadius: 120,
    backgroundColor: designTokens.colors.accent.purple,
    opacity: 0.3,
  },

  // Enhanced Header
  header: {
    paddingHorizontal: designTokens.spacing.md,
    paddingTop: designTokens.spacing.lg,
    paddingBottom: designTokens.spacing.md,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.md,
  },

  titleIcon: {
    padding: designTokens.spacing.sm,
  },

  titleSection: {
    flex: 1,
  },

  title: {
    fontSize: designTokens.typography.fontSize['3xl'],
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
  },

  userName: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.muted,
    marginTop: designTokens.spacing.xs,
  },

  // Enhanced Content
  contentContainer: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.xxxl,
  },

  // Enhanced Sections
  section: {
    marginBottom: designTokens.spacing.xl,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.sm,
  },

  sectionTitle: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
  },

  // Enhanced Setting Items
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.md,
    marginBottom: designTokens.spacing.sm,
  },

  settingItemDisabled: {
    opacity: 0.5,
  },

  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconContainer: {
    padding: designTokens.spacing.sm,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
    borderRadius: designTokens.borderRadius.md,
  },

  settingText: {
    marginLeft: designTokens.spacing.md,
    flex: 1,
  },

  settingTitle: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
  },

  settingTitleDisabled: {
    color: designTokens.colors.text.muted,
  },

  settingSubtitle: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.secondary,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.sm,
  },

  settingSubtitleDisabled: {
    color: designTokens.colors.text.muted,
  },

  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },

  chevronContainer: {
    padding: designTokens.spacing.xs,
  },

  // Enhanced Switch
  switchContainer: {
    padding: designTokens.spacing.xs,
  },

  switchContainerActive: {
    // Add any active state styling if needed
  },

  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: designTokens.colors.glass.background,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
    justifyContent: 'center',
    position: 'relative',
  },

  switchTrackActive: {
    backgroundColor: designTokens.colors.accent.gold,
    borderColor: designTokens.colors.accent.gold,
  },

  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: designTokens.colors.text.muted,
    position: 'absolute',
    left: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  switchThumbActive: {
    backgroundColor: designTokens.colors.text.primary,
    left: 22,
  },

  // Enhanced Sign Out Section
  signOutCard: {
    paddingVertical: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.md,
  },

  signOutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.md,
  },

  signOutTitle: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
  },

  signOutButton: {
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: designTokens.colors.accent.rose,
    backgroundColor: designTokens.colors.glass.background,
  },

  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.md,
  },

  signOutIcon: {
    padding: designTokens.spacing.xs,
  },

  signOutText: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.accent.rose,
  },

  // Enhanced Footer
  footer: {
    marginTop: designTokens.spacing.lg,
  },

  footerCard: {
    paddingVertical: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.md,
    alignItems: 'center',
  },

  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.sm,
  },

  version: {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium as any,
    color: designTokens.colors.text.secondary,
  },

  footerText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
  },
});