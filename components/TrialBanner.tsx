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
  const pulseAnimation = useSharedValue(1);
  const sparkleAnimation = useSharedValue(0);

  useEffect(() => {
    // Subtle glow animation (reduced intensity)
    glowAnimation.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Remove pulse animation for cleaner look
    pulseAnimation.value = 1;

    // Sparkle animation (slower and more subtle)
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
    const glowOpacity = interpolate(glowAnimation.value, [0, 1], [0.4, 0.7]);
    
    return {
      opacity: glowOpacity,
    };
  });

  const animatedPulseStyle = useAnimatedStyle(() => ({
    // Remove scaling for cleaner appearance
    opacity: 1,
  }));

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
    // User is on trial
    const daysLeft = subscription.trialEnd 
      ? Math.ceil((new Date(subscription.trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return (
      <Pressable style={styles.container} onPress={() => router.push('/onboarding/subscription')}>
        <Animated.View style={[styles.trialGlowContainer, animatedGlowStyle]}>
          <LinearGradient
            colors={['rgba(251, 191, 36, 0.4)', 'rgba(251, 191, 36, 0.1)']}
            style={styles.trialGlowEffect}
          />
        </Animated.View>
        
        <Animated.View style={[styles.fancyContainer, animatedPulseStyle]}>
          <LinearGradient
            colors={['rgba(251, 191, 36, 0.25)', 'rgba(251, 191, 36, 0.1)']}
            style={styles.fancyGradient}
          >
            <View style={styles.content}>
              <Clock size={16} color="#fbbf24" />
              <Text style={styles.trialText}>
                {daysLeft > 0 ? `${daysLeft} days left in trial` : 'Trial ending soon'}
              </Text>
              <Text style={styles.upgradeText}>Tap to upgrade</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  // User has no subscription - show fancy upgrade prompt
  return (
    <Pressable style={styles.container} onPress={() => router.push('/onboarding/subscription')}>
      {/* Outer glow effect */}
      <Animated.View style={[styles.outerGlowContainer, animatedGlowStyle]}>
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.6)', 'rgba(139, 92, 246, 0.4)', 'rgba(99, 102, 241, 0.6)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.outerGlowEffect}
        />
      </Animated.View>

      {/* Main container with pulse */}
      <Animated.View style={[styles.fancyContainer, animatedPulseStyle]}>
        {/* Sparkle effects */}
        <Animated.View style={[styles.sparkleContainer, animatedSparkleStyle]}>
          <Sparkles size={12} color="#a78bfa" style={[styles.sparkle, { top: 8, right: 12 }]} />
          <Sparkles size={8} color="#c4b5fd" style={[styles.sparkle, { bottom: 8, left: 16 }]} />
          <Sparkles size={10} color="#8b5cf6" style={[styles.sparkle, { top: 12, left: '50%' }]} />
        </Animated.View>

        {/* Main gradient background */}
        <LinearGradient
          colors={[
            'rgba(99, 102, 241, 0.25)', 
            'rgba(139, 92, 246, 0.15)', 
            'rgba(99, 102, 241, 0.25)'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fancyGradient}
        >
          {/* Inner border effect */}
          <View style={styles.innerBorder}>
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Zap size={16} color="#6366f1" />
              </View>
              <Text style={styles.fancyUpgradeText}>Unlock full cosmic potential</Text>
              <View style={styles.fancyUpgradeBadge}>
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  style={styles.badgeGradient}
                >
                  <Text style={styles.fancyBadgeText}>UPGRADE</Text>
                </LinearGradient>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  gradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
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
  // New animated styles
  trialGlowContainer: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    zIndex: -1,
  },
  trialGlowEffect: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },
  fancyContainer: {
    position: 'relative',
    zIndex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fancyGradient: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  innerBorder: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 10,
    zIndex: -1,
  },
  iconContainer: {
    padding: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 12,
  },
  fancyUpgradeText: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#8b5cf6',
    flex: 1,
    marginLeft: 4,
    textShadowColor: 'rgba(139, 92, 246, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  fancyUpgradeBadge: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  badgeGradient: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fancyBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-Black',
    color: '#ffffff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    zIndex: -2,
  },
  outerGlowEffect: {
    flex: 1,
    borderRadius: 18,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 20,
  },
});