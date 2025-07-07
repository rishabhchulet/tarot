import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  interpolate,
  runOnJS,
  Easing
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Sparkles, Star, Zap, Sun, Moon } from 'lucide-react-native';
import { designTokens } from './DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ModernTarotCardFlowProps {
  onComplete: () => void;
}

export function ModernTarotCardFlow({ onComplete }: ModernTarotCardFlowProps) {
  const [phase, setPhase] = useState<'ambient' | 'gathering' | 'channeling' | 'cosmic' | 'portal' | 'materialization' | 'reveal'>('ambient');
  
  // Enhanced animation values for smoother experience
  const ambientGlow = useSharedValue(0);
  const cardScale = useSharedValue(0);
  const portalRotation = useSharedValue(0);
  const particleOpacity = useSharedValue(0);
  const textFade = useSharedValue(1);
  const blurIntensity = useSharedValue(0);
  
  useEffect(() => {
    startModernMagicalSequence();
  }, []);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success') => {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
    }
  };

  const startModernMagicalSequence = () => {
    // Phase 1: Ambient Preparation (2s)
    setPhase('ambient');
    triggerHaptic('light');
    
    ambientGlow.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.cubic) });
    
    setTimeout(() => {
      // Phase 2: Energy Gathering (2s)
      setPhase('gathering');
      triggerHaptic('medium');
      
      particleOpacity.value = withTiming(1, { duration: 1500 });
      blurIntensity.value = withTiming(20, { duration: 1500 });
      
      setTimeout(() => {
        // Phase 3: Channeling (2s)
        setPhase('channeling');
        
        portalRotation.value = withRepeat(
          withTiming(360, { duration: 3000, easing: Easing.linear }),
          -1,
          false
        );
        
        setTimeout(() => {
          // Phase 4: Cosmic Alignment (1.5s)
          setPhase('cosmic');
          triggerHaptic('heavy');
          
          setTimeout(() => {
            // Phase 5: Portal Opening (1s)
            setPhase('portal');
            
            setTimeout(() => {
              // Phase 6: Card Materialization (1.5s)
              setPhase('materialization');
              
              cardScale.value = withTiming(1, { 
                duration: 1500, 
                easing: Easing.out(Easing.back(1.2)) 
              });
              
              setTimeout(() => {
                // Phase 7: Reveal (1s)
                setPhase('reveal');
                triggerHaptic('success');
                
                textFade.value = withTiming(0, { duration: 800 });
                blurIntensity.value = withTiming(0, { duration: 800 });
                
                setTimeout(() => {
                  runOnJS(onComplete)();
                }, 1000);
              }, 1500);
            }, 1000);
          }, 1500);
        }, 2000);
      }, 2000);
    }, 2000);
  };

  // Animated styles
  const ambientStyle = useAnimatedStyle(() => ({
    opacity: ambientGlow.value,
    transform: [{ scale: interpolate(ambientGlow.value, [0, 1], [0.8, 1.2]) }],
  }));

  const cardRevealStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardScale.value,
  }));

  const portalStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${portalRotation.value}deg` }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textFade.value,
  }));

  const particleStyle = useAnimatedStyle(() => ({
    opacity: particleOpacity.value,
  }));

  const getPhaseMessage = () => {
    switch (phase) {
      case 'ambient': return 'Creating sacred space...';
      case 'gathering': return 'Gathering cosmic energy...';
      case 'channeling': return 'Channeling universal wisdom...';
      case 'cosmic': return 'Aligning with cosmic forces...';
      case 'portal': return 'Opening portal to insight...';
      case 'materialization': return 'Your wisdom materializes...';
      case 'reveal': return 'Behold your guidance...';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Modern Background with Blur */}
      <LinearGradient
        colors={[
          designTokens.colors.background.primary,
          designTokens.colors.background.secondary,
          designTokens.colors.background.tertiary
        ]}
        style={styles.background}
      >
        <BlurView
          intensity={blurIntensity.value}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />

        {/* Floating Particles */}
        <Animated.View style={[styles.particleContainer, particleStyle]}>
          {[...Array(12)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  left: Math.random() * screenWidth,
                  top: Math.random() * screenHeight,
                  animationDelay: `${index * 200}ms`,
                }
              ]}
            >
              <Star 
                size={Math.random() * 8 + 4} 
                color={designTokens.colors.accent.brightBlue} 
                fill={designTokens.colors.accent.brightBlue}
              />
            </Animated.View>
          ))}
        </Animated.View>

        {/* Central Portal/Energy Ring */}
        <View style={styles.centerContainer}>
          <Animated.View style={[styles.ambientGlow, ambientStyle]}>
            <LinearGradient
              colors={[
                'rgba(59, 130, 246, 0.4)',
                'rgba(139, 92, 246, 0.3)',
                'rgba(245, 158, 11, 0.2)'
              ]}
              style={styles.glowGradient}
            />
          </Animated.View>

          {/* Rotating Portal */}
          <Animated.View style={[styles.portalContainer, portalStyle]}>
            <View style={styles.portalRing}>
              {[...Array(8)].map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.portalElement,
                    {
                      transform: [{ rotate: `${index * 45}deg` }],
                    }
                  ]}
                >
                  <Sparkles size={12} color={designTokens.colors.accent.brightBlue} />
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Card Materialization */}
          <Animated.View style={[styles.cardContainer, cardRevealStyle]}>
            <BlurView intensity={80} tint="dark" style={styles.cardBlur}>
              <LinearGradient
                colors={[
                  'rgba(59, 130, 246, 0.2)',
                  'rgba(139, 92, 246, 0.1)'
                ]}
                style={styles.cardGradient}
              >
                <Sparkles size={32} color={designTokens.colors.accent.gold} />
                <Text style={styles.cardText}>Your Wisdom</Text>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        </View>

        {/* Phase Text */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.phaseText}>{getPhaseMessage()}</Text>
          <View style={styles.textUnderline} />
        </Animated.View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[...Array(7)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: ['ambient', 'gathering', 'channeling', 'cosmic', 'portal', 'materialization', 'reveal'].indexOf(phase) >= index
                    ? designTokens.colors.accent.brightBlue
                    : designTokens.colors.glass.border
                }
              ]}
            />
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    position: 'relative',
  },
  particleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
  },
  portalContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  portalRing: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  portalElement: {
    position: 'absolute',
    width: 24,
    height: 24,
    top: -12,
    left: '50%',
    marginLeft: -12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: 160,
    height: 240,
    borderRadius: designTokens.borderRadius.xl,
    overflow: 'hidden',
  },
  cardBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
    borderRadius: designTokens.borderRadius.xl,
  },
  cardText: {
    color: designTokens.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  textContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  phaseText: {
    color: designTokens.colors.text.secondary,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  textUnderline: {
    width: 60,
    height: 2,
    backgroundColor: designTokens.colors.accent.brightBlue,
    marginTop: 8,
    borderRadius: 1,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
}); 