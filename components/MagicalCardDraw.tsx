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
import { Sparkles, Star, Zap, Sun, Moon, CloudLightning } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface MagicalCardDrawProps {
  onComplete: () => void;
}

export function MagicalCardDraw({ onComplete }: MagicalCardDrawProps) {
  const [phase, setPhase] = useState<'gathering' | 'channeling' | 'celestial-dance' | 'cosmic-alignment' | 'revealing'>('gathering');
  const isMounted = useRef(true);
  
  // Enhanced animation values
  const centerGlow = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  const energyPulse = useSharedValue(0);
  const cardScale = useSharedValue(0);
  const textOpacity = useSharedValue(1);
  const orbitalRotation = useSharedValue(0);
  const magicCircleScale = useSharedValue(0);
  
  // NEW: Celestial animation values
  const sunScale = useSharedValue(0);
  const moonScale = useSharedValue(0);
  const sunRotation = useSharedValue(0);
  const moonRotation = useSharedValue(0);
  const sunOpacity = useSharedValue(0);
  const moonOpacity = useSharedValue(0);
  const celestialOrbit = useSharedValue(0);
  const cosmicEnergy = useSharedValue(0);
  const lightningOpacity = useSharedValue(0);
  const starsScale = useSharedValue(0);
  const universePulse = useSharedValue(0);

  useEffect(() => {
    isMounted.current = true;
    startEnhancedMagicalSequence();
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeSetPhase = (newPhase: 'gathering' | 'channeling' | 'celestial-dance' | 'cosmic-alignment' | 'revealing') => {
    if (isMounted.current) {
      setPhase(newPhase);
    }
  };

  const safeOnComplete = () => {
    if (isMounted.current) {
      onComplete();
    }
  };

  const startEnhancedMagicalSequence = () => {
    // Phase 1: Gathering Energy (2.5 seconds)
    console.log('🌟 Phase 1: Gathering cosmic energy...');
    centerGlow.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
    sparkleOpacity.value = withTiming(1, { duration: 1000 });
    magicCircleScale.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) });
    starsScale.value = withTiming(1, { duration: 1800, easing: Easing.out(Easing.cubic) });
    
    setTimeout(() => {
      if (!isMounted.current) return;
      
      safeSetPhase('channeling');
      console.log('⚡ Phase 2: Channeling energy...');
      
      // Phase 2: Channeling Energy (2.5 seconds)
      energyPulse.value = withRepeat(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      
      orbitalRotation.value = withRepeat(
        withTiming(360, { duration: 4000, easing: Easing.linear }),
        -1,
        false
      );
      
      universePulse.value = withRepeat(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      
      setTimeout(() => {
        if (!isMounted.current) return;
        
        safeSetPhase('celestial-dance');
        console.log('🌞🌙 Phase 3: Celestial dance begins...');
        
        // Phase 3: Celestial Dance - Sun and Moon appear (3 seconds)
        sunOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        moonOpacity.value = withDelay(400, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
        
        sunScale.value = withSequence(
          withTiming(1.5, { duration: 600, easing: Easing.out(Easing.back(1.2)) }),
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.cubic) })
        );
        
        moonScale.value = withDelay(400, withSequence(
          withTiming(1.3, { duration: 600, easing: Easing.out(Easing.back(1.1)) }),
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.cubic) })
        ));
        
        // Celestial rotation dance
        sunRotation.value = withRepeat(
          withTiming(360, { duration: 6000, easing: Easing.linear }),
          -1,
          false
        );
        
        moonRotation.value = withRepeat(
          withTiming(-360, { duration: 8000, easing: Easing.linear }),
          -1,
          false
        );
        
        // Orbital dance around the center
        celestialOrbit.value = withRepeat(
          withTiming(360, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
          -1,
          false
        );
        
        setTimeout(() => {
          if (!isMounted.current) return;
          
          safeSetPhase('cosmic-alignment');
          console.log('✨ Phase 4: Cosmic alignment...');
          
          // Phase 4: Cosmic Alignment - Lightning and cosmic energy (2 seconds)
          cosmicEnergy.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
          
          // Lightning flashes
          lightningOpacity.value = withSequence(
            withTiming(1, { duration: 100 }),
            withTiming(0, { duration: 200 }),
            withDelay(300, withTiming(1, { duration: 150 })),
            withTiming(0, { duration: 250 }),
            withDelay(400, withTiming(1, { duration: 100 })),
            withTiming(0, { duration: 300 })
          );
          
          // Intensify all effects
          centerGlow.value = withSequence(
            withTiming(2, { duration: 500 }),
            withTiming(1.5, { duration: 500 }),
            withTiming(3, { duration: 800 })
          );
          
          setTimeout(() => {
            if (!isMounted.current) return;
            
            safeSetPhase('revealing');
            console.log('🎴 Phase 5: Card revelation...');
            
            // Phase 5: Revealing Card - Celestial elements fade as card appears (1.5 seconds)
            cardScale.value = withTiming(1, { 
              duration: 1200, 
              easing: Easing.out(Easing.back(1.3)) 
            });
            
            textOpacity.value = withTiming(0, { duration: 600 });
            
            // Fade celestial elements
            sunOpacity.value = withTiming(0.3, { duration: 800 });
            moonOpacity.value = withTiming(0.3, { duration: 800 });
            cosmicEnergy.value = withTiming(0.5, { duration: 800 });
            
            setTimeout(() => {
              if (isMounted.current) {
                runOnJS(safeOnComplete)();
              }
            }, 1500);
          }, 2000);
        }, 3000);
      }, 2500);
    }, 2500);
  };

  // Enhanced animated styles
  const centerGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: centerGlow.value,
      transform: [
        { scale: interpolate(centerGlow.value, [0, 1, 2, 3], [0.5, 1.2, 1.5, 2]) }
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
        { scale: interpolate(energyPulse.value, [0, 1], [1, 1.4]) }
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

  // NEW: Celestial animated styles
  const sunStyle = useAnimatedStyle(() => {
    const orbitX = Math.cos((celestialOrbit.value * Math.PI) / 180) * 80;
    const orbitY = Math.sin((celestialOrbit.value * Math.PI) / 180) * 40;
    
    return {
      opacity: sunOpacity.value,
      transform: [
        { translateX: orbitX },
        { translateY: orbitY },
        { scale: sunScale.value },
        { rotate: `${sunRotation.value}deg` }
      ],
    };
  });

  const moonStyle = useAnimatedStyle(() => {
    const orbitX = Math.cos(((celestialOrbit.value + 180) * Math.PI) / 180) * 80;
    const orbitY = Math.sin(((celestialOrbit.value + 180) * Math.PI) / 180) * 40;
    
    return {
      opacity: moonOpacity.value,
      transform: [
        { translateX: orbitX },
        { translateY: orbitY },
        { scale: moonScale.value },
        { rotate: `${moonRotation.value}deg` }
      ],
    };
  });

  const cosmicEnergyStyle = useAnimatedStyle(() => {
    return {
      opacity: cosmicEnergy.value,
      transform: [
        { scale: interpolate(cosmicEnergy.value, [0, 1], [0.8, 1.3]) }
      ],
    };
  });

  const lightningStyle = useAnimatedStyle(() => {
    return {
      opacity: lightningOpacity.value,
    };
  });

  const starsStyle = useAnimatedStyle(() => {
    return {
      opacity: starsScale.value,
      transform: [
        { scale: starsScale.value }
      ],
    };
  });

  const universePulseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(universePulse.value, [0, 1], [1, 1.1]) }
      ],
      opacity: interpolate(universePulse.value, [0, 1], [0.3, 0.7]),
    };
  });

  const getPhaseText = () => {
    switch (phase) {
      case 'gathering':
        return 'Gathering cosmic energy...';
      case 'channeling':
        return 'Channeling universal wisdom...';
      case 'celestial-dance':
        return 'The celestial dance begins...';
      case 'cosmic-alignment':
        return 'Cosmic forces align for you...';
      case 'revealing':
        return 'Your destiny reveals itself...';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />
          colors={['rgba(10, 10, 10, 0.9)', 'rgba(30, 58, 138, 0.6)', 'rgba(30, 64, 175, 0.4)']}
          style={styles.universeGradient}
        />
      </Animated.View>

      {/* Enhanced Star Field */}
      <Animated.View style={[styles.starField, starsStyle]}>
        {[...Array(20)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.backgroundStar,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: Math.random() * 0.8 + 0.2,
              }
            ]}
          >
            <Star size={Math.random() * 8 + 4} color="#1e3a8a" fill="#1e3a8a" />
          </View>
        ))}
      </Animated.View>

      {/* Enhanced Magic Circle Background */}
      <Animated.View style={[styles.magicCircle, magicCircleStyle]}>
        <View style={styles.outerCircle}>
          <View style={styles.middleCircle}>
            <View style={styles.innerCircle}>
              <View style={styles.centerDot} />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* NEW: Celestial Elements */}
      <View style={styles.celestialContainer}>
        {/* Sun */}
        <Animated.View style={[styles.celestialElement, styles.sunContainer, sunStyle]}>
          <View style={styles.sunGlow}>
            <Sun size={40} color="#1e3a8a" fill="#1e3a8a" />
          </View>
          {/* Sun rays */}
          <View style={styles.sunRays}>
            {[...Array(8)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.sunRay,
                  {
                    transform: [{ rotate: `${index * 45}deg` }],
                  }
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Moon */}
        <Animated.View style={[styles.celestialElement, styles.moonContainer, moonStyle]}>
          <View style={styles.moonGlow}>
            <Moon size={36} color="#E5E7EB" fill="#E5E7EB" />
          </View>
          {/* Moon aura */}
          <View style={styles.moonAura} />
        </Animated.View>
      </View>

      {/* Enhanced Orbital Elements */}
      <Animated.View style={[styles.orbitalContainer, orbitalStyle]}>
        <View style={[styles.orbitalElement, { top: 50 }]}>
          <Star size={16} color="#1e3a8a" fill="#1e3a8a" />
        </View>
        <View style={[styles.orbitalElement, { bottom: 50, right: 0 }]}>
          <Sparkles size={14} color="#1e40af" />
        </View>
        <View style={[styles.orbitalElement, { left: 30, top: '50%' }]}>
          <Zap size={12} color="#1e3a8a" />
        </View>
        <View style={[styles.orbitalElement, { right: 30, top: '30%' }]}>
          <Star size={10} color="#1e40af" fill="#1e40af" />
        </View>
      </Animated.View>

      {/* NEW: Cosmic Energy Waves */}
      <Animated.View style={[styles.cosmicEnergyContainer, cosmicEnergyStyle]}>
        <View style={styles.energyWave1} />
        <View style={styles.energyWave2} />
        <View style={styles.energyWave3} />
      </Animated.View>

      {/* NEW: Lightning Effects */}
      <Animated.View style={[styles.lightningContainer, lightningStyle]}>
        <CloudLightning size={60} color="#1e3a8a" />
        <View style={styles.lightningFlash} />
      </Animated.View>

      {/* Enhanced Center Energy Glow */}
      <Animated.View style={[styles.centerGlow, centerGlowStyle]}>
        <LinearGradient
          colors={['rgba(30, 58, 138, 0.9)', 'rgba(30, 64, 175, 0.7)', 'rgba(59, 130, 246, 0.5)']}
          style={styles.glowGradient}
        />
      </Animated.View>

      {/* Enhanced Energy Pulse Effect */}
      <Animated.View style={[styles.energyPulse, energyPulseStyle]}>
        <View style={styles.pulseRing} />
        <View style={styles.pulseRing2} />
      </Animated.View>

      {/* Enhanced Floating Sparkles */}
      <Animated.View style={[styles.sparkleContainer, sparkleStyle]}>
        {[...Array(12)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.sparkle,
              {
                left: Math.random() * (width - 100) + 50,
                top: Math.random() * 300 + 150,
              }
            ]}
          >
            <Sparkles size={8 + Math.random() * 12} color="#1e3a8a" />
          </View>
        ))}
      </Animated.View>

      {/* Enhanced Phase Text */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.phaseText}>{getPhaseText()}</Text>
        <View style={styles.textUnderline} />
      </Animated.View>

      {/* Enhanced Card Reveal Placeholder */}
      {phase === 'revealing' && (
        <Animated.View style={[styles.cardReveal, cardRevealStyle]}>
          <LinearGradient
            colors={['#1e3a8a', '#1e40af', '#3b82f6']}
            style={styles.cardPlaceholder}
          >
            <Sparkles size={50} color="#FFFFFF" />
            <Text style={styles.cardRevealText}>Your cosmic message awaits</Text>
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
    minHeight: height * 0.8,
    position: 'relative',
    overflow: 'hidden',
  },
  
  // Enhanced universe background
  universeBackground: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    bottom: -100,
  },
  universeGradient: {
    flex: 1,
    borderRadius: width,
  },
  
  // Enhanced star field
  starField: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundStar: {
    position: 'absolute',
  },
  
  // Enhanced magic circles
  magicCircle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 350,
    height: 350,
    borderRadius: 175,
    borderWidth: 3,
    borderColor: 'rgba(30, 58, 138, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  middleCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: 'rgba(30, 64, 175, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1e3a8a',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  
  // NEW: Celestial elements
  celestialContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  celestialElement: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunContainer: {
    // Positioned relative to center
  },
  sunGlow: {
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  sunRays: {
    position: 'absolute',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunRay: {
    position: 'absolute',
    width: 3,
    height: 25,
    backgroundColor: '#1e3a8a',
    top: -35,
    borderRadius: 2,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  moonContainer: {
    // Positioned relative to center
  },
  moonGlow: {
    shadowColor: '#E5E7EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },
  moonAura: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(229, 231, 235, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.3)',
  },
  
  // NEW: Cosmic energy waves
  cosmicEnergyContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyWave1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(30, 58, 138, 0.6)',
  },
  energyWave2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.4)',
  },
  energyWave3: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  
  // NEW: Lightning effects
  lightningContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightningFlash: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(30, 58, 138, 0.8)',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  
  // Enhanced orbital elements
  orbitalContainer: {
    position: 'absolute',
    width: 380,
    height: 380,
  },
  orbitalElement: {
    position: 'absolute',
  },
  
  // Enhanced center glow
  centerGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
  },
  
  // Enhanced energy pulse
  energyPulse: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 125,
    borderWidth: 3,
    borderColor: 'rgba(30, 58, 138, 0.7)',
  },
  pulseRing2: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(30, 64, 175, 0.5)',
  },
  
  // Enhanced sparkles
  sparkleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
  },
  
  // Enhanced text
  textContainer: {
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F3F4F6',
    textAlign: 'center',
    fontStyle: 'italic',
    textShadowColor: 'rgba(30, 58, 138, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  textUnderline: {
    width: 60,
    height: 2,
    backgroundColor: '#1e3a8a',
    marginTop: 8,
    borderRadius: 1,
  },
  
  // Enhanced card reveal
  cardReveal: {
    position: 'absolute',
    width: 220,
    height: 140,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 25,
  },
  cardPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  cardRevealText: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});