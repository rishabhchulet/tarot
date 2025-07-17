import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  withDelay
} from 'react-native-reanimated';
import { 
  Sparkles, 
  Star, 
  Users, 
  Zap, 
  Heart, 
  Eye,
  X,
  Crown
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

const { width, height } = Dimensions.get('window');

// Floating star animation component
const FloatingStar = ({ index }: { index: number }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    const delay = index * 500;
    
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(20, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  const positions = [
    { top: '10%', left: '15%' },
    { top: '20%', right: '20%' },
    { top: '40%', left: '10%' },
    { top: '60%', right: '15%' },
    { top: '75%', left: '20%' },
    { top: '85%', right: '25%' },
  ];

  return (
    <Animated.View style={[styles.floatingStar, positions[index % positions.length], animatedStyle]}>
      <Star size={12} color="#fbbf24" fill="#fbbf24" />
    </Animated.View>
  );
};

const SUBSCRIPTION_PLANS = [
  {
    id: 'lifetime',
    title: 'Lifetime',
    price: '$79.99',
    description: 'Pay Once',
    savings: null,
    popular: false,
    features: ['Unlimited daily readings', 'Full AI insights', 'Premium features forever'],
  },
  {
    id: 'yearly',
    title: 'Yearly',
    price: '$39.99',
    description: '7-Days Free',
    savings: 'Most Popular',
    popular: true,
    features: ['7-day free trial', 'Auto-renewable', 'Cancel anytime'],
  },
  {
    id: 'weekly',
    title: 'Weekly',
    price: '$5.99',
    description: 'Hot Deal',
    savings: null,
    popular: false,
    features: ['Auto-renewable', 'Try before commitment', 'Perfect for exploring'],
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Personalized AI Wisdom',
    description: 'Get daily reflections crafted uniquely for your journey',
  },
  {
    icon: Star,
    title: 'Complete Astrology Chart',
    description: 'Discover your cosmic blueprint and planetary influences',
  },
  {
    icon: Users,
    title: 'Relationship Compatibility',
    description: 'Explore deep connections with others through cosmic insights',
  },
  {
    icon: Heart,
    title: 'Sacred Journal Space',
    description: 'Capture and reflect on your spiritual growth over time',
  },
];

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const { upgradeToLifetime, upgradeToYearly, upgradeToWeekly } = useSubscription();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);

  // Animation values
  const headerFade = useSharedValue(0);
  const featuresFade = useSharedValue(0);
  const plansFade = useSharedValue(0);
  const buttonFade = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance animations
    headerFade.value = withTiming(1, { duration: 800 });
    featuresFade.value = withDelay(400, withTiming(1, { duration: 800 }));
    plansFade.value = withDelay(800, withTiming(1, { duration: 800 }));
    buttonFade.value = withDelay(1200, withTiming(1, { duration: 800 }));
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerFade.value,
    transform: [{ translateY: (1 - headerFade.value) * 30 }],
  }));

  const featuresAnimatedStyle = useAnimatedStyle(() => ({
    opacity: featuresFade.value,
    transform: [{ translateY: (1 - featuresFade.value) * 30 }],
  }));

  const plansAnimatedStyle = useAnimatedStyle(() => ({
    opacity: plansFade.value,
    transform: [{ translateY: (1 - plansFade.value) * 30 }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonFade.value,
    transform: [{ translateY: (1 - buttonFade.value) * 30 }],
  }));

  const handleClose = () => {
    // Navigate to main app home page
    router.replace('/(tabs)');
  };

  const handleContinueWithPlan = async () => {
    setLoading(true);
    
    try {
      // Process subscription based on selected plan
      switch (selectedPlan) {
        case 'lifetime':
          await upgradeToLifetime();
          break;
        case 'yearly':
          await upgradeToYearly();
          break;
        case 'weekly':
          await upgradeToWeekly();
          break;
        default:
          console.warn('Unknown plan selected:', selectedPlan);
      }
      
      console.log('✅ Subscription processed successfully');
      
      // Force refresh subscription status from database
      setTimeout(() => {
        // Small delay to ensure database write has completed
        window.location.href = '/(tabs)';
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error processing subscription:', error);
      // For now, continue anyway since we're not doing real payments
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipForNow = () => {
    // Continue to main app without subscription
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Beautiful Starfield Background */}
      <LinearGradient
        colors={['#1a0a2e', '#16213e', '#0f3460', '#533483']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Stars */}
      {Array.from({ length: 6 }).map((_, index) => (
        <FloatingStar key={index} index={index} />
      ))}

      {/* Close Button */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <X size={24} color="#E0F2FE" />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View style={[styles.headerSection, headerAnimatedStyle]}>
          <View style={styles.greetingContainer}>
            <Crown size={32} color="#fbbf24" />
            <Text style={styles.greeting}>
              {user?.name ? `${user.name}, ` : ''}Unlock Your Full Cosmic Potential
            </Text>
          </View>
          <Text style={styles.subtitle}>
            Step into the complete experience of daily wisdom, cosmic insights, and personal transformation
          </Text>
        </Animated.View>

        {/* Features Section */}
        <Animated.View style={[styles.featuresSection, featuresAnimatedStyle]}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <feature.icon size={20} color="#fbbf24" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Pricing Plans */}
        <Animated.View style={[styles.plansSection, plansAnimatedStyle]}>
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Pressable
              key={plan.id}
              style={[
                styles.planCard,
                plan.popular && styles.planCardPopular, // Always apply popular style for popular plans
                selectedPlan === plan.id && styles.planCardSelected, // Selected style overrides everything
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}
              {plan.savings && !plan.popular && (
                <View style={styles.dealBadge}>
                  <Text style={styles.dealText}>{plan.savings}</Text>
                </View>
              )}
              
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.planPrice}>{plan.price}</Text>
              <Text style={styles.planDescription}>{plan.description}</Text>
              
              {plan.id === 'yearly' && (
                <Text style={styles.trialNote}>
                  Try 7 days free, then {plan.price}/year. Cancel anytime.
                </Text>
              )}
            </Pressable>
          ))}
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.actionsSection, buttonAnimatedStyle]}>
          <Pressable 
            style={styles.primaryButton} 
            onPress={handleContinueWithPlan}
            disabled={loading}
          >
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Processing...' : 'GET FULL ACCESS'}
              </Text>
              {!loading && <Zap size={20} color="#FFFFFF" />}
            </LinearGradient>
          </Pressable>

          <Pressable 
            style={styles.couponButton} 
            onPress={() => router.push('/coupon-code')}
          >
            <Text style={styles.couponButtonText}>
              <Text>Have a coupon code? </Text>
              <Text style={styles.couponButtonLink}>Redeem here</Text>
            </Text>
          </Pressable>

          <Pressable style={styles.skipButton} onPress={handleSkipForNow}>
            <Text style={styles.skipButtonText}>Continue with limited access</Text>
          </Pressable>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Terms of Use  •  Privacy Policy  •  Restore</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  floatingStar: {
    position: 'absolute',
    zIndex: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 24,
    marginHorizontal: 20,
  },
  featuresSection: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    lineHeight: 20,
  },
  plansSection: {
    marginBottom: 32,
    gap: 16,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 3,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  planCardPopular: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  dealBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dealText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  planTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontFamily: 'Inter-Black',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    marginBottom: 8,
  },
  trialNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 32,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  couponButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  couponButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#D1D5DB',
    textAlign: 'center',
  },
  couponButtonLink: {
    color: '#8B5CF6',
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#475569',
  },
}); 