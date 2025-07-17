import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Zap, Calendar, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSubscription } from '@/contexts/SubscriptionContext';

export function TrialBanner() {
  const { subscription, hasActiveSubscription, isOnTrial, canAccessPremiumFeatures } = useSubscription();

  // Don't show banner if user has lifetime subscription
  if (subscription.plan === 'lifetime') {
    return null;
  }

  // Show different content based on subscription status
  if (hasActiveSubscription()) {
    // User has active paid subscription
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Crown size={16} color="#10b981" />
            <Text style={styles.premiumText}>Premium Active</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planText}>{subscription.plan.toUpperCase()}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (isOnTrial()) {
    // User is on trial
    const daysLeft = subscription.trialEnd 
      ? Math.ceil((new Date(subscription.trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return (
      <Pressable style={styles.container} onPress={() => router.push('/onboarding/subscription')}>
        <LinearGradient
          colors={['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.05)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Clock size={16} color="#fbbf24" />
            <Text style={styles.trialText}>
              {daysLeft > 0 ? `${daysLeft} days left in trial` : 'Trial ending soon'}
            </Text>
            <Text style={styles.upgradeText}>Tap to upgrade</Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  // User has no subscription - show upgrade prompt
  return (
    <Pressable style={styles.container} onPress={() => router.push('/onboarding/subscription')}>
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.15)', 'rgba(99, 102, 241, 0.05)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Zap size={16} color="#6366f1" />
          <Text style={styles.upgradePromptText}>Unlock full cosmic potential</Text>
          <View style={styles.upgradeBadge}>
            <Text style={styles.badgeText}>UPGRADE</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10b981',
    flex: 1,
  },
  trialText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fbbf24',
    flex: 1,
  },
  upgradePromptText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6366f1',
    flex: 1,
  },
  upgradeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
  },
  planBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  upgradeBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  planText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#10b981',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#6366f1',
  },
});