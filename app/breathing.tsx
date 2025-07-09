import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Heart, Sparkles } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function BreathingScreen() {
  const [phase, setPhase] = useState<'prepare' | 'breathing' | 'done'>('prepare');
  const [breathCount, setBreathCount] = useState(0);
  
  const circleScale = useSharedValue(0.8);
  const circleOpacity = useSharedValue(0.6);
  const heartPulse = useSharedValue(1);
  const sparkleRotation = useSharedValue(0);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );
    startAmbientAnimations();
  }, []);

  useEffect(() => {
    if (phase === 'breathing') {
      startBreathingCycle();
    }
  }, [phase]);

  const startAmbientAnimations = () => {
    heartPulse.value = withRepeat(withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
    sparkleRotation.value = withRepeat(withTiming(360, { duration: 8000, easing: Easing.linear }), -1, false);
  };

  const startBreathingCycle = () => {
    let currentBreath = 0;
    
    const breathingCycle = () => {
      circleScale.value = withTiming(1.4, { duration: 4000, easing: Easing.inOut(Easing.ease) });
      circleOpacity.value = withTiming(0.9, { duration: 4000, easing: Easing.inOut(Easing.ease) });
      setTimeout(() => {
        circleScale.value = withTiming(0.8, { duration: 4000, easing: Easing.inOut(Easing.ease) });
        circleOpacity.value = withTiming(0.4, { duration: 4000, easing: Easing.inOut(Easing.ease) });
      }, 4000);
    };

    breathingCycle();
    currentBreath = 1;
    setBreathCount(1);

    const interval = setInterval(() => {
      currentBreath++;
      setBreathCount(currentBreath);
      if (currentBreath <= 3) breathingCycle();
      if (currentBreath >= 3) {
        clearInterval(interval);
        setTimeout(() => setPhase('done'), 8000);
      }
    }, 8000);

    return () => clearInterval(interval);
  };

  const handleStartBreathing = () => setPhase('breathing');
  const handleReady = () => router.push('/onboarding/astrology');

  const animatedGlowStyle = useAnimatedStyle(() => ({ transform: [{ scale: glowScale.value }] }));
  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: circleScale.value }], opacity: circleOpacity.value }));
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartPulse.value }] }));
  const sparkleStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${sparkleRotation.value}deg` }] }));

  const getBreathingText = () => {
    if (breathCount === 1) return 'Breathe in... and out...';
    if (breathCount === 2) return 'Feel your body relaxing...';
    if (breathCount === 3) return 'One more deep breath...';
    return 'Breathe in... and out...';
  };

  const renderContent = () => {
    switch (phase) {
      case 'prepare':
        return (
          <>
            <Animated.View style={[styles.iconContainer, heartStyle]}>
              <LinearGradient colors={['#10b981', '#34d399']} style={styles.iconGradient}>
                <Heart size={80} color="#FFFFFF" fill="#FFFFFF" strokeWidth={1.5} />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.title}>Connect inward before we begin</Text>
            <Text style={styles.subtitle}>
              Take three slow, deep breaths. Allow your inner clarity to rise.
            </Text>

            <Pressable onPress={handleStartBreathing}>
              <LinearGradient colors={['#10b981', '#34d399']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Begin Breathing</Text>
              </LinearGradient>
            </Pressable>
          </>
        );
      case 'breathing':
        return (
          <>
            <View style={styles.breathingContainer}>
              <Animated.View style={[styles.breathingCircle, circleStyle]}>
                <View style={styles.innerCircle}>
                  <Animated.View style={sparkleStyle}><Sparkles size={32} color="#FFFFFF" /></Animated.View>
                </View>
              </Animated.View>
            </View>
            <Text style={styles.breathingText}>{getBreathingText()}</Text>
            <Text style={styles.breathingCount}>Breath {breathCount} of 3</Text>
          </>
        );
      case 'done':
        return (
          <>
            <Animated.View style={[styles.iconContainer, heartStyle]}>
              <LinearGradient colors={['#10b981', '#34d399']} style={styles.iconGradient}>
                <Heart size={80} color="#FFFFFF" fill="#FFFFFF" strokeWidth={1.5} />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.title}>Centered</Text>
            <Pressable onPress={handleReady}>
              <LinearGradient colors={['#10b981', '#34d399']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>I'm Ready →</Text>
              </LinearGradient>
            </Pressable>
          </>
        );
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#051111', '#0a0a0a']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.glow, animatedGlowStyle]} />
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', overflow: 'hidden' },
  glow: {
    position: 'absolute', top: '20%', left: '50%', width: 400, height: 400,
    backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: 200,
    transform: [{ translateX: -200 }], filter: 'blur(90px)', 
  },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  iconContainer: {
    width: 120, height: 120, alignItems: 'center', justifyContent: 'center',
    borderRadius: 30, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 10, marginBottom: 48,
  },
  iconGradient: {
    width: '100%', height: '100%', borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: 32, fontFamily: 'Inter-Bold', color: '#F9FAFB',
    textAlign: 'center', marginBottom: 24, lineHeight: 40,
  },
  subtitle: {
    fontSize: 18, fontFamily: 'Inter-Regular', color: '#D1D5DB',
    textAlign: 'center', lineHeight: 26, maxWidth: 320, marginBottom: 48,
  },
  primaryButton: {
    borderRadius: 12, paddingVertical: 18, paddingHorizontal: 32,
    alignItems: 'center', shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4,
    shadowRadius: 10, elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#F9FAFB',
  },
  breathingContainer: {
    width: screenWidth * 0.8, height: screenWidth * 0.8,
    alignItems: 'center', justifyContent: 'center', marginBottom: 48,
  },
  breathingCircle: {
    width: '100%', height: '100%',
    borderRadius: (screenWidth * 0.8) / 2,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  innerCircle: {
    width: '50%', height: '50%',
    borderRadius: (screenWidth * 0.4) / 2,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  breathingText: {
    fontSize: 24, fontFamily: 'Inter-SemiBold', color: '#F9FAFB',
    textAlign: 'center', marginBottom: 16,
  },
  breathingCount: {
    fontSize: 16, fontFamily: 'Inter-Medium', color: '#A1A1AA',
    textAlign: 'center',
  },
});