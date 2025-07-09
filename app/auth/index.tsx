import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles, CircleCheck as CheckCircle, Star, Moon, Sun } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AuthWelcomeScreen() {
  const { user, session } = useAuth();
  
  // Animation values
  const sparkleScale = useSharedValue(1);
  const sparkleRotation = useSharedValue(0);
  const starFloat1 = useSharedValue(0);
  const starFloat2 = useSharedValue(0);
  const starFloat3 = useSharedValue(0);
  const moonGlow = useSharedValue(0.5);
  const backgroundShimmer = useSharedValue(0);
  const titleGlow = useSharedValue(0);

  // CRITICAL: Add test to verify user is signed out
  useEffect(() => {
    console.log('🔍 Auth welcome screen loaded');
    console.log('👤 User state:', { hasUser: !!user, hasSession: !!session });
    
    if (user || session) {
      console.log('⚠️ WARNING: User still has session on auth screen!');
      console.log('User ID:', user?.id);
      console.log('Session exists:', !!session);
    } else {
      console.log('✅ Auth screen: User properly signed out');
    }
  }, [user, session]);

  useEffect(() => {
    // Main sparkle animation
    sparkleScale.value = withRepeat(
      withTiming(1.3, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    // Floating stars with different timings
    starFloat1.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    starFloat2.value = withDelay(1000, withRepeat(
      withSequence(
        withTiming(-15, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    ));

    starFloat3.value = withDelay(2000, withRepeat(
      withSequence(
        withTiming(-25, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    ));

    // Moon glow effect
    moonGlow.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Background shimmer
    backgroundShimmer.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.linear }),
      -1,
      false
    );

    // Title glow effect
    titleGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedSparkleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: sparkleScale.value },
        { rotate: `${sparkleRotation.value}deg` }
      ],
    };
  });

  const starFloat1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: starFloat1.value }],
    opacity: interpolate(starFloat1.value, [-20, 0], [0.6, 1]),
  }));

  const starFloat2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: starFloat2.value }],
    opacity: interpolate(starFloat2.value, [-15, 0], [0.7, 1]),
  }));

  const starFloat3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: starFloat3.value }],
    opacity: interpolate(starFloat3.value, [-25, 0], [0.5, 1]),
  }));

  const moonGlowStyle = useAnimatedStyle(() => ({
    opacity: moonGlow.value,
    transform: [{ scale: interpolate(moonGlow.value, [0.5, 1], [0.9, 1.1]) }],
  }));

  const backgroundShimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(backgroundShimmer.value, [0, 1], [-screenWidth, screenWidth]) }
    ],
    opacity: 0.1,
  }));

  const titleGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(titleGlow.value, [0.3, 1], [0.8, 1]),
    transform: [{ scale: interpolate(titleGlow.value, [0.3, 1], [0.98, 1.02]) }],
  }));

  return (
    <View style={styles.container}>
      {/* Enhanced Cosmic Background */}
      <LinearGradient
        colors={['#0A0A0F', '#1A1B2E', '#16213E', '#0F3460']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated background shimmer */}
      <Animated.View style={[styles.backgroundShimmer, backgroundShimmerStyle]} />

      {/* Floating cosmic elements */}
      <View style={styles.cosmicElements}>
        <Animated.View style={[styles.floatingStar, styles.star1, starFloat1Style]}>
          <Star size={12} color="#FFD700" fill="#FFD700" />
        </Animated.View>
        <Animated.View style={[styles.floatingStar, styles.star2, starFloat2Style]}>
          <Star size={8} color="#87CEEB" fill="#87CEEB" />
        </Animated.View>
        <Animated.View style={[styles.floatingStar, styles.star3, starFloat3Style]}>
          <Star size={10} color="#DDA0DD" fill="#DDA0DD" />
        </Animated.View>
        
        {/* Mystical moon */}
        <Animated.View style={[styles.mysticalMoon, moonGlowStyle]}>
          <Moon size={24} color="#E6E6FA" fill="#E6E6FA" />
        </Animated.View>
      </View>

      {/* CRITICAL: Add sign out verification indicator */}
      {!(user || session) && (
        <View style={styles.signOutSuccess}>
          <CheckCircle size={16} color="#10B981" />
          <Text style={styles.signOutSuccessText}>Successfully signed out</Text>
        </View>
      )}
      
      {(user || session) && (
        <View style={styles.signOutError}>
          <Text style={styles.signOutErrorText}>⚠️ Sign out incomplete</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Enhanced main icon with cosmic effects */}
        <View style={styles.iconSection}>
          <View style={styles.iconGlowContainer}>
            <Animated.View style={[styles.iconContainer, animatedSparkleStyle]}>
              <Sparkles size={120} color="#FFD700" strokeWidth={1.5} />
            </Animated.View>
            
            {/* Orbital rings */}
            <View style={styles.orbitalRing1} />
            <View style={styles.orbitalRing2} />
          </View>
        </View>
        
        {/* Enhanced title with glow effect */}
        <Animated.View style={[styles.titleSection, titleGlowStyle]}>
          <Text style={styles.title}>Daily Inner{'\n'}Reflection</Text>
          <View style={styles.titleUnderline} />
        </Animated.View>
        
        {/* Enhanced subtitle with better typography */}
        <Text style={styles.subtitle}>
          Connect directly with your inner wisdom through this daily mirror into yourself.
        </Text>
        
        {/* Enhanced description */}
        <Text style={styles.description}>
          Join thousands discovering their path to self-connection and growth through ancient wisdom and modern insight.
        </Text>
      </View>
      
      {/* Enhanced button section */}
      <View style={styles.buttonSection}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/auth/signup')}>
          <LinearGradient
            colors={['#FF6B35', '#F7931E', '#FFD700']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButtonGradient}
          >
            <Text style={styles.primaryButtonText}>Begin Your Journey</Text>
            <View style={styles.buttonSparkle}>
              <Sparkles size={16} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </Pressable>
        
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/auth/signin')}>
          <View style={styles.secondaryButtonContent}>
            <Text style={styles.secondaryButtonText}>
              Already have an account? <Text style={styles.secondaryButtonHighlight}>Sign In</Text>
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Mystical footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>✨ Your inner wisdom awaits ✨</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  
  // Enhanced background effects
  backgroundShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    transform: [{ skewX: '-15deg' }],
  },
  
  // Cosmic elements
  cosmicElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  floatingStar: {
    position: 'absolute',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  star1: {
    top: '15%',
    left: '10%',
  },
  star2: {
    top: '25%',
    right: '15%',
  },
  star3: {
    top: '70%',
    left: '20%',
  },
  mysticalMoon: {
    position: 'absolute',
    top: '8%',
    right: '8%',
    shadowColor: '#E6E6FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },
  
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  
  // Enhanced icon section
  iconSection: {
    marginBottom: 60,
    alignItems: 'center',
  },
  iconGlowContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 30,
    zIndex: 3,
  },
  orbitalRing1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    borderStyle: 'dashed',
    zIndex: 1,
  },
  orbitalRing2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(135, 206, 235, 0.15)',
    borderStyle: 'dashed',
    zIndex: 1,
  },
  
  // Enhanced title section
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 42,
    fontFamily: 'Inter-ExtraBold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 50,
    letterSpacing: -1,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  titleUnderline: {
    width: 80,
    height: 3,
    backgroundColor: '#FFD700',
    marginTop: 16,
    borderRadius: 2,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  
  // Enhanced typography
  subtitle: {
    fontSize: 20,
    fontFamily: 'Inter-Medium',
    color: '#E6E6FA',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
    maxWidth: 320,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#B0C4DE',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    opacity: 0.9,
  },
  
  // Enhanced button section
  buttonSection: {
    paddingHorizontal: 32,
    paddingBottom: 60,
    gap: 20,
  },
  primaryButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonSparkle: {
    opacity: 0.8,
  },
  
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  secondaryButtonContent: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    paddingBottom: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E6E6FA',
  },
  secondaryButtonHighlight: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFD700',
  },
  
  // Enhanced footer
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFD700',
    fontStyle: 'italic',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  
  // Sign out verification styles
  signOutSuccess: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 8,
    zIndex: 10,
  },
  signOutSuccessText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
  signOutError: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    zIndex: 10,
  },
  signOutErrorText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    textAlign: 'center',
  },
});