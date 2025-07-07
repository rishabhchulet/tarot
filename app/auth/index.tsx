import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles, CircleCheck as CheckCircle, Star, Heart, Zap } from 'lucide-react-native';
import { GlassCard, ModernButton, FloatingAction, ParticleSystem, designTokens, animationHelpers } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  interpolate
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthWelcomeScreen() {
  const { user, session } = useAuth();
  
  // Enhanced animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(50);
  const logoScale = useSharedValue(0.8);
  const logoRotation = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.9);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(30);
  const backgroundGlow = useSharedValue(0);
  const floatingElements = useSharedValue(0);

  // Debug logging for authentication state
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
    startEnhancedAuthAnimations();
  }, []);

  const startEnhancedAuthAnimations = () => {
    // Background glow animation
    backgroundGlow.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Staggered entrance animations
    setTimeout(() => {
      animationHelpers.fadeIn(headerOpacity, 1000);
      headerTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 300);

    // Logo animation
    setTimeout(() => {
      logoScale.value = withSpring(1, designTokens.animations.spring.bouncy);
      logoRotation.value = withSequence(
        withTiming(5, { duration: 500 }),
        withTiming(-5, { duration: 500 }),
        withTiming(0, { duration: 500 })
      );
    }, 800);

    // Card animation
    setTimeout(() => {
      animationHelpers.fadeIn(cardOpacity, 800);
      cardScale.value = withSpring(1, designTokens.animations.spring.gentle);
    }, 1200);

    // Buttons animation
    setTimeout(() => {
      animationHelpers.fadeIn(buttonsOpacity, 600);
      buttonsTranslateY.value = withSpring(0, designTokens.animations.spring.bouncy);
    }, 1600);

    // Floating elements
    setTimeout(() => {
      floatingElements.value = withRepeat(
        withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, 2000);
  };

  const handleGetStarted = async () => {
    await HapticManager.triggerSelection();
    router.push('/auth/signup');
  };

  const handleSignIn = async () => {
    await HapticManager.triggerSelection();
    router.push('/auth/signin');
  };

  // Enhanced animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` }
    ],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  const backgroundGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backgroundGlow.value, [0, 1], [0.3, 0.7]),
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
        <ParticleSystem count={20} animate={true} />
        
        {/* Enhanced Background Glow */}
        <Animated.View style={[styles.backgroundGlow, backgroundGlowStyle]} />
        
        {/* Success/Debug Indicators */}
        {!(user || session) && (
          <View style={styles.signOutSuccess}>
            <CheckCircle size={16} color={designTokens.colors.accent.emerald} />
            <Text style={styles.signOutSuccessText}>Ready for your journey</Text>
          </View>
        )}
        
        {(user || session) && (
          <GlassCard style={styles.signOutError} intensity="strong">
            <Text style={styles.signOutErrorText}>⚠️ Session active - Debug mode</Text>
            <Text style={styles.debugText}>User: {user?.id || 'None'}</Text>
            <Text style={styles.debugText}>Session: {session ? 'Active' : 'None'}</Text>
          </GlassCard>
        )}

        <View style={styles.content}>
          {/* Enhanced Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <FloatingAction style={styles.logoContainer}>
              <Animated.View style={logoStyle}>
                <Sparkles size={80} color={designTokens.colors.accent.gold} strokeWidth={1.5} />
              </Animated.View>
            </FloatingAction>
            
            <Text style={styles.title}>Daily Inner{'\n'}Reflection</Text>
            <Text style={styles.subtitle}>
              Connect directly with your inner wisdom through this daily mirror into yourself
            </Text>
          </Animated.View>

          {/* Enhanced Feature Cards */}
          <Animated.View style={[styles.featureContainer, cardStyle]}>
            <GlassCard style={styles.featureCard} intensity="medium">
              <View style={styles.featureGrid}>
                <Animated.View style={[styles.featureItem, floatingStyle]}>
                  <Star size={24} color={designTokens.colors.accent.brightBlue} />
                  <Text style={styles.featureText}>Daily Guidance</Text>
                </Animated.View>
                
                <View style={styles.featureItem}>
                  <Heart size={24} color={designTokens.colors.accent.rose} />
                  <Text style={styles.featureText}>Inner Wisdom</Text>
                </View>
                
                <Animated.View style={[styles.featureItem, floatingStyle]}>
                  <Zap size={24} color={designTokens.colors.accent.purple} />
                  <Text style={styles.featureText}>Personal Growth</Text>
                </Animated.View>
              </View>
              
              <Text style={styles.featureDescription}>
                Join thousands discovering their path to self-connection and spiritual growth
              </Text>
            </GlassCard>
          </Animated.View>
        </View>
        
        {/* Enhanced Action Buttons */}
        <Animated.View style={[styles.actionContainer, buttonsStyle]}>
          <ModernButton
            title="Begin Your Journey"
            onPress={handleGetStarted}
            variant="gradient"
            size="lg"
            icon={Sparkles}
            style={styles.primaryButton}
          />
          
          <ModernButton
            title="Already have an account? Sign In"
            onPress={handleSignIn}
            variant="ghost"
            size="md"
            style={styles.secondaryButton}
          />
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
    left: '10%',
    right: '10%',
    height: '50%',
    borderRadius: 200,
    backgroundColor: designTokens.colors.accent.purple,
    opacity: 0.4,
  },

  // Success/Debug Indicators
  signOutSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.md,
    backgroundColor: designTokens.colors.glass.background,
    borderRadius: designTokens.borderRadius.lg,
    marginTop: designTokens.spacing.lg,
    borderWidth: 1,
    borderColor: designTokens.colors.accent.emerald,
  },

  signOutSuccessText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.accent.emerald,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },

  signOutError: {
    marginTop: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
    alignItems: 'center',
  },

  signOutErrorText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.accent.rose,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    marginBottom: designTokens.spacing.xs,
  },

  debugText: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.text.muted,
  },

  // Main Content
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: designTokens.spacing.xl,
  },

  header: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.xxxl,
  },

  logoContainer: {
    padding: designTokens.spacing.lg,
    marginBottom: designTokens.spacing.xl,
  },

  title: {
    fontSize: designTokens.typography.fontSize['4xl'],
    fontWeight: designTokens.typography.fontWeight.extrabold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
    lineHeight: designTokens.typography.lineHeight.tight * designTokens.typography.fontSize['4xl'],
  },

  subtitle: {
    fontSize: designTokens.typography.fontSize.lg,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.lg,
    maxWidth: 320,
  },

  // Enhanced Feature Cards
  featureContainer: {
    marginBottom: designTokens.spacing.xl,
  },

  featureCard: {
    paddingVertical: designTokens.spacing.xl,
    alignItems: 'center',
  },

  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: designTokens.spacing.lg,
  },

  featureItem: {
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    flex: 1,
  },

  featureText: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.text.accent,
    fontWeight: designTokens.typography.fontWeight.medium as any,
    textAlign: 'center',
  },

  featureDescription: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
    maxWidth: 280,
  },

  // Action Buttons
  actionContainer: {
    gap: designTokens.spacing.lg,
    paddingBottom: designTokens.spacing.xl,
  },

  primaryButton: {
    minHeight: 56,
  },

  secondaryButton: {
    minHeight: 48,
  },
});