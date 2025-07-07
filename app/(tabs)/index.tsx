import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Dimensions, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { TarotCardFlow } from '@/components/TarotCardFlow';
import { TrialBanner } from '@/components/TrialBanner';
import { MagicalCardDraw } from '@/components/MagicalCardDraw';
import { GlassCard, ModernButton, FloatingAction, ParticleSystem, designTokens, animationHelpers } from '@/components/DesignSystem';
import { Sparkles, Star, Zap, Moon, Sun, BookOpen, Calendar, Play, Eye, Heart } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getSubscriptionStatus, hasDrawnCardToday, getTodaysEntry } from '@/utils/database';
import { HapticManager } from '@/utils/nativeFeatures';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Floating particle component
const FloatingParticle = ({ delay = 0, duration = 4000, size = 4, color = '#F59E0B' }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Start animation with delay
    setTimeout(() => {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-50, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: duration / 4 }),
          withTiming(0.3, { duration: duration / 2 }),
          withTiming(0, { duration: duration / 4 })
        ),
        -1,
        false
      );

      scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: duration / 4 }),
          withTiming(1.2, { duration: duration / 2 }),
          withTiming(0.8, { duration: duration / 4 })
        ),
        -1,
        true
      );
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.particle, animatedStyle, { 
      width: size, 
      height: size, 
      backgroundColor: color,
      borderRadius: size / 2 
    }]} />
  );
};

export default function TodayScreen() {
  const { user } = useAuth();
  const [hasDrawnToday, setHasDrawnToday] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showCardFlow, setShowCardFlow] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [todaysEntry, setTodaysEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Enhanced time-based data with new design
  const [timeData, setTimeData] = useState(() => {
    const now = new Date();
    const hour = now.getHours();
    
    console.log('🕐 Enhanced time calculation:', {
      currentTime: now.toLocaleTimeString(),
      hour: hour,
      timestamp: now.getTime()
    });
    
    const isDaytime = hour >= 6 && hour < 20;
    
    let greeting;
    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    const IconComponent = isDaytime ? Sun : Moon;
    const iconColor = isDaytime ? designTokens.colors.accent.amber : designTokens.colors.accent.lavender;
    
    return { greeting, IconComponent, iconColor, isDaytime };
  });

  // Enhanced animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(50);
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);
  const floatingElements = useSharedValue(0);
  const backgroundGlow = useSharedValue(0);
  const particlesActive = useSharedValue(0);

  useEffect(() => {
    checkTodaysStatus();
    checkSubscription();
    startEnhancedAnimations();
  }, []);

  const checkTodaysStatus = async () => {
    try {
      const drawn = await hasDrawnCardToday();
      const entry = await getTodaysEntry();
      
      console.log('✨ Enhanced status check:', { drawn, hasEntry: !!entry });
      
      setHasDrawnToday(drawn);
      setTodaysEntry(entry);
    } catch (error) {
      console.error('❌ Enhanced status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    const status = await getSubscriptionStatus();
    setSubscriptionStatus(status);
  };

  const startEnhancedAnimations = () => {
    // Staggered entrance animations
    animationHelpers.fadeIn(headerOpacity, 800);
    headerTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    
    setTimeout(() => {
      animationHelpers.fadeIn(cardOpacity, 600);
      cardScale.value = withSpring(1, designTokens.animations.spring.bouncy);
    }, 300);

    setTimeout(() => {
      floatingElements.value = withRepeat(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, 800);

    // Background glow animation
    backgroundGlow.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Activate particles
    setTimeout(() => {
      particlesActive.value = 1;
    }, 1200);
  };

  const handleCardPull = async () => {
    if (subscriptionStatus && !subscriptionStatus.hasActiveSubscription && subscriptionStatus.trialExpired) {
      Alert.alert(
        'Trial Expired',
        'Your free trial has ended. Subscribe to continue your daily tarot practice.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Subscribe', onPress: () => router.push('/paywall') }
        ]
      );
      return;
    }
    
    await HapticManager.triggerCardReveal();
    setIsDrawing(true);
  };

  const handleDrawComplete = () => {
    console.log('🎴 Enhanced draw complete, starting card flow...');
    setIsDrawing(false);
    setShowCardFlow(true);
  };

  const handleViewTodaysQuestion = async () => {
    console.log('📖 Enhanced navigation to today\'s question...');
    await HapticManager.triggerSelection();
    router.push('/daily-question');
  };

  const handleViewJournal = async () => {
    console.log('📚 Enhanced navigation to journal...');
    await HapticManager.triggerSelection();
    router.push('/(tabs)/journal');
  };

  const handleCardFlowComplete = () => {
    setShowCardFlow(false);
    checkTodaysStatus();
  };

  // Enhanced animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const cardContainerStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [
      { 
        translateY: interpolate(
          floatingElements.value,
          [0, 1],
          [0, -10]
        )
      }
    ],
  }));

  const backgroundGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      backgroundGlow.value,
      [0, 1],
      [0.3, 0.7]
    ),
  }));

  // Enhanced loading screen
  if (loading) {
    return (
      <LinearGradient
        colors={designTokens.colors.gradients.cosmic}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ParticleSystem count={8} animate={true} />
          <View style={styles.loadingContainer}>
            <FloatingAction style={styles.loadingIcon}>
              <Sparkles size={48} color={designTokens.colors.accent.gold} />
            </FloatingAction>
            <Text style={styles.loadingText}>Connecting with your inner wisdom...</Text>
            <Text style={styles.loadingSubtext}>Preparing your daily reflection</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Enhanced drawing state
  if (isDrawing) {
    return (
      <LinearGradient
        colors={designTokens.colors.gradients.cosmic}
        style={styles.container}
      >
        <MagicalCardDraw onComplete={handleDrawComplete} />
      </LinearGradient>
    );
  }

  // Enhanced card flow
  if (showCardFlow) {
    return (
      <LinearGradient
        colors={designTokens.colors.gradients.cosmic}
        style={styles.container}
      >
        <TarotCardFlow onComplete={handleCardFlowComplete} />
      </LinearGradient>
    );
  }

  // Enhanced completion state
  if (hasDrawnToday && todaysEntry) {
    return (
      <LinearGradient
        colors={designTokens.colors.gradients.mystical}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ParticleSystem count={6} animate={true} color={designTokens.colors.accent.emerald} />
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <Animated.View style={[styles.completedHeader, headerStyle]}>
              <GlassCard style={styles.completedCard}>
                <View style={styles.completedIcon}>
                  <Star size={32} color={designTokens.colors.accent.emerald} />
                </View>
                <Text style={styles.completedTitle}>Today's Practice Complete</Text>
                <Text style={styles.completedSubtitle}>
                  Your wisdom for {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </GlassCard>
            </Animated.View>

            <Animated.View style={[styles.cardSummaryContainer, cardContainerStyle]}>
              <GlassCard style={styles.cardSummary}>
                <Text style={styles.cardSummaryTitle}>Your Card Today</Text>
                <Text style={styles.cardName}>{todaysEntry.card_name}</Text>
                {todaysEntry.card_keywords && (
                  <View style={styles.keywords}>
                    {todaysEntry.card_keywords.slice(0, 3).map((keyword: string, index: number) => (
                      <GlassCard key={index} style={styles.keyword}>
                        <Text style={styles.keywordText}>{keyword}</Text>
                      </GlassCard>
                    ))}
                  </View>
                )}
              </GlassCard>
            </Animated.View>

            <View style={styles.actionGrid}>
              <ModernButton
                title="View Reflection"
                onPress={handleViewTodaysQuestion}
                variant="gradient"
                size="lg"
                icon={Eye}
                style={styles.actionButton}
              />
              
              <ModernButton
                title="Journal Entry"
                onPress={handleViewJournal}
                variant="secondary"
                size="lg"
                icon={BookOpen}
                style={styles.actionButton}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Enhanced main state - ready to draw
  return (
    <LinearGradient
      colors={designTokens.colors.gradients.cosmic}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ParticleSystem count={12} animate={true} />
        
        {/* Enhanced Background Glow */}
        <Animated.View style={[styles.backgroundGlow, backgroundGlowStyle]} />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Enhanced Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <GlassCard style={styles.timeCard}>
              <Animated.View style={floatingStyle}>
                <timeData.IconComponent 
                  size={24} 
                  color={timeData.iconColor} 
                />
              </Animated.View>
              <Text style={styles.greeting}>{timeData.greeting}</Text>
              <Text style={styles.welcomeText}>Ready for your daily reflection?</Text>
            </GlassCard>
          </Animated.View>

          {/* Enhanced Main Card */}
          <Animated.View style={[styles.mainCardContainer, cardContainerStyle]}>
            <GlassCard style={styles.intentionCard} intensity="strong">
              <View style={styles.intentionContent}>
                <View style={styles.intentionIcon}>
                  <Heart size={48} color={designTokens.colors.accent.rose} />
                </View>
                <Text style={styles.intentionTitle}>Connect with Your Inner Wisdom</Text>
                <Text style={styles.intentionDescription}>
                  Draw your daily card to receive guidance and begin your reflection practice.
                </Text>
                
                <ModernButton
                  title="Draw Your Card"
                  onPress={handleCardPull}
                  variant="gradient"
                  size="lg"
                  icon={Sparkles}
                  style={styles.drawButton}
                />
              </View>
            </GlassCard>
          </Animated.View>

          {/* Enhanced Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Your Practice</Text>
            <View style={styles.actionGrid}>
              <GlassCard style={styles.quickActionCard} onPress={handleViewJournal}>
                <BookOpen size={24} color={designTokens.colors.accent.blue} />
                <Text style={styles.quickActionText}>Journal</Text>
              </GlassCard>
              
              <GlassCard style={styles.quickActionCard} onPress={() => router.push('/(tabs)/calendar')}>
                <Calendar size={24} color={designTokens.colors.accent.purple} />
                <Text style={styles.quickActionText}>Calendar</Text>
              </GlassCard>
              
              <GlassCard style={styles.quickActionCard} onPress={() => router.push('/breathing')}>
                <Play size={24} color={designTokens.colors.accent.emerald} />
                <Text style={styles.quickActionText}>Breathe</Text>
              </GlassCard>
            </View>
          </View>
        </ScrollView>

        {/* Trial Banner */}
        {subscriptionStatus && !subscriptionStatus.hasActiveSubscription && (
          <TrialBanner />
        )}
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
    top: screenHeight * 0.1,
    left: screenWidth * 0.1,
    right: screenWidth * 0.1,
    height: screenHeight * 0.4,
    borderRadius: screenWidth * 0.4,
    backgroundColor: designTokens.colors.accent.purple,
    opacity: 0.2,
    transform: [{ scale: 0.8 }],
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: designTokens.spacing.md,
  },

  // Enhanced Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: designTokens.spacing.lg,
  },

  loadingIcon: {
    padding: designTokens.spacing.xl,
  },

  loadingText: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
  },

  loadingSubtext: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
  },

  // Enhanced Header Styles
  header: {
    marginTop: designTokens.spacing.xl,
    marginBottom: designTokens.spacing.lg,
  },

  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.lg,
  },

  greeting: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
    flex: 1,
  },

  welcomeText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
  },

  // Enhanced Main Card Styles
  mainCardContainer: {
    marginBottom: designTokens.spacing.xl,
  },

  intentionCard: {
    paddingVertical: designTokens.spacing.xl,
    alignItems: 'center',
  },

  intentionContent: {
    alignItems: 'center',
    gap: designTokens.spacing.md,
  },

  intentionIcon: {
    marginBottom: designTokens.spacing.sm,
  },

  intentionTitle: {
    fontSize: designTokens.typography.fontSize['3xl'],
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.tight * designTokens.typography.fontSize['3xl'],
  },

  intentionDescription: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
    marginBottom: designTokens.spacing.md,
  },

  drawButton: {
    marginTop: designTokens.spacing.md,
    minWidth: 200,
  },

  // Enhanced Completed State Styles
  completedHeader: {
    marginTop: designTokens.spacing.xl,
    marginBottom: designTokens.spacing.lg,
  },

  completedCard: {
    alignItems: 'center',
    paddingVertical: designTokens.spacing.xl,
  },

  completedIcon: {
    marginBottom: designTokens.spacing.md,
  },

  completedTitle: {
    fontSize: designTokens.typography.fontSize['2xl'],
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.sm,
  },

  completedSubtitle: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
  },

  cardSummaryContainer: {
    marginBottom: designTokens.spacing.xl,
  },

  cardSummary: {
    paddingVertical: designTokens.spacing.xl,
  },

  cardSummaryTitle: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.accent,
    marginBottom: designTokens.spacing.md,
    textAlign: 'center',
  },

  cardName: {
    fontSize: designTokens.typography.fontSize['2xl'],
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
  },

  keywords: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: designTokens.spacing.sm,
    flexWrap: 'wrap',
  },

  keyword: {
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
  },

  keywordText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.accent,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },

  // Enhanced Quick Actions
  quickActions: {
    marginBottom: designTokens.spacing.xxxl,
  },

  quickActionsTitle: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.lg,
    textAlign: 'center',
  },

  actionGrid: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
    justifyContent: 'space-between',
  },

  actionButton: {
    flex: 1,
  },

  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.lg,
  },

  quickActionText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.secondary,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },
});