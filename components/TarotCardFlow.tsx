import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolate,
  withSequence,
  withDelay,
  Easing,
  withSpring
} from 'react-native-reanimated';
import { TAROT_CARDS } from '@/data/tarotCards';
import { I_CHING_HEXAGRAMS } from '@/data/iChing';
import { ReflectionPrompt } from './ReflectionPrompt';
import { GlassCard, ModernButton, FloatingAction, ParticleSystem, designTokens, animationHelpers } from './DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { router } from 'expo-router';
import { Sparkles, Star, Eye, Heart, Zap, Play } from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type FlowStep = 'card-back' | 'card-and-iching' | 'keywords-only' | 'reflection-questions';

export function TarotCardFlow({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('card-back');
  const [selectedCard] = useState(() => {
    const randomIndex = Math.floor(Math.random() * TAROT_CARDS.length);
    return TAROT_CARDS[randomIndex];
  });
  const [selectedHexagram] = useState(() => {
    const randomIndex = Math.floor(Math.random() * I_CHING_HEXAGRAMS.length);
    return I_CHING_HEXAGRAMS[randomIndex];
  });

  // Enhanced animation values
  const flipAnimation = useSharedValue(0);
  const glowAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(0.8);
  const borderAnimation = useSharedValue(0);
  const textFadeIn = useSharedValue(0);
  const particlesOpacity = useSharedValue(0);
  const backgroundGlow = useSharedValue(0);

  const handleRevealCard = async () => {
    console.log('🎴 Enhanced card reveal triggered!');
    
    // Trigger haptic feedback
    await HapticManager.triggerCardReveal();
    
    // Start enhanced magical sequence
    glowAnimation.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
    borderAnimation.value = withTiming(1, { duration: 1800, easing: Easing.out(Easing.cubic) });
    backgroundGlow.value = withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.cubic) });
    
    // Enhanced scale animation
    scaleAnimation.value = withSequence(
      withTiming(1.1, { duration: 800, easing: Easing.out(Easing.cubic) }),
      withTiming(1.05, { duration: 400, easing: Easing.inOut(Easing.cubic) }),
      withTiming(1, { duration: 600, easing: Easing.inOut(Easing.cubic) })
    );
    
    // Activate particles
    setTimeout(() => {
      particlesOpacity.value = withTiming(1, { duration: 800 });
    }, 600);
    
    // Enhanced flip animation with spring
    flipAnimation.value = withDelay(1500, withSpring(1, { 
      damping: 20, 
      stiffness: 150 
    }));
    
    // Text fade in after flip
    setTimeout(() => {
      textFadeIn.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    }, 2800);
    
    // Change step after full sequence
    setTimeout(() => {
      setCurrentStep('card-and-iching');
    }, 3200);
  };

  const handleShowKeywords = async () => {
    await HapticManager.triggerSelection();
    setCurrentStep('keywords-only');
  };

  const handleShowReflection = async () => {
    await HapticManager.triggerSelection();
    setCurrentStep('reflection-questions');
  };

  const handleReflectionComplete = () => {
    console.log('⭐ Enhanced reflection complete');
    if (onComplete) {
      onComplete();
    }
  };

  // Helper function to get I Ching essence
  const getIChingEssence = (hexagram: any) => {
    const essences = [
      'Flow', 'Balance', 'Growth', 'Wisdom', 'Peace', 'Strength',
      'Clarity', 'Trust', 'Change', 'Harmony', 'Focus', 'Release'
    ];
    return essences[hexagram.number % essences.length];
  };

  // Enhanced animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleAnimation.value },
      { 
        rotateY: `${interpolate(
          flipAnimation.value,
          [0, 1],
          [0, 180]
        )}deg` 
      }
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowAnimation.value,
    transform: [
      { scale: interpolate(glowAnimation.value, [0, 1], [0.8, 1.2]) }
    ],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: borderAnimation.value,
    transform: [
      { rotate: `${interpolate(borderAnimation.value, [0, 1], [0, 360])}deg` }
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textFadeIn.value,
    transform: [
      { translateY: interpolate(textFadeIn.value, [0, 1], [20, 0]) }
    ],
  }));

  const backgroundGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backgroundGlow.value, [0, 1], [0, 0.6]),
  }));

  const particleStyle = useAnimatedStyle(() => ({
    opacity: particlesOpacity.value,
  }));

  // Enhanced card back render
  const renderCardBack = () => (
    <LinearGradient
      colors={designTokens.colors.gradients.cosmic}
      style={styles.container}
    >
      <ParticleSystem count={15} animate={true} />
      
      {/* Enhanced background glow */}
      <Animated.View style={[styles.enhancedBackgroundGlow, backgroundGlowStyle]} />
      
      <View style={styles.stepContainer}>
        <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
          {/* Enhanced magical border */}
          <Animated.View style={[styles.magicalBorder, borderStyle]}>
            <LinearGradient
              colors={[
                designTokens.colors.accent.gold,
                designTokens.colors.accent.purple,
                designTokens.colors.accent.blue,
                designTokens.colors.accent.gold
              ]}
              style={styles.borderGradient}
            />
          </Animated.View>
          
          {/* Enhanced card glow */}
          <Animated.View style={[styles.cardGlow, glowStyle]} />
          
          {/* Enhanced card back */}
          <GlassCard style={styles.enhancedCard} intensity="strong">
            <LinearGradient
              colors={[
                designTokens.colors.background.tertiary,
                designTokens.colors.background.secondary
              ]}
              style={styles.cardBackGradient}
            >
              <View style={styles.cardBackContent}>
                <FloatingAction style={styles.cardBackIcon}>
                  <Star size={48} color={designTokens.colors.accent.gold} />
                </FloatingAction>
                <Text style={styles.cardBackText}>Your Guidance Awaits</Text>
                <View style={styles.mysticalSymbols}>
                  <Sparkles size={16} color={designTokens.colors.accent.purple} />
                  <Text style={styles.mysticalText}>✦</Text>
                  <Sparkles size={16} color={designTokens.colors.accent.blue} />
                </View>
              </View>
            </LinearGradient>
          </GlassCard>
        </Animated.View>

        <View style={styles.enhancedInstructions}>
          <Text style={styles.instructionTitle}>Ready for Your Message?</Text>
          <Text style={styles.instructionSubtitle}>
            Take a deep breath and set your intention
          </Text>
          
          <ModernButton
            title="Reveal Your Card"
            onPress={handleRevealCard}
            variant="gradient"
            size="lg"
            icon={Eye}
            style={styles.revealButton}
          />
        </View>
      </View>
    </LinearGradient>
  );

  // Enhanced card and I Ching render
  const renderCardAndIching = () => (
    <LinearGradient
      colors={designTokens.colors.gradients.mystical}
      style={styles.container}
    >
      <Animated.View style={particleStyle}>
        <ParticleSystem count={12} animate={true} color={designTokens.colors.accent.emerald} />
      </Animated.View>
      
      <View style={styles.stepContainer}>
        {/* Enhanced Card Display */}
        <Animated.View style={[styles.revealedCardContainer, textStyle]}>
          <GlassCard style={styles.revealedCard} intensity="medium">
            <View style={styles.cardHeader}>
              <Heart size={24} color={designTokens.colors.accent.rose} />
              <Text style={styles.cardTitle}>{selectedCard.name}</Text>
              <Heart size={24} color={designTokens.colors.accent.rose} />
            </View>
            
            <View style={styles.cardImageContainer}>
              <View style={styles.cardImagePlaceholder}>
                <Zap size={64} color={designTokens.colors.accent.gold} />
              </View>
            </View>
            
            <Text style={styles.cardMeaning}>{selectedCard.meaning}</Text>
          </GlassCard>
        </Animated.View>

        {/* Enhanced I Ching Display */}
        <Animated.View style={[styles.iChingContainer, textStyle]}>
          <GlassCard style={styles.iChingCard} intensity="light">
            <View style={styles.iChingHeader}>
              <Text style={styles.iChingTitle}>Sacred Wisdom</Text>
              <Text style={styles.iChingName}>{selectedHexagram.name}</Text>
            </View>
            <Text style={styles.iChingWisdom}>{selectedHexagram.wisdom}</Text>
          </GlassCard>
        </Animated.View>

        {/* Enhanced Essence Display */}
        <Animated.View style={[styles.essenceContainer, textStyle]}>
          <GlassCard style={styles.essenceCard}>
            <Text style={styles.essenceTitle}>Today's Sacred Essence</Text>
            <View style={styles.essenceContent}>
              <Text style={styles.essenceText}>
                {selectedCard.keywords[0]} • {getIChingEssence(selectedHexagram)}
              </Text>
            </View>
            <Text style={styles.essenceDescription}>
              Let these energies guide your reflection today
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Enhanced Continue Button */}
        <View style={styles.buttonContainer}>
          <ModernButton
            title="Begin Sacred Reflection"
            onPress={handleShowReflection}
            variant="gradient"
            size="lg"
            icon={Play}
            style={styles.continueButton}
          />
        </View>
      </View>
    </LinearGradient>
  );

  // Enhanced keywords render (simplified for now)
  const renderKeywordsOnly = () => renderCardAndIching();

  // Enhanced reflection render
  const renderReflectionQuestions = () => (
    <LinearGradient
      colors={designTokens.colors.gradients.cosmic}
      style={styles.container}
    >
      <View style={styles.stepContainer}>
        <ReflectionPrompt
          card={selectedCard}
          hexagram={selectedHexagram}
          onComplete={handleReflectionComplete}
        />
      </View>
    </LinearGradient>
  );

  switch (currentStep) {
    case 'card-back':
      return renderCardBack();
    case 'card-and-iching':
      return renderCardAndIching();
    case 'keywords-only':
      return renderKeywordsOnly();
    case 'reflection-questions':
      return renderReflectionQuestions();
    default:
      return renderCardBack();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  stepContainer: {
    flex: 1,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.xl,
    justifyContent: 'space-between',
  },

  // Enhanced Card Back Styles
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  magicalBorder: {
    position: 'absolute',
    width: screenWidth * 0.7 + 20,
    height: screenWidth * 0.9 + 20,
    borderRadius: designTokens.borderRadius.xl,
  },

  borderGradient: {
    flex: 1,
    borderRadius: designTokens.borderRadius.xl,
    padding: 3,
  },

  cardGlow: {
    position: 'absolute',
    width: screenWidth * 0.8,
    height: screenWidth * 1.0,
    borderRadius: screenWidth * 0.4,
    backgroundColor: designTokens.colors.accent.gold,
    opacity: 0.3,
  },

  enhancedCard: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.9,
    padding: 0,
    overflow: 'hidden',
  },

  cardBackGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: designTokens.borderRadius.lg,
  },

  cardBackContent: {
    alignItems: 'center',
    gap: designTokens.spacing.lg,
  },

  cardBackIcon: {
    padding: designTokens.spacing.lg,
  },

  cardBackText: {
    fontSize: designTokens.typography.fontSize['2xl'],
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
  },

  mysticalSymbols: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.md,
  },

  mysticalText: {
    fontSize: designTokens.typography.fontSize.lg,
    color: designTokens.colors.accent.lavender,
    fontWeight: designTokens.typography.fontWeight.bold as any,
  },

  enhancedBackgroundGlow: {
    position: 'absolute',
    top: screenHeight * 0.2,
    left: screenWidth * 0.1,
    right: screenWidth * 0.1,
    height: screenHeight * 0.6,
    borderRadius: screenWidth * 0.4,
    backgroundColor: designTokens.colors.accent.purple,
    opacity: 0.4,
  },

  // Enhanced Instructions
  enhancedInstructions: {
    alignItems: 'center',
    gap: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.xl,
  },

  instructionTitle: {
    fontSize: designTokens.typography.fontSize['3xl'],
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
  },

  instructionSubtitle: {
    fontSize: designTokens.typography.fontSize.lg,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
    marginBottom: designTokens.spacing.md,
  },

  revealButton: {
    minWidth: 200,
  },

  // Enhanced Revealed Card Styles
  revealedCardContainer: {
    marginBottom: designTokens.spacing.xl,
  },

  revealedCard: {
    paddingVertical: designTokens.spacing.xl,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designTokens.spacing.md,
    marginBottom: designTokens.spacing.lg,
  },

  cardTitle: {
    fontSize: designTokens.typography.fontSize['2xl'],
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
  },

  cardImageContainer: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.lg,
  },

  cardImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: designTokens.borderRadius.full,
    backgroundColor: designTokens.colors.glass.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: designTokens.colors.accent.gold,
  },

  cardMeaning: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
  },

  // Enhanced I Ching Styles
  iChingContainer: {
    marginBottom: designTokens.spacing.lg,
  },

  iChingCard: {
    paddingVertical: designTokens.spacing.lg,
  },

  iChingHeader: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },

  iChingTitle: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: designTokens.spacing.xs,
  },

  iChingName: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
  },

  iChingWisdom: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.sm,
  },

  // Enhanced Essence Styles
  essenceContainer: {
    marginBottom: designTokens.spacing.xl,
  },

  essenceCard: {
    paddingVertical: designTokens.spacing.lg,
    alignItems: 'center',
  },

  essenceTitle: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.accent,
    marginBottom: designTokens.spacing.md,
    textAlign: 'center',
  },

  essenceContent: {
    marginBottom: designTokens.spacing.md,
  },

  essenceText: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
  },

  essenceDescription: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Enhanced Button Styles
  buttonContainer: {
    alignItems: 'center',
    paddingTop: designTokens.spacing.lg,
  },

  continueButton: {
    minWidth: 250,
  },
});