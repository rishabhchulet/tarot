import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Zap, Calendar, Clock, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate,
  withSequence,
  Easing
} from 'react-native-reanimated';

export function TrialBanner() {
  const { subscription, hasActiveSubscription, isOnTrial, canAccessPremiumFeatures } = useSubscription();

  // Animation values
  const glowAnimation = useSharedValue(0);
  const sparkleAnimation = useSharedValue(0);

  useEffect(() => {
    // Subtle glow animation
    glowAnimation.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Sparkle animation
    sparkleAnimation.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // Don't show banner if user has lifetime subscription
  if (subscription.plan === 'lifetime') {
    return null;
  }

  // Animated styles
  const animatedGlowStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(glowAnimation.value, [0, 1], [0.3, 0.6]);
    return {
      opacity: glowOpacity,
    };
  });

  const animatedSparkleStyle = useAnimatedStyle(() => {
    const rotation = interpolate(sparkleAnimation.value, [0, 1], [0, 360]);
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

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
    // User is on trial - ONLY show if they actually have a trial (after choosing a plan)
    const daysLeft = subscription.trialEnd 
      ? Math.ceil((new Date(subscription.trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return (
      <Pressable style={styles.container} onPress={() => router.push('/onboarding/subscription')}>        
        <View style={styles.trialContainer}>
          <LinearGradient
            colors={['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.05)']}
            style={styles.trialGradient}
          >
            <View style={styles.content}>
              <Clock size={16} color="#fbbf24" />
              <Text style={styles.trialText}>
                {daysLeft > 0 ? `${daysLeft} days left in trial` : 'Trial ending soon'}
              </Text>
              <Text style={styles.upgradeText}>Tap to upgrade</Text>
            </View>
          </LinearGradient>
        </View>
      </Pressable>
    );
  }

  // New users or users without subscription - show AMAZING upgrade prompt
  return (
    <Pressable style={styles.container} onPress={() => router.push('/onboarding/subscription')}>
      {/* Outer glow effect */}
      <Animated.View style={[styles.outerGlowContainer, animatedGlowStyle]}>
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.4)', 'rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.4)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.outerGlowEffect}
        />
      </Animated.View>

      {/* Main container */}
      <View style={styles.upgradeContainer}>
        {/* Sparkle effects */}
        <Animated.View style={[styles.sparkleContainer, animatedSparkleStyle]}>
          <Sparkles size={12} color="#a78bfa" style={[styles.sparkle, { top: 8, right: 12 }]} />
          <Sparkles size={8} color="#c4b5fd" style={[styles.sparkle, { bottom: 8, left: 16 }]} />
          <Sparkles size={10} color="#8b5cf6" style={[styles.sparkle, { top: 12, left: '50%' }]} />
        </Animated.View>

        {/* Main gradient background */}
        <LinearGradient
          colors={[
            'rgba(99, 102, 241, 0.2)', 
            'rgba(139, 92, 246, 0.1)', 
            'rgba(99, 102, 241, 0.2)'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.upgradeGradient}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Zap size={16} color="#6366f1" />
            </View>
            <Text style={styles.upgradePromptText}>Unlock your cosmic potential</Text>
            <View style={styles.upgradeBadge}>
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                style={styles.badgeGradient}
              >
                <Text style={styles.badgeText}>UPGRADE</Text>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  gradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#8b5cf6',
    flex: 1,
    marginLeft: 4,
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
    borderRadius: 8,
    overflow: 'hidden',
  },
  planText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#10b981',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter-Black',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  // Trial specific styles
  trialContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  trialGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  // Upgrade specific styles  
  upgradeContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  upgradeGradient: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 10,
  },
  badgeGradient: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: 'none',
  },
  sparkle: {
    position: 'absolute',
  },
  outerGlowContainer: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    zIndex: -2,
  },
  outerGlowEffect: {
    flex: 1,
    borderRadius: 20,
  },
});