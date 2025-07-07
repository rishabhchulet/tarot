import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard, FloatingAction, ParticleSystem, designTokens, animationHelpers } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { router } from 'expo-router';
import { Heart, Sparkles, Wind, Zap, Star, Sun } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

export default function BreathingScreen() {
  const [phase, setPhase] = useState<'prepare' | 'breathing' | 'complete'>('prepare');
  const [breathCount, setBreathCount] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState('');
  
  // Enhanced animation values
  const circleScale = useSharedValue(0.8);
  const circleOpacity = useSharedValue(0.6);
  const circleGlow = useSharedValue(0);
  const heartPulse = useSharedValue(1);
  const sparkleRotation = useSharedValue(0);
  const backgroundGlow = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const instructionOpacity = useSharedValue(0);
  const completionScale = useSharedValue(0);

  useEffect(() => {
    startEntranceAnimations();
    startAmbientAnimations();
  }, []);

  useEffect(() => {
    if (phase === 'breathing') {
      startBreathingCycle();
    } else if (phase === 'complete') {
      startCompletionAnimations();
    }
  }, [phase]);

  const startEntranceAnimations = () => {
    // Background glow entrance
    backgroundGlow.value = withTiming(1, { duration: 2000 });
    
    // Content entrance
    setTimeout(() => {
      animationHelpers.fadeIn(contentOpacity, 800);
      contentTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 300);
  };

  const startAmbientAnimations = () => {
    // Enhanced heart pulse animation
    heartPulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Enhanced sparkle rotation
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );

    // Circle glow animation
    circleGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  };

  const updateInstruction = (instruction: string) => {
    setCurrentInstruction(instruction);
    instructionOpacity.value = withSequence(
      withTiming(0, { duration: 200 }),
      withTiming(1, { duration: 400 })
    );
  };

  const startBreathingCycle = async () => {
    await HapticManager.triggerSelection();
    let currentBreath = 0;
    
    const breathingCycle = (breathNumber: number) => {
      // Prepare phase
      runOnJS(updateInstruction)('Prepare yourself...');
      
      setTimeout(() => {
        // Inhale phase (4 seconds)
        runOnJS(updateInstruction)('Breathe in slowly...');
        
        circleScale.value = withTiming(1.6, { 
          duration: 4000, 
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94)
        });
        circleOpacity.value = withTiming(0.9, { 
          duration: 4000, 
          easing: Easing.inOut(Easing.ease) 
        });
        
        // Haptic feedback for inhale
        setTimeout(() => HapticManager.triggerSelection(), 0);
      }, 1000);

      // Hold phase (2 seconds)
      setTimeout(() => {
        runOnJS(updateInstruction)('Hold gently...');
      }, 5000);

      // Exhale phase (4 seconds)
      setTimeout(() => {
        runOnJS(updateInstruction)('Breathe out slowly...');
        
        circleScale.value = withTiming(0.8, { 
          duration: 4000, 
          easing: Easing.bezier(0.55, 0.06, 0.68, 0.19)
        });
        circleOpacity.value = withTiming(0.4, { 
          duration: 4000, 
          easing: Easing.inOut(Easing.ease) 
        });
        
        // Haptic feedback for exhale
        setTimeout(() => HapticManager.triggerSelection(), 0);
      }, 7000);

      // Rest phase
      setTimeout(() => {
        if (breathNumber < 3) {
          runOnJS(updateInstruction)('Rest and prepare...');
        }
      }, 11000);
    };

    // Start first cycle
    breathingCycle(1);
    currentBreath = 1;
    setBreathCount(1);

    // Continue cycles
    const interval = setInterval(() => {
      currentBreath++;
      setBreathCount(currentBreath);
      
      if (currentBreath <= 3) {
        breathingCycle(currentBreath);
      }
      
      if (currentBreath >= 3) {
        clearInterval(interval);
        // Transition to completion
        setTimeout(() => {
          setPhase('complete');
        }, 12000);
      }
    }, 13000); // 13 seconds per complete cycle

    return () => clearInterval(interval);
  };

  const startCompletionAnimations = async () => {
    await HapticManager.triggerSelection();
    
    // Completion scale animation
    completionScale.value = withSpring(1, designTokens.animations.spring.bouncy);
    
    // Auto-navigate after showing completion
    setTimeout(() => {
      console.log('🎉 Breathing complete, navigating to main app...');
      router.replace('/(tabs)');
    }, 3000);
  };

  const handleStartBreathing = async () => {
    await HapticManager.triggerSelection();
    console.log('🫁 Starting breathing exercise...');
    setPhase('breathing');
    setBreathCount(0);
  };

  const handleSkip = async () => {
    await HapticManager.triggerSelection();
    router.replace('/(tabs)');
  };

  // Enhanced animated styles
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  const circleGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(circleGlow.value, [0, 1], [0.2, 0.8]),
    transform: [{ scale: interpolate(circleGlow.value, [0, 1], [0.9, 1.1]) }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartPulse.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const backgroundGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backgroundGlow.value, [0, 1], [0, 0.6]),
  }));

  const instructionStyle = useAnimatedStyle(() => ({
    opacity: instructionOpacity.value,
  }));

  const completionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: completionScale.value }],
    opacity: completionScale.value,
  }));

  const getBreathingText = () => {
    if (breathCount === 1) return 'Begin your journey within';
    if (breathCount === 2) return 'Feel peace flowing through you';
    if (breathCount === 3) return 'Embrace this moment of calm';
    return 'Breathe with intention';
  };

  const getPhaseIcon = () => {
    switch (phase) {
      case 'prepare': return Heart;
      case 'breathing': return Wind;
      case 'complete': return Star;
      default: return Heart;
    }
  };

  const renderContent = () => {
    switch (phase) {
      case 'prepare':
        return (
          <>
            <View style={styles.iconContainer}>
              <Animated.View style={heartStyle}>
                <FloatingAction style={styles.mainIcon}>
                  <Heart size={48} color={designTokens.colors.accent.rose} fill={designTokens.colors.accent.rose} />
                </FloatingAction>
              </Animated.View>
            </View>

            <GlassCard style={styles.contentCard} intensity="medium">
              <Text style={styles.title}>Take a Deep Breath</Text>
              <Text style={styles.subtitle}>
                Let's center yourself before you receive your first inner message.
              </Text>
              <Text style={styles.description}>
                Find a comfortable position and prepare to breathe deeply with intention. 
                This practice will help you connect with your inner wisdom.
              </Text>

              <View style={styles.benefitsContainer}>
                <View style={styles.benefit}>
                  <Zap size={16} color={designTokens.colors.accent.gold} />
                  <Text style={styles.benefitText}>Reduces stress</Text>
                </View>
                <View style={styles.benefit}>
                  <Sun size={16} color={designTokens.colors.accent.brightBlue} />
                  <Text style={styles.benefitText}>Improves focus</Text>
                </View>
                <View style={styles.benefit}>
                  <Heart size={16} color={designTokens.colors.accent.rose} />
                  <Text style={styles.benefitText}>Calms the mind</Text>
                </View>
              </View>
            </GlassCard>

            <View style={styles.buttonContainer}>
              <Pressable style={styles.startButton} onPress={handleStartBreathing}>
                <LinearGradient
                  colors={designTokens.colors.gradients.mystical}
                  style={styles.startButtonGradient}
                >
                  <Wind size={20} color={designTokens.colors.text.primary} />
                  <Text style={styles.startButtonText}>Begin Breathing</Text>
                </LinearGradient>
              </Pressable>

              <Pressable style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </Pressable>
            </View>
          </>
        );
      
      case 'breathing':
        return (
          <>
            <View style={styles.breathingContainer}>
              {/* Enhanced breathing circle with glow effect */}
              <Animated.View style={[styles.breathingGlow, circleGlowStyle]} />
              <Animated.View style={[styles.breathingCircle, circleStyle]}>
                <View style={styles.innerCircle}>
                  <Animated.View style={sparkleStyle}>
                    <Sparkles size={24} color={designTokens.colors.text.primary} />
                  </Animated.View>
                </View>
              </Animated.View>
            </View>

            <GlassCard style={styles.breathingCard} intensity="light">
              <Text style={styles.breathingText}>
                {getBreathingText()}
              </Text>
              
              <Animated.View style={instructionStyle}>
                <Text style={styles.instructionText}>
                  {currentInstruction}
                </Text>
              </Animated.View>
              
              <View style={styles.progressContainer}>
                <Text style={styles.breathingCount}>
                  Breath {breathCount} of 3
                </Text>
                <View style={styles.progressBar}>
                  {[1, 2, 3].map((num) => (
                    <View 
                      key={num} 
                      style={[
                        styles.progressDot, 
                        num <= breathCount && styles.progressDotActive
                      ]} 
                    />
                  ))}
                </View>
              </View>
            </GlassCard>

            <Text style={styles.guidanceText}>
              Follow the circle's rhythm and let your breath guide you
            </Text>
          </>
        );
        
      case 'complete':
        return (
          <Animated.View style={[styles.completionContainer, completionStyle]}>
            <GlassCard style={styles.completionCard} intensity="medium">
              <View style={styles.completionIcon}>
                <Star size={64} color={designTokens.colors.accent.gold} fill={designTokens.colors.accent.gold} />
              </View>
              <Text style={styles.completionTitle}>Beautiful</Text>
              <Text style={styles.completionText}>
                You've created a moment of peace. Carry this calm energy with you as you explore your inner wisdom.
              </Text>
              <View style={styles.completionSparkles}>
                <Sparkles size={20} color={designTokens.colors.accent.gold} />
                <Sparkles size={16} color={designTokens.colors.accent.brightBlue} />
                <Sparkles size={18} color={designTokens.colors.accent.rose} />
              </View>
            </GlassCard>
          </Animated.View>
        );
      
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={designTokens.colors.gradients.cosmic}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ParticleSystem count={16} animate={true} />
        
        {/* Enhanced Background Glow */}
        <Animated.View style={[styles.backgroundGlow, backgroundGlowStyle]} />

        <Animated.View style={[styles.content, contentStyle]}>
          {renderContent()}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },

  safeArea: {
    flex: 1,
  },
  
  backgroundGlow: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    right: '20%',
    height: '40%',
    borderRadius: 200,
    backgroundColor: designTokens.colors.accent.brightBlue,
    opacity: 0.3,
  },
  
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.xl,
  },
  
  // Prepare Phase
  iconContainer: {
    marginBottom: designTokens.spacing.xl,
  },

  mainIcon: {
    padding: designTokens.spacing.lg,
    shadowColor: designTokens.colors.accent.rose,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },

  contentCard: {
    paddingVertical: designTokens.spacing.xl,
    paddingHorizontal: designTokens.spacing.lg,
    marginBottom: designTokens.spacing.xl,
    maxWidth: 360,
    alignItems: 'center',
  },
  
  title: {
    fontSize: designTokens.typography.fontSize['3xl'],
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.md,
  },
  
  subtitle: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.medium as any,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.lg,
  },
  
  description: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
  },

  benefitsContainer: {
    flexDirection: 'row',
    gap: designTokens.spacing.lg,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.md,
    backgroundColor: designTokens.colors.glass.background,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
  },

  benefitText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.secondary,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },

  buttonContainer: {
    gap: designTokens.spacing.md,
    alignItems: 'center',
  },
  
  // Enhanced Breathing Animation
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: designTokens.spacing.xl,
    position: 'relative',
  },

  breathingGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: designTokens.colors.accent.brightBlue,
    opacity: 0.2,
  },
  
  breathingCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: designTokens.colors.glass.background,
    borderWidth: 2,
    borderColor: designTokens.colors.accent.brightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: designTokens.colors.accent.brightBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 30,
  },
  
  innerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: designTokens.colors.glass.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
  },

  breathingCard: {
    paddingVertical: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.md,
    marginBottom: designTokens.spacing.lg,
    alignItems: 'center',
    maxWidth: 320,
  },
  
  breathingText: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.md,
  },

  instructionText: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.medium as any,
    color: designTokens.colors.accent.brightBlue,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
  },

  progressContainer: {
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },
  
  breathingCount: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.medium as any,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },

  progressBar: {
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
  },

  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: designTokens.colors.glass.border,
  },

  progressDotActive: {
    backgroundColor: designTokens.colors.accent.gold,
  },

  guidanceText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Enhanced Buttons
  startButton: {
    borderRadius: designTokens.borderRadius.xl,
    overflow: 'hidden',
    shadowColor: designTokens.colors.accent.brightBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  startButtonGradient: {
    paddingVertical: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.xl,
    alignItems: 'center',
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
  },
  
  startButtonText: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
  },

  skipButton: {
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.lg,
  },

  skipButtonText: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
  },

  // Completion Phase
  completionContainer: {
    alignItems: 'center',
  },

  completionCard: {
    paddingVertical: designTokens.spacing.xxxl,
    paddingHorizontal: designTokens.spacing.xl,
    alignItems: 'center',
    maxWidth: 340,
  },

  completionIcon: {
    marginBottom: designTokens.spacing.xl,
    shadowColor: designTokens.colors.accent.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },

  completionTitle: {
    fontSize: designTokens.typography.fontSize['2xl'],
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.md,
  },

  completionText: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
    marginBottom: designTokens.spacing.lg,
  },

  completionSparkles: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
    alignItems: 'center',
  },
});