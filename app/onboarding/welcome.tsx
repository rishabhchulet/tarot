import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles, Heart, Star, Moon } from 'lucide-react-native';
import { GlassCard, FloatingAction, designTokens } from '@/components/DesignSystem';
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
  // Clean animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(40);
  const buttonOpacity = useSharedValue(0);
  const sparkleGlow = useSharedValue(0);

  useEffect(() => {
    startWelcomeAnimations();
  }, []);

  const startWelcomeAnimations = () => {
    // Clean entrance animations
    setTimeout(() => {
      logoOpacity.value = withTiming(1, { duration: 800 });
      logoScale.value = withSpring(1, designTokens.animations.spring.gentle);
    }, 300);

    setTimeout(() => {
      titleOpacity.value = withTiming(1, { duration: 800 });
      titleTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 600);

    setTimeout(() => {
      contentOpacity.value = withTiming(1, { duration: 800 });
      contentTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 900);

    setTimeout(() => {
      buttonOpacity.value = withTiming(1, { duration: 600 });
    }, 1200);

    // Subtle sparkle animation
    sparkleGlow.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  };

  const handleContinue = async () => {
    console.log('📱 Welcome: Navigating to name screen...');
    await HapticManager.triggerSelection();
    router.push('/onboarding/name');
  };

  // Animation styles
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
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
  }));

  const sparkleGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sparkleGlow.value, [0, 1], [0.7, 1]),
    transform: [{ scale: interpolate(sparkleGlow.value, [0, 1], [1, 1.05]) }],
  }));

  return (
    <LinearGradient
      colors={designTokens.colors.gradients.main}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo Section */}
          <Animated.View style={[styles.logoSection, logoStyle]}>
            <View style={styles.iconContainer}>
              <Animated.View style={sparkleGlowStyle}>
                <Sparkles size={80} color={designTokens.colors.accent.gold} strokeWidth={1.5} />
              </Animated.View>
            </View>
          </Animated.View>
          
          {/* Title Section */}
          <Animated.View style={[styles.titleSection, titleStyle]}>
            <Text style={styles.title}>Daily Inner{'\n'}Reflection</Text>
          </Animated.View>
          
          {/* Content Section */}
          <Animated.View style={[styles.contentSection, contentStyle]}>
            <GlassCard style={styles.messageCard}>
              <Text style={styles.subtitle}>
                Connect directly with your inner wisdom through this daily mirror into yourself
              </Text>
              
              <Text style={styles.description}>
                Join thousands discovering their path to self-connection and spiritual growth
              </Text>
            </GlassCard>
          </Animated.View>
        </View>
        
        {/* Begin Button */}
        <Animated.View style={[styles.buttonSection, buttonStyle]}>
          <FloatingAction onPress={handleContinue}>
            <GlassCard style={styles.beginButton} intensity="medium">
              <View style={styles.buttonContent}>
                <Sparkles size={20} color={designTokens.colors.accent.gold} strokeWidth={1.5} />
                <Text style={styles.buttonText}>Begin Your Journey</Text>
              </View>
            </GlassCard>
          </FloatingAction>
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
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: designTokens.spacing.xl,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.xxxl,
  },

  iconContainer: {
    padding: designTokens.spacing.lg,
  },

  // Title Section
  titleSection: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.xxxl,
  },

  title: {
    fontSize: 42,
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    lineHeight: 50,
  },

  // Content Section
  contentSection: {
    width: '100%',
    marginBottom: designTokens.spacing.xxxl,
  },

  messageCard: {
    backgroundColor: designTokens.colors.background.tertiary,
    padding: designTokens.spacing.xl,
    alignItems: 'center',
  },

  subtitle: {
    fontSize: designTokens.typography.fontSize.lg,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.lg,
    marginBottom: designTokens.spacing.lg,
  },

  description: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
  },

  // Button Section
  buttonSection: {
    paddingHorizontal: designTokens.spacing.xl,
    paddingBottom: designTokens.spacing.xxxl,
  },

  beginButton: {
    backgroundColor: designTokens.colors.accent.primary,
    paddingVertical: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.xl,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designTokens.spacing.sm,
  },

  buttonText: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
  },
});