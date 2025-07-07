import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles, Heart, Star, Moon } from 'lucide-react-native';
import { GlassCard, ModernButton, FloatingAction, ParticleSystem, designTokens, animationHelpers } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withRepeat,
  interpolate
} from 'react-native-reanimated';

export default function WelcomeScreen() {
  // Enhanced animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const logoRotation = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(40);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);
  const backgroundGlow = useSharedValue(0);
  const sparkleGlow = useSharedValue(0);
  const floatingElements = useSharedValue(0);

  useEffect(() => {
    startEnhancedWelcomeAnimations();
  }, []);

  const startEnhancedWelcomeAnimations = () => {
    // Background and magical effects
    backgroundGlow.value = withTiming(1, { duration: 3000 });
    sparkleGlow.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
    floatingElements.value = withRepeat(
      withTiming(1, { duration: 4000 }),
      -1,
      true
    );

    // Staggered entrance animations
    setTimeout(() => {
      animationHelpers.fadeIn(logoOpacity, 1000);
      logoScale.value = withSpring(1, designTokens.animations.spring.bouncy);
      logoRotation.value = withSpring(360, { duration: 1000 });
    }, 300);

    setTimeout(() => {
      animationHelpers.fadeIn(titleOpacity, 800);
      titleTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 800);

    setTimeout(() => {
      animationHelpers.fadeIn(contentOpacity, 800);
      contentTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 1200);

    setTimeout(() => {
      animationHelpers.fadeIn(buttonOpacity, 600);
      buttonTranslateY.value = withSpring(0, designTokens.animations.spring.bouncy);
    }, 1600);
  };

  const handleContinue = async () => {
    console.log('📱 Enhanced welcome: Navigating to name screen...');
    await HapticManager.triggerSelection();
    router.push('/onboarding/name');
  };

  // Enhanced animated styles
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` }
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const backgroundGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backgroundGlow.value, [0, 1], [0, 0.7]),
  }));

  const sparkleGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sparkleGlow.value, [0, 1], [0.6, 1]),
    transform: [
      { 
        scale: interpolate(sparkleGlow.value, [0, 1], [1, 1.1]) 
      }
    ],
  }));

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [
      { 
        translateY: interpolate(
          floatingElements.value,
          [0, 1],
          [0, -15]
        )
      }
    ],
  }));

  return (
    <LinearGradient
      colors={designTokens.colors.gradients.cosmic}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ParticleSystem count={35} animate={true} />
        
        {/* Enhanced Background Glow */}
        <Animated.View style={[styles.backgroundGlow, backgroundGlowStyle]} />
        
        {/* Floating Decorative Elements */}
        <Animated.View style={[styles.floatingElement, styles.floatingElement1, floatingStyle]}>
          <Heart size={18} color={designTokens.colors.accent.rose} opacity={0.7} />
        </Animated.View>
        
        <Animated.View style={[styles.floatingElement, styles.floatingElement2, floatingStyle]}>
          <Star size={20} color={designTokens.colors.accent.gold} opacity={0.6} />
        </Animated.View>
        
        <Animated.View style={[styles.floatingElement, styles.floatingElement3, floatingStyle]}>
          <Moon size={16} color={designTokens.colors.accent.lavender} opacity={0.5} />
        </Animated.View>

        <View style={styles.content}>
          {/* Enhanced Logo Section */}
          <Animated.View style={[styles.logoSection, logoStyle]}>
            <FloatingAction style={styles.iconContainer}>
              <Animated.View style={sparkleGlowStyle}>
                <Sparkles size={80} color={designTokens.colors.accent.gold} strokeWidth={1.5} />
              </Animated.View>
            </FloatingAction>
          </Animated.View>
          
          {/* Enhanced Title Section */}
          <Animated.View style={[styles.titleSection, titleStyle]}>
            <Text style={styles.title}>Welcome to{'\n'}Daily Inner Reflection</Text>
          </Animated.View>
          
          {/* Enhanced Content Section */}
          <Animated.View style={[styles.contentSection, contentStyle]}>
            <GlassCard style={styles.messageCard} intensity="medium">
              <Text style={styles.subtitle}>
                Connect directly with your inner wisdom through this daily mirror into yourself.
              </Text>
              
              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>
                  Let's set up your personalized journey of self-discovery and growth.
                </Text>
              </View>
              
              {/* Feature Highlights */}
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <Star size={16} color={designTokens.colors.accent.brightBlue} />
                  <Text style={styles.featureText}>Daily Guidance</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Heart size={16} color={designTokens.colors.accent.rose} />
                  <Text style={styles.featureText}>Inner Wisdom</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Sparkles size={16} color={designTokens.colors.accent.purple} />
                  <Text style={styles.featureText}>Personal Growth</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        </View>
        
        {/* Enhanced Action Button */}
        <Animated.View style={[styles.actionContainer, buttonStyle]}>
          <GlassCard style={styles.buttonCard} intensity="strong">
            <ModernButton
              title="Begin Your Journey"
              onPress={handleContinue}
              variant="gradient"
              size="lg"
              icon={Sparkles}
              style={styles.continueButton}
            />
          </GlassCard>
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
    paddingHorizontal: designTokens.spacing.md,
  },

  backgroundGlow: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    right: '15%',
    height: '50%',
    borderRadius: 200,
    backgroundColor: designTokens.colors.accent.purple,
    opacity: 0.4,
  },

  // Floating Elements
  floatingElement: {
    position: 'absolute',
  },

  floatingElement1: {
    top: '12%',
    right: '20%',
  },

  floatingElement2: {
    top: '18%',
    left: '15%',
  },

  floatingElement3: {
    bottom: '30%',
    right: '12%',
  },

  // Main Content
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: designTokens.spacing.xl,
  },

  // Enhanced Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.xl,
  },

  iconContainer: {
    padding: designTokens.spacing.xl,
  },

  // Enhanced Title
  titleSection: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.xl,
  },

  title: {
    fontSize: designTokens.typography.fontSize['3xl'],
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.tight * designTokens.typography.fontSize['3xl'],
    textShadowColor: designTokens.colors.accent.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },

  // Enhanced Content
  contentSection: {
    marginBottom: designTokens.spacing.xl,
  },

  messageCard: {
    paddingVertical: designTokens.spacing.xl,
    paddingHorizontal: designTokens.spacing.lg,
    alignItems: 'center',
  },

  subtitle: {
    fontSize: designTokens.typography.fontSize.lg,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.lg,
    maxWidth: 320,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },

  descriptionContainer: {
    marginBottom: designTokens.spacing.lg,
    paddingBottom: designTokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: designTokens.colors.glass.border,
  },

  description: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
    maxWidth: 300,
  },

  // Feature Highlights
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: designTokens.spacing.md,
  },

  featureItem: {
    alignItems: 'center',
    gap: designTokens.spacing.xs,
    flex: 1,
  },

  featureText: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.text.accent,
    fontWeight: designTokens.typography.fontWeight.medium as any,
    textAlign: 'center',
  },

  // Enhanced Action Button
  actionContainer: {
    paddingBottom: designTokens.spacing.xl,
  },

  buttonCard: {
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.lg,
  },

  continueButton: {
    minHeight: 56,
  },
});