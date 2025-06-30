import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { TarotCardFlow } from '@/components/TarotCardFlow';
import { TrialBanner } from '@/components/TrialBanner';
import { MagicalCardDraw } from '@/components/MagicalCardDraw';
import { Sparkles, Star, Zap, Moon, Sun, BookOpen, Calendar } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getSubscriptionStatus, hasDrawnCardToday, getTodaysEntry } from '@/utils/database';
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
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [todaysEntry, setTodaysEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // CRITICAL: Single source of truth for time-based data
  const [timeData, setTimeData] = useState(() => {
    const now = new Date();
    const hour = now.getHours();
    
    console.log('🕐 Initial time calculation:', {
      currentTime: now.toLocaleTimeString(),
      hour: hour,
      timestamp: now.getTime()
    });
    
    // Determine if it's daytime (6 AM to 8 PM = Sun, otherwise Moon)
    const isDaytime = hour >= 6 && hour < 20;
    
    // Get greeting based on time
    let greeting;
    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    // Get icon and color
    const IconComponent = isDaytime ? Sun : Moon;
    const iconColor = isDaytime ? '#F59E0B' : '#E5E7EB';
    
    console.log('🎨 Time-based calculation result:', { 
      hour, 
      isDaytime, 
      greeting, 
      iconType: isDaytime ? 'Sun' : 'Moon',
      iconColor 
    });
    
    return { greeting, IconComponent, iconColor, isDaytime };
  });

  // Animation values
  const intentionBoxScale = useSharedValue(0.95);
  const buttonPulse = useSharedValue(1);
  const backgroundShimmer = useSharedValue(0);
  const starRotation = useSharedValue(0);
  const timeIconPulse = useSharedValue(1);

  useEffect(() => {
    checkTodaysStatus();
    checkSubscription();
    startMagicalAnimations();
    
    // Update time every minute to ensure accurate icon display
    const timeInterval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      
      console.log('⏰ Time interval update:', {
        currentTime: now.toLocaleTimeString(),
        hour: hour,
        timestamp: now.getTime()
      });
      
      // Determine if it's daytime (6 AM to 8 PM = Sun, otherwise Moon)
      const isDaytime = hour >= 6 && hour < 20;
      
      // Get greeting based on time
      let greeting;
      if (hour >= 5 && hour < 12) {
        greeting = 'Good morning';
      } else if (hour >= 12 && hour < 17) {
        greeting = 'Good afternoon';
      } else {
        greeting = 'Good evening';
      }
      
      // Get icon and color
      const IconComponent = isDaytime ? Sun : Moon;
      const iconColor = isDaytime ? '#F59E0B' : '#E5E7EB';
      
      console.log('🔄 Updated time-based data:', { 
        hour, 
        isDaytime, 
        greeting, 
        iconType: isDaytime ? 'Sun' : 'Moon',
        iconColor 
      });
      
      // Update state with new time data
      setTimeData({ greeting, IconComponent, iconColor, isDaytime });
    }, 60000); // Update every minute

    return () => clearInterval(timeInterval);
  }, []);

  const checkTodaysStatus = async () => {
    console.log('🔍 Checking today\'s card status...');
    setLoading(true);
    
    try {
      const drawnToday = await hasDrawnCardToday();
      const entry = await getTodaysEntry();
      
      console.log('📊 Today\'s status:', { drawnToday, hasEntry: !!entry });
      
      setHasDrawnToday(drawnToday);
      setTodaysEntry(entry);
    } catch (error) {
      console.error('❌ Error checking today\'s status:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    const status = await getSubscriptionStatus();
    setSubscriptionStatus(status);
  };

  const startMagicalAnimations = () => {
    // Intention box breathing animation
    intentionBoxScale.value = withRepeat(
      withTiming(1.02, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Button pulse animation
    buttonPulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );

    // Background shimmer
    backgroundShimmer.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    // Star rotation
    starRotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );

    // Time icon gentle pulse
    timeIconPulse.value = withRepeat(
      withTiming(1.1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  };

  const handleCardPull = () => {
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
    
    setIsDrawing(true);
  };

  const handleDrawComplete = () => {
    setIsDrawing(false);
    setHasDrawnToday(true);
    // Refresh today's entry
    checkTodaysStatus();
  };

  const handleViewTodaysQuestion = () => {
    console.log('📖 Navigating to today\'s question page...');
    router.push('/daily-question');
  };

  const handleViewJournal = () => {
    console.log('📚 Navigating to journal...');
    router.push('/(tabs)/journal');
  };

  // Animated styles
  const intentionBoxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: intentionBoxScale.value }],
  }));

  const buttonPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonPulse.value }],
  }));

  const backgroundShimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(backgroundShimmer.value, [0, 1], [-screenWidth, screenWidth]) }
    ],
    opacity: 0.1,
  }));

  const starRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${starRotation.value}deg` }],
  }));

  const timeIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timeIconPulse.value }],
  }));

  // Show different layouts based on state
  if (loading) {
    return (
      <LinearGradient
        colors={['#1F2937', '#374151', '#6B46C1']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Sparkles size={40} color="#F59E0B" />
          <Text style={styles.loadingText}>Checking your daily practice...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (isDrawing) {
    return (
      <LinearGradient
        colors={['#1F2937', '#374151', '#6B46C1']}
        style={styles.container}
      >
        <MagicalCardDraw onComplete={handleDrawComplete} />
      </LinearGradient>
    );
  }

  if (hasDrawnToday && todaysEntry) {
    return (
      <LinearGradient
        colors={['#1F2937', '#374151', '#6B46C1']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.completedHeader}>
            <Text style={styles.completedTitle}>Today's Practice Complete</Text>
            <Text style={styles.completedSubtitle}>
              You've drawn your card for {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>

          {/* Today's Card Summary */}
          <View style={styles.cardSummary}>
            <Text style={styles.cardSummaryTitle}>Your Card Today</Text>
            <Text style={styles.cardName}>{todaysEntry.card_name}</Text>
            {todaysEntry.card_keywords && (
              <View style={styles.keywords}>
                {todaysEntry.card_keywords.slice(0, 3).map((keyword: string, index: number) => (
                  <View key={index} style={styles.keyword}>
                    <Text style={styles.keywordText}>{keyword}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable style={styles.actionButton} onPress={handleViewTodaysQuestion}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.actionButtonGradient}
              >
                <BookOpen size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Today's Question</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={handleViewJournal}>
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.actionButtonGradient}
              >
                <Calendar size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>View Journal</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Next Card Info */}
          <View style={styles.nextCardInfo}>
            <Text style={styles.nextCardTitle}>Tomorrow's Practice</Text>
            <Text style={styles.nextCardText}>
              Return tomorrow for your next daily card and inner guidance.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // FIXED: Use the unified timeData state for both greeting and icon
  const { greeting, IconComponent, iconColor, isDaytime } = timeData;

  // Default state - enhanced with magical animations and SYNCHRONIZED time-based icon
  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      {/* Animated background shimmer */}
      <Animated.View style={[styles.backgroundShimmer, backgroundShimmerStyle]} />
      
      {/* Floating particles */}
      <View style={styles.particleContainer}>
        {[...Array(12)].map((_, index) => (
          <FloatingParticle
            key={index}
            delay={index * 500}
            duration={3000 + (index * 200)}
            size={Math.random() * 6 + 2}
            color={['#F59E0B', '#8B5CF6', '#3B82F6', '#10B981'][index % 4]}
          />
        ))}
      </View>

      {/* Constellation background */}
      <View style={styles.constellationContainer}>
        <Animated.View style={[styles.star, styles.star1, starRotationStyle]}>
          <Star size={8} color="#F59E0B" fill="#F59E0B" />
        </Animated.View>
        <Animated.View style={[styles.star, styles.star2, starRotationStyle]}>
          <Star size={6} color="#8B5CF6" fill="#8B5CF6" />
        </Animated.View>
        <Animated.View style={[styles.star, styles.star3, starRotationStyle]}>
          <Star size={10} color="#3B82F6" fill="#3B82F6" />
        </Animated.View>
        <Animated.View style={[styles.star, styles.star4, starRotationStyle]}>
          <Star size={7} color="#10B981" fill="#10B981" />
        </Animated.View>
        <Animated.View style={[styles.star, styles.star5, starRotationStyle]}>
          <Star size={5} color="#F59E0B" fill="#F59E0B" />
        </Animated.View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <TrialBanner subscriptionStatus={subscriptionStatus} />
        
        <View style={styles.header}>
          {/* FIXED: Time-based icon using the SAME timeData state */}
          <Animated.View style={[styles.timeIconContainer, timeIconStyle]}>
            <View style={[styles.iconGlow, { shadowColor: iconColor }]}>
              <IconComponent size={36} color={iconColor} strokeWidth={1.5} />
            </View>
          </Animated.View>

          {/* FIXED: Greeting text using the SAME timeData state */}
          <Text style={styles.greeting}>
            {greeting}, {user?.name || 'friend'}
          </Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        <View style={styles.pullContainer}>
          {/* Enhanced intention box with breathing animation */}
          <Animated.View style={[styles.intentionBox, intentionBoxStyle]}>
            {/* Magical border effect */}
            <LinearGradient
              colors={['#F59E0B', '#8B5CF6', '#3B82F6', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.intentionBorder}
            >
              <View style={styles.intentionContent}>
                {/* Floating sparkle in the box */}
                <View style={styles.intentionSparkleContainer}>
                  <Animated.View style={starRotationStyle}>
                    <Sparkles size={24} color="#F59E0B" />
                  </Animated.View>
                </View>
                
                <Text style={styles.intentionText}>
                  Take a breath and ask your heart:
                </Text>
                <Text style={styles.intentionQuestion}>
                  "Show me the message I most need today to connect with my True Self"
                </Text>
                
                {/* Mystical runes/symbols */}
                <View style={styles.mysticalSymbols}>
                  <Text style={styles.runeSymbol}>✦</Text>
                  <Text style={styles.runeSymbol}>◊</Text>
                  <Text style={styles.runeSymbol}>✦</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Enhanced button with pulse animation */}
          <Animated.View style={buttonPulseStyle}>
            <Pressable style={styles.pullButton} onPress={handleCardPull}>
              <LinearGradient
                colors={['#F59E0B', '#D97706', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pullButtonGradient}
              >
                {/* Button glow effect */}
                <View style={styles.buttonGlow} />
                
                {/* Button content */}
                <View style={styles.buttonContent}>
                  <Zap size={20} color="#FFFFFF" />
                  <Text style={styles.pullButtonText}>Draw Your Daily Card</Text>
                  <Sparkles size={16} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Enhanced mystical footer text with better visibility */}
          <Text style={styles.mysticalFooter}>
            ✨ One card, one day, one sacred moment ✨
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F3F4F6',
    textAlign: 'center',
  },
  
  // Background effects
  backgroundShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    transform: [{ skewX: '-15deg' }],
  },
  
  // Particle system
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    left: Math.random() * screenWidth,
    top: Math.random() * screenHeight,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Constellation background
  constellationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  star: {
    position: 'absolute',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  star1: { top: '15%', left: '10%' },
  star2: { top: '25%', right: '15%' },
  star3: { top: '45%', left: '5%' },
  star4: { top: '65%', right: '20%' },
  star5: { top: '80%', left: '25%' },
  
  // Header styles
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    position: 'relative',
  },
  timeIconContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 16,
    borderRadius: 25,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    marginBottom: 8,
    textShadowColor: 'rgba(245, 158, 11, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  date: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  
  // Pull container
  pullContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  // Enhanced intention box
  intentionBox: {
    marginBottom: 40,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  intentionBorder: {
    borderRadius: 24,
    padding: 3,
  },
  intentionContent: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderRadius: 21,
    padding: 32,
    alignItems: 'center',
    position: 'relative',
  },
  intentionSparkleContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  intentionText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  intentionQuestion: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  mysticalSymbols: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  runeSymbol: {
    fontSize: 16,
    color: '#8B5CF6',
    fontFamily: 'CormorantGaramond-Bold',
  },
  
  // Enhanced button
  pullButton: {
    borderRadius: 30,
    overflow: 'hidden',
    minWidth: 220,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  pullButtonGradient: {
    position: 'relative',
    overflow: 'hidden',
  },
  buttonGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 32,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 36,
    gap: 8,
  },
  pullButtonText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  // Enhanced mystical footer with better visibility
  mysticalFooter: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
    marginTop: 24,
    fontStyle: 'italic',
    textShadowColor: 'rgba(245, 158, 11, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  
  // Completed state styles
  completedHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#10B981',
    marginBottom: 8,
    textAlign: 'center',
  },
  completedSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  
  // Card summary
  cardSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  cardSummaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  cardName: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F59E0B',
    marginBottom: 16,
    textAlign: 'center',
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  keyword: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  keywordText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
  },
  
  // Action buttons
  actionButtons: {
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  
  // Next card info
  nextCardInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 40,
  },
  nextCardTitle: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F3F4F6',
    marginBottom: 8,
  },
  nextCardText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});