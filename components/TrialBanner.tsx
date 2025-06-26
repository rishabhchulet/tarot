import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Clock } from 'lucide-react-native';
import { router } from 'expo-router';

interface TrialBannerProps {
  subscriptionStatus: any;
}

export function TrialBanner({ subscriptionStatus }: TrialBannerProps) {
  if (!subscriptionStatus || subscriptionStatus.hasActiveSubscription) {
    return null;
  }

  const handleUpgrade = () => {
    router.push('/paywall');
  };

  if (subscriptionStatus.trialExpired) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#DC2626', '#B91C1C']}
          style={styles.expiredBanner}
        >
          <Crown size={20} color="#FFFFFF" />
          <Text style={styles.expiredText}>Trial Expired</Text>
          <Pressable style={styles.upgradeButton} onPress={handleUpgrade}>
            <Text style={styles.upgradeButtonText}>Subscribe</Text>
          </Pressable>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F59E0B', '#D97706']}
        style={styles.trialBanner}
      >
        <Clock size={20} color="#FFFFFF" />
        <Text style={styles.trialText}>
          {subscriptionStatus.trialDaysLeft} days left in trial
        </Text>
        <Pressable style={styles.upgradeButton} onPress={handleUpgrade}>
          <Text style={styles.upgradeButtonText}>Upgrade</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  trialText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 8,
  },
  expiredText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 8,
  },
  upgradeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});