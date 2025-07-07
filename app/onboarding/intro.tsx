import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles, Star, Zap } from 'lucide-react-native';
import { GlassCard, ModernButton, FloatingAction, ParticleSystem, designTokens, animationHelpers } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { startFreeTrial } from '@/utils/database';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withSequence,
  interpolate
} from 'react-native-reanimated';

export default function IntroScreen() {
  const [loading, setLoading] = useState(false);

  // Enhanced animation values
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(40);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);
  const backgroundGlow = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);
  const floatingElements = useSharedValue(0);

  useEffect(() => {
    startEnhancedIntroAnimations();
  }, []);

  const startEnhancedIntroAnimations = () => {
    // Background effects
    backgroundGlow.value = withTiming(1, { duration: 2000 });
    sparkleRotation.value = withSequence(
      withTiming(10, { duration: 1000 }),
      withTiming(-10, { duration: 1000 }),
      withTiming(0, { duration: 1000 })
    );

    // Floating elements
    floatingElements.value = withTiming(1, { duration: 3000 });

    // Staggered entrance animations
    setTimeout(() => {
      animationHelpers.fadeIn(titleOpacity, 1000);
      titleScale.value = withSpring(1, designTokens.animations.spring.bouncy);
    }, 300);

    setTimeout(() => {
      animationHelpers.fadeIn(contentOpacity, 800);
      contentTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 800);

    setTimeout(() => {
      animationHelpers.fadeIn(buttonOpacity, 600);
      buttonTranslateY.value = withSpring(0, designTokens.animations.spring.bouncy);
    }, 1200);
  };

  const handleContinue = async () => {
    console.log('🎉 Enhanced intro: Starting free trial and navigating to tutorial...');
    
    if (!loading) {
      await HapticManager.triggerSuccess();
      setLoading(true);
      
      try {
        console.log('💾 Starting free trial...');
        await startFreeTrial();
        console.log('✅ Free trial started successfully');
      } catch (error) {
        console.error('❌ Error starting free trial:', error);
      }
      
      console.log('📱 Navigating to tutorial...');
      router.replace('/onboarding/tutorial');
      setLoading(false);
    }
  };

  // Enhanced animated styles
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      { scale: titleScale.value },
      { rotate: `${sparkleRotation.value}deg` }
    ],
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
    opacity: interpolate(backgroundGlow.value, [0, 1], [0, 0.8]),
  }));

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [
      { 
        translateY: interpolate(
          floatingElements.value,
          [0, 1],
          [0, -20]
        )
      },
      { 
        rotate: `${interpolate(
          floatingElements.value,
          [0, 1],
          [0, 360]
        )}deg` 
      }
    ],
  }));

  return (
    <LinearGradient
      colors={designTokens.colors.gradients.cosmic}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ParticleSystem count={30} animate={true} />
        
        {/* Enhanced Background Glow */}
        <Animated.View style={[styles.backgroundGlow, backgroundGlowStyle]} />
        
        {/* Floating Decorative Elements */}
        <Animated.View style={[styles.floatingElement, styles.floatingElement1, floatingStyle]}>
          <Star size={16} color={designTokens.colors.accent.gold} opacity={0.6} />
        </Animated.View>
        
        <Animated.View style={[styles.floatingElement, styles.floatingElement2, floatingStyle]}>
          <Zap size={14} color={designTokens.colors.accent.brightBlue} opacity={0.5} />
        </Animated.View>

        <View style={styles.content}>
          {/* Enhanced Title Section */}
          <Animated.View style={[styles.titleSection, titleStyle]}>
            <FloatingAction style={styles.titleIcon}>
              <Sparkles size={60} color={designTokens.colors.accent.gold} strokeWidth={1.5} />
            </FloatingAction>
            
            <Text style={styles.title}>Rad.</Text>
          </Animated.View>
          
          {/* Enhanced Content Section */}
          <Animated.View style={[styles.contentSection, contentStyle]}>
            <GlassCard style={styles.messageCard} intensity="medium">
              <Text style={styles.subtitle}>
                You're almost ready to reveal your first reflection…
              </Text>
              
              <Text style={styles.subtitle}>
                And connect deeply with your inner truths.
              </Text>
              
              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>
                  First, take a look at how this tool works with your inner guidance…
                  And how to get the most out of it.
                </Text>
              </View>
            </GlassCard>
          </Animated.View>
        </View>
        
        {/* Enhanced Action Button */}
        <Animated.View style={[styles.actionContainer, buttonStyle]}>
          <GlassCard style={styles.buttonCard} intensity="strong">
            <ModernButton
              title={loading ? 'Setting up your journey...' : 'Let\'s go'}
              onPress={handleContinue}
              variant="gradient"
              size="lg"
              disabled={loading}
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
    top: '25%',
    left: '20%',
    right: '20%',
    height: '40%',
    borderRadius: 150,
    backgroundColor: designTokens.colors.accent.purple,
    opacity: 0.4,
  },

  // Floating Elements
  floatingElement: {
    position: 'absolute',
  },

  floatingElement1: {
    top: '15%',
    right: '15%',
  },

  floatingElement2: {
    bottom: '25%',
    left: '10%',
  },

  // Main Content
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: designTokens.spacing.xl,
  },

  // Enhanced Title
  titleSection: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.xxxl,
  },

  titleIcon: {
    padding: designTokens.spacing.lg,
    marginBottom: designTokens.spacing.xl,
  },

  title: {
    fontSize: designTokens.typography.fontSize['5xl'],
    fontWeight: designTokens.typography.fontWeight.extrabold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    textShadowColor: designTokens.colors.accent.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
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
    fontSize: designTokens.typography.fontSize.xl,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },

  descriptionContainer: {
    marginTop: designTokens.spacing.md,
    paddingTop: designTokens.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.glass.border,
  },

  description: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
    maxWidth: 320,
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