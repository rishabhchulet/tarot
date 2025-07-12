import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Sparkles, Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface PlanetaryLoadingAnimationProps {
  message?: string;
  submessage?: string;
  showFloatingStars?: boolean;
}

export function PlanetaryLoadingAnimation({ 
  message = 'Weaving Cosmic Wisdom',
  submessage = 'Aligning the celestial energies...',
  showFloatingStars = true
}: PlanetaryLoadingAnimationProps) {
  const rotation = useSharedValue(0);
  const planetScale = useSharedValue(0.8);
  const glowPulse = useSharedValue(0.7);
  const textOpacity = useSharedValue(0);
  const orbitRotation = useSharedValue(0);

  useEffect(() => {
    // Main rotation animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    // Orbit rotation (slower)
    orbitRotation.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );

    // Planet scale animation
    planetScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Glow pulse animation
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Text fade in
    textOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
  }, []);

  const animatedRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedOrbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitRotation.value}deg` }],
  }));

  const animatedPlanetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: planetScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
    transform: [{ scale: 1 + glowPulse.value * 0.2 }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Central Glow */}
      <Animated.View style={[styles.centralGlow, animatedGlowStyle]} />
      
      {/* Outer Orbit */}
      <Animated.View style={[styles.outerOrbit, animatedOrbitStyle]}>
        <View style={styles.outerPlanet} />
      </Animated.View>
      
      {/* Middle Orbit */}
      <Animated.View style={[styles.middleOrbit, animatedRotationStyle]}>
        <Animated.View style={[styles.middlePlanet, animatedPlanetStyle]} />
      </Animated.View>
      
      {/* Inner Orbit */}
      <Animated.View style={[styles.innerOrbit, animatedOrbitStyle]}>
        <View style={styles.innerPlanet} />
      </Animated.View>
      
      {/* Center Core */}
      <Animated.View style={[styles.centerCore, animatedPlanetStyle]}>
        <Sparkles size={24} color="#fbbf24" />
      </Animated.View>
      
      {/* Floating Stars */}
      {showFloatingStars && (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.floatingStar,
                {
                  left: 50 + (i * 60),
                  top: 100 + (i % 3) * 120,
                },
                animatedGlowStyle,
              ]}
            >
              <Star size={8} color="#fbbf24" fill="#fbbf24" />
            </Animated.View>
          ))}
        </>
      )}
      
      {/* Text Content */}
      <Animated.View style={[styles.textContainer, animatedTextStyle]}>
        <Text style={styles.title}>{message}</Text>
        <Text style={styles.subtitle}>{submessage}</Text>
        <View style={styles.progressDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
    position: 'relative',
  },
  centralGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    zIndex: 0,
  },
  outerOrbit: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  outerPlanet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
    marginTop: -4,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  middleOrbit: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  middlePlanet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fbbf24',
    marginTop: -6,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  innerOrbit: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  innerPlanet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d97706',
    marginTop: -3,
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  centerCore: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    zIndex: 10,
  },
  floatingStar: {
    position: 'absolute',
    opacity: 0.6,
  },
  textContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
  },
  dotActive: {
    backgroundColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
}); 