import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles, Heart, Star, Moon, Zap } from 'lucide-react-native';
import { GlassCard, FloatingAction, ParticleSystem, designTokens, animationHelpers } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
  withSequence,
  withDelay
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  // Enhanced animation values for celestial theme
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const logoGlow = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.95);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(40);
  const cosmicGlow = useSharedValue(0);
  const starsOpacity = useSharedValue(0);
  const moonPhase = useSharedValue(0);
  const nebulaFlow = useSharedValue(0);

  useEffect(() => {
    startCelestialWelcomeAnimation();
  }, []);

  const startCelestialWelcomeAnimation = () => {
    // Cosmic background effects
    cosmicGlow.value = withTiming(1, { duration: 3000 });
    nebulaFlow.value = withRepeat(
      withTiming(1, { duration: 8000 }),
      -1,
      true
    );
    
    // Stars twinkling effect
    starsOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
        withTiming(0.6, { duration: 1000 })
      ),
      -1,
      false
    );

    // Moon phase animation
    moonPhase.value = withRepeat(
      withTiming(1, { duration: 6000 }),
      -1,
      true
    );

    // Staggered celestial entrance
    setTimeout(() => {
      // Logo with mystical glow
      logoOpacity.value = withTiming(1, { duration: 1200 });
      logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
      logoGlow.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    }, 400);

    setTimeout(() => {
      // Title with ethereal entrance
      titleOpacity.value = withTiming(1, { duration: 1000 });
      titleTranslateY.value = withSpring(0, { damping: 15, stiffness: 120 });
    }, 1000);

    setTimeout(() => {
      // Content with cosmic scale
      contentOpacity.value = withTiming(1, { duration: 1200 });
      contentScale.value = withSpring(1, { damping: 14, stiffness: 100 });
    }, 1500);

    setTimeout(() => {
      // Button with stellar entrance
      buttonOpacity.value = withTiming(1, { duration: 800 });
      buttonTranslateY.value = withSpring(0, { damping: 12, stiffness: 150 });
    }, 2000);
  };

  const handleContinue = async () => {
    console.log('🌟 Celestial welcome: Beginning journey...');
    await HapticManager.triggerSelection();
    router.push('/onboarding/name');
  };

  // Enhanced celestial animated styles
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const logoGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(logoGlow.value, [0, 1], [0.6, 1]),
    transform: [
      { scale: interpolate(logoGlow.value, [0, 1], [1, 1.05]) }
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const cosmicGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(cosmicGlow.value, [0, 1], [0, 0.8]),
    transform: [
      { scale: interpolate(cosmicGlow.value, [0, 1], [0.8, 1.2]) }
    ],
  }));

  const starsStyle = useAnimatedStyle(() => ({
    opacity: starsOpacity.value,
  }));

  const moonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(moonPhase.value, [0, 1], [0.4, 0.9]),
    transform: [
      { 
        rotate: `${interpolate(moonPhase.value, [0, 1], [0, 15])}deg` 
      }
    ],
  }));

  const nebulaStyle = useAnimatedStyle(() => ({
    opacity: interpolate(nebulaFlow.value, [0, 1], [0.3, 0.7]),
    transform: [
      { 
        translateX: interpolate(nebulaFlow.value, [0, 1], [-20, 20]) 
      },
      { 
        scale: interpolate(nebulaFlow.value, [0, 1], [1, 1.1]) 
      }
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Enhanced Cosmic Background */}
      <LinearGradient
        colors={['#0B0B1F', '#1A1A3A', '#2D2D5A']}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Nebula Flow Effect */}
      <Animated.View style={[styles.nebulaLayer, nebulaStyle]}>
        <LinearGradient
          colors={['rgba(79, 195, 247, 0.1)', 'rgba(156, 39, 176, 0.15)', 'rgba(63, 81, 181, 0.1)']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        {/* Enhanced Particle System */}
        <ParticleSystem count={25} animate={true} />
        
        {/* Cosmic Glow */}
        <Animated.View style={[styles.cosmicGlow, cosmicGlowStyle]} />
        
        {/* Floating Celestial Elements */}
        <Animated.View style={[styles.celestialElement, styles.star1, starsStyle]}>
          <Star size={12} color="#FFC107" fill="#FFC107" opacity={0.8} />
        </Animated.View>
        
        <Animated.View style={[styles.celestialElement, styles.star2, starsStyle]}>
          <Star size={8} color="#4FC3F7" fill="#4FC3F7" opacity={0.6} />
        </Animated.View>
        
        <Animated.View style={[styles.celestialElement, styles.star3, starsStyle]}>
          <Star size={10} color="#B39DDB" fill="#B39DDB" opacity={0.7} />
        </Animated.View>

        <Animated.View style={[styles.celestialElement, styles.moon1, moonStyle]}>
          <Moon size={16} color="#E8EAF6" fill="rgba(232, 234, 246, 0.3)" />
        </Animated.View>

        <View style={styles.content}>
          {/* Enhanced Logo Section with Mystical Glow */}
          <Animated.View style={[styles.logoSection, logoStyle]}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground} />
              <Animated.View style={[styles.logoGlow, logoGlowStyle]}>
                <Sparkles size={64} color="#FFC107" strokeWidth={1.5} />
              </Animated.View>
            </View>
          </Animated.View>
          
          {/* Enhanced Title with Cosmic Typography */}
          <Animated.View style={[styles.titleSection, titleStyle]}>
            <Text style={styles.readyText}>Ready to start your journey</Text>
            <Text style={styles.title}>Daily Inner{'\n'}Reflection</Text>
          </Animated.View>
          
          {/* Enhanced Content with Better Glassmorphism */}
          <Animated.View style={[styles.contentSection, contentStyle]}>
            <GlassCard style={styles.mainCard} intensity="medium">
              <Text style={styles.subtitle}>
                Connect directly with your inner wisdom through this daily mirror into yourself
              </Text>
              
              {/* Enhanced Feature Cards */}
              <View style={styles.featuresContainer}>
                <View style={styles.featureRow}>
                  <View style={styles.featureCard}>
                    <View style={styles.featureIcon}>
                      <Star size={20} color="#FFC107" />
                    </View>
                    <Text style={styles.featureLabel}>Daily Guidance</Text>
                  </View>
                  
                  <View style={styles.featureCard}>
                    <View style={styles.featureIcon}>
                      <Heart size={20} color="#FF3B30" />
                    </View>
                    <Text style={styles.featureLabel}>Inner Wisdom</Text>
                  </View>
                  
                  <View style={styles.featureCard}>
                    <View style={styles.featureIcon}>
                      <Zap size={20} color="#B39DDB" />
                    </View>
                    <Text style={styles.featureLabel}>Personal Growth</Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        </View>
        
        {/* Enhanced Action Button */}
        <Animated.View style={[styles.actionContainer, buttonStyle]}>
          <Pressable onPress={handleContinue} style={styles.continueButton}>
            <LinearGradient
              colors={['#4FC3F7', '#3F51B5']}
              style={styles.buttonGradient}
            >
              <Sparkles size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.buttonText}>Begin Your Journey</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  nebulaLayer: {
    ...StyleSheet.absoluteFillObject,
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },

  cosmicGlow: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    right: '10%',
    height: '60%',
    borderRadius: 300,
    backgroundColor: 'rgba(63, 81, 181, 0.2)',
  },

  // Celestial Elements
  celestialElement: {
    position: 'absolute',
  },

  star1: {
    top: '18%',
    right: '15%',
  },

  star2: {
    top: '25%',
    left: '12%',
  },

  star3: {
    bottom: '35%',
    right: '20%',
  },

  moon1: {
    top: '12%',
    left: '20%',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },

  // Enhanced Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },

  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoBackground: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },

  logoGlow: {
    padding: 28,
  },

  // Enhanced Typography
  titleSection: {
    alignItems: 'center',
    marginBottom: 50,
  },

  readyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },

  // Enhanced Content Section
  contentSection: {
    marginBottom: 50,
  },

  mainCard: {
    padding: 32,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
    fontWeight: '400',
  },

  // Enhanced Features
  featuresContainer: {
    alignItems: 'center',
  },

  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },

  featureCard: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 16,
  },

  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  featureLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Enhanced Action Button
  actionContainer: {
    paddingBottom: 40,
    paddingHorizontal: 4,
  },

  continueButton: {
    height: 56,
    borderRadius: 16,
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },

  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});