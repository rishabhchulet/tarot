import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Moon, Sparkles } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export default function BreathingScreen() {
  const [phase, setPhase] = useState<'prepare' | 'breathing' | 'done'>('prepare');
  const [breathCount, setBreathCount] = useState(0);
  
  // Animation values
  const glowScale = useSharedValue(1);
  const iconScale = useSharedValue(1);
  const circleScale = useSharedValue(0.8);
  const circleOpacity = useSharedValue(0.6);
  const sparkleRotation = useSharedValue(0);


  useEffect(() => {
    // Background glow animation
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );
    
    // Icon pulse animation
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );

    // Sparkle animation for breathing phase
    sparkleRotation.value = withRepeat(withTiming(360, { duration: 8000, easing: Easing.linear }), -1, false);

  }, []);

  useEffect(() => {
    if (phase === 'breathing') {
      startBreathingExercise();
    }
  }, [phase]);

  const startBreathingExercise = () => {
    let currentBreath = 0;
    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const breathingCycle = () => {
      circleScale.value = withTiming(1.2, { duration: 4000, easing: Easing.inOut(Easing.ease) });
      circleOpacity.value = withTiming(0.9, { duration: 4000, easing: Easing.inOut(Easing.ease) });
      setTimeout(() => {
        circleScale.value = withTiming(0.8, { duration: 4000, easing: Easing.inOut(Easing.ease) });
        circleOpacity.value = withTiming(0.4, { duration: 4000, easing: Easing.inOut(Easing.ease) });
      }, 4000);
    };

    breathingCycle();
    currentBreath = 1;
    setBreathCount(1);

    intervalId = setInterval(() => {
      currentBreath++;
      setBreathCount(currentBreath);
      if (currentBreath <= 3) breathingCycle();
      if (currentBreath >= 3) {
        clearInterval(intervalId);
        // Store timeout ID for cleanup
        timeoutId = setTimeout(() => setPhase('done'), 8000);
      }
    }, 8000);

    // Return cleanup function that clears both interval and timeout
    return () => {
      clearInterval(intervalId);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  };

  const handleStartBreathing = () => setPhase('breathing');
  const handleReady = () => {
    // Use replace to cleanly return to onboarding flow and avoid iOS stack issues
    router.replace('/onboarding/astrology');
  };

  const animatedGlowStyle = useAnimatedStyle(() => ({ transform: [{ scale: glowScale.value }] }));
  const animatedIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));
  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: circleScale.value }], opacity: circleOpacity.value }));
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
            <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
              <Moon size={80} color="#FFFFFF" strokeWidth={1.5} />
            </Animated.View>

            <Text style={styles.title}>Connect inward before we begin</Text>
            <Text style={styles.subtitle}>
              Take three slow, deep breaths. Allow your inner clarity to rise.
            </Text>

            <Pressable style={styles.primaryButton} onPress={handleStartBreathing}>
              <Text style={styles.primaryButtonText}>Begin Breathing</Text>
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
            <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
               <Moon size={80} color="#FFFFFF" strokeWidth={1.5} />
            </Animated.View>
            <Text style={styles.title}>Centered</Text>
            <Pressable style={styles.primaryButton} onPress={handleReady}>
              <Text style={styles.primaryButtonText}>I'm Ready →</Text>
            </Pressable>
          </>
        );
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050f0a', '#0a1a1a', '#050f0a']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.glow, animatedGlowStyle]} />
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0a0a0a', 
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute', top: '20%', left: '50%', width: 400, height: 400,
    backgroundColor: 'rgba(52, 211, 153, 0.2)', // Mint green glow
    borderRadius: 200,
    transform: [{ translateX: -200 }], 
  },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  iconContainer: {
    width: 120, height: 120, alignItems: 'center', justifyContent: 'center',
    borderRadius: 30, 
    backgroundColor: '#34d399', // Solid mint green
    shadowColor: '#34d399', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, 
    shadowRadius: 20, 
    elevation: 10, 
    marginBottom: 48,
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
    backgroundColor: '#34d399', // Solid mint green
    borderRadius: 12, paddingVertical: 18, paddingHorizontal: 32,
    alignItems: 'center', 
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.4,
    shadowRadius: 10, 
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#052e16', // Darker text for contrast
  },
  breathingContainer: {
    width: 300, height: 300,
    alignItems: 'center', justifyContent: 'center', marginBottom: 48,
  },
  breathingCircle: {
    width: '100%', height: '100%',
    borderRadius: 150,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  innerCircle: {
    width: '50%', height: '50%',
    borderRadius: 75,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
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