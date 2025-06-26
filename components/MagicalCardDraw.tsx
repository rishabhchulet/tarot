import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  runOnJS,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Star, Zap } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface MagicalCardDrawProps {
  onComplete: () => void;
}

export function MagicalCardDraw({ onComplete }: MagicalCardDrawProps) {
  const [phase, setPhase] = useState<'gathering' | 'channeling' | 'selecting' | 'revealing'>('gathering');
  const isMounted = useRef(true);
  
  // Animation values
  const centerGlow = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  const energyPulse = useSharedValue(0);
  const cardScale = useSharedValue(0);
  const textOpacity = useSharedValue(1);
  const orbitalRotation = useSharedValue(0);
  const magicCircleScale = useSharedValue(0);

  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;
    
    startMagicalSequence();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeSetPhase = (newPhase: 'gathering' | 'channeling' | 'selecting' | 'revealing') => {
    if (isMounted.current) {
      setPhase(newPhase);
    }
  };

  const safeOnComplete = () => {
    if (isMounted.current) {
      onComplete();
    }
  };

  const startMagicalSequence = () => {
    // Phase 1: Gathering Energy (2 seconds)
    centerGlow.value = withTiming(1, { duration: 1000 });
    sparkleOpacity.value = withTiming(1, { duration: 800 });
    magicCircleScale.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
    
    setTimeout(() => {
      if (!isMounted.current) return;
      
      safeSetPhase('channeling');
      
      // Phase 2: Channeling Energy (2 seconds)
      energyPulse.value = withRepeat(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      
      orbitalRotation.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
      
      setTimeout(() => {
        if (!isMounted.current) return;
        
        safeSetPhase('selecting');
        
        // Phase 3: Selecting Card (1.5 seconds)
        energyPulse.value = withTiming(0, { duration: 300 });
        centerGlow.value = withSequence(
          withTiming(1.5, { duration: 200 }),
          withTiming(0.8, { duration: 300 }),
          withTiming(2, { duration: 400 })
        );
        
        setTimeout(() => {
          if (!isMounted.current) return;
          
          safeSetPhase('revealing');
          
          // Phase 4: Revealing Card (1 second)
          cardScale.value = withTiming(1, { 
            duration: 800, 
            easing: Easing.out(Easing.back(1.2)) 
          });
          textOpacity.value = withTiming(0, { duration: 400 });
          
          setTimeout(() => {
            if (isMounted.current) {
              runOnJS(safeOnComplete)();
            }
          }, 1000);
        }, 1500);
      }, 2000);
    }, 2000);
  };

  const centerGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: centerGlow.value,
      transform: [
        { scale: interpolate(centerGlow.value, [0, 1], [0.5, 1.2]) }
      ],
    };
  });

  const sparkleStyle = useAnimatedStyle(() => {
    return {
      opacity: sparkleOpacity.value,
    };
  });

  const energyPulseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(energyPulse.value, [0, 1], [1, 1.3]) }
      ],
      opacity: interpolate(energyPulse.value, [0, 1], [0.6, 1]),
    };
  });

  const cardRevealStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
      opacity: cardScale.value,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
    };
  });

  const orbitalStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${orbitalRotation.value}deg` }
      ],
    };
  });

  const magicCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: magicCircleScale.value }],
      opacity: magicCircleScale.value,
    };
  });

  const getPhaseText = () => {
    switch (phase) {
      case 'gathering':
        return 'Gathering cosmic energy...';
      case 'channeling':
        return 'Channeling your intention...';
      case 'selecting':
        return 'The universe is choosing...';
      case 'revealing':
        return 'Your message awaits...';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Magic Circle Background */}
      <Animated.View style={[styles.magicCircle, magicCircleStyle]}>
        <View style={styles.outerCircle}>
          <View style={styles.innerCircle}>
            <View style={styles.centerDot} />
          </View>
        </View>
      </Animated.View>

      {/* Orbital Elements */}
      <Animated.View style={[styles.orbitalContainer, orbitalStyle]}>
        <View style={[styles.orbitalElement, { top: 50 }]}>
          <Star size={16} color="#F59E0B" />
        </View>
        <View style={[styles.orbitalElement, { bottom: 50, right: 0 }]}>
          <Sparkles size={14} color="#8B5CF6" />
        </View>
        <View style={[styles.orbitalElement, { left: 30, top: '50%' }]}>
          <Zap size={12} color="#3B82F6" />
        </View>
      </Animated.View>

      {/* Center Energy Glow */}
      <Animated.View style={[styles.centerGlow, centerGlowStyle]}>
        <LinearGradient
          colors={['rgba(245, 158, 11, 0.8)', 'rgba(139, 92, 246, 0.6)', 'rgba(59, 130, 246, 0.4)']}
          style={styles.glowGradient}
        />
      </Animated.View>

      {/* Energy Pulse Effect */}
      <Animated.View style={[styles.energyPulse, energyPulseStyle]}>
        <View style={styles.pulseRing} />
      </Animated.View>

      {/* Floating Sparkles */}
      <Animated.View style={[styles.sparkleContainer, sparkleStyle]}>
        {[...Array(8)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.sparkle,
              {
                left: Math.random() * (width - 100) + 50,
                top: Math.random() * 200 + 150,
              }
            ]}
          >
            <Sparkles size={8 + Math.random() * 8} color="#F59E0B" />
          </View>
        ))}
      </Animated.View>

      {/* Phase Text */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.phaseText}>{getPhaseText()}</Text>
      </Animated.View>

      {/* Card Reveal Placeholder */}
      {phase === 'revealing' && (
        <Animated.View style={[styles.cardReveal, cardRevealStyle]}>
          <LinearGradient
            colors={['#6B46C1', '#8B5CF6', '#F59E0B']}
            style={styles.cardPlaceholder}
          >
            <Sparkles size={40} color="#FFFFFF" />
            <Text style={styles.cardRevealText}>Your card is ready</Text>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.6,
    position: 'relative',
  },
  magicCircle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  innerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  orbitalContainer: {
    position: 'absolute',
    width: 320,
    height: 320,
  },
  orbitalElement: {
    position: 'absolute',
  },
  centerGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  energyPulse: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.6)',
  },
  sparkleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
  },
  textContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F3F4F6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cardReveal: {
    position: 'absolute',
    width: 200,
    height: 120,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardRevealText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});