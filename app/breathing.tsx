import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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

export default function BreathingScreen() {
  const [phase, setPhase] = useState<'prepare' | 'breathing'>('prepare');
  const [breathCount, setBreathCount] = useState(0);
  
  // Animation values
  const circleScale = useSharedValue(0.8);
  const circleOpacity = useSharedValue(0.6);
  const heartPulse = useSharedValue(1);
  const sparkleRotation = useSharedValue(0);
  const backgroundShimmer = useSharedValue(0);

  useEffect(() => {
    // Start ambient animations immediately
    startAmbientAnimations();
  }, []);

  useEffect(() => {
    if (phase === 'breathing') {
      startBreathingCycle();
    }
  }, [phase]);

  const startAmbientAnimations = () => {
    // Heart pulse animation
    heartPulse.value = withRepeat(
      withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Sparkle rotation
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    // Background shimmer
    backgroundShimmer.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  };

  const startBreathingCycle = () => {
    let currentBreath = 0;
    
    const breathingCycle = () => {
      // Inhale (4 seconds)
      circleScale.value = withTiming(1.4, { 
        duration: 4000, 
        easing: Easing.inOut(Easing.ease) 
      });
      circleOpacity.value = withTiming(0.9, { 
        duration: 4000, 
        easing: Easing.inOut(Easing.ease) 
      });

      // Hold briefly then exhale (4 seconds)
      setTimeout(() => {
        circleScale.value = withTiming(0.8, { 
          duration: 4000, 
          easing: Easing.inOut(Easing.ease) 
        });
        circleOpacity.value = withTiming(0.4, { 
          duration: 4000, 
          easing: Easing.inOut(Easing.ease) 
        });
      }, 4000);
    };

    // Start first cycle
    breathingCycle();
    currentBreath = 1;
    setBreathCount(1);

    // Continue cycles
    const interval = setInterval(() => {
      currentBreath++;
      setBreathCount(currentBreath);
      
      if (currentBreath <= 3) {
        breathingCycle();
      }
      
      if (currentBreath >= 3) {
        clearInterval(interval);
        // Wait for last cycle to complete, then navigate directly to main app
        setTimeout(() => {
          console.log('🎉 Breathing complete, navigating to main app...');
          router.replace('/(tabs)');
        }, 8000); // Wait for last cycle to complete
      }
    }, 8000); // 8 seconds per complete cycle

    return () => clearInterval(interval);
  };

  const handleStartBreathing = () => {
    console.log('🫁 Starting breathing exercise...');
    setPhase('breathing');
    setBreathCount(0);
  };

  // Animated styles
  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartPulse.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backgroundShimmer.value, [0, 1], [0.1, 0.3]),
  }));

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
            <View style={styles.iconContainer}>
              <Animated.View style={heartStyle}>
                <Heart size={60} color="#F59E0B" fill="#F59E0B" />
              </Animated.View>
            </View>

            <Text style={styles.title}>Take a Deep Breath</Text>
            <Text style={styles.subtitle}>
              Let's center yourself before you receive your first inner message.
            </Text>
            <Text style={styles.description}>
              Find a comfortable position and prepare to breathe deeply with intention.
            </Text>

            <Pressable style={styles.startButton} onPress={handleStartBreathing}>
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Begin Breathing</Text>
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
                  <Animated.View style={sparkleStyle}>
                    <Sparkles size={32} color="#FFFFFF" />
                  </Animated.View>
                </View>
              </Animated.View>
            </View>

            <Text style={styles.breathingText}>
              {getBreathingText()}
            </Text>
            
            <Text style={styles.breathingCount}>
              Breath {breathCount} of 3
            </Text>

            <Text style={styles.breathingInstruction}>
              Follow the circle as it expands and contracts
            </Text>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      {/* Animated background effects */}
      <Animated.View style={[styles.backgroundShimmer, backgroundStyle]} />
      
      {/* Floating particles */}
      <View style={styles.particleContainer}>
        {[...Array(8)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.particle,
              {
                left: Math.random() * 300 + 50,
                top: Math.random() * 600 + 100,
                animationDelay: `${index * 0.5}s`,
              }
            ]}
          >
            <Sparkles size={8} color="#F59E0B" />
          </View>
        ))}
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  
  // Background effects
  backgroundShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  
  particle: {
    position: 'absolute',
    opacity: 0.6,
  },
  
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  
  iconContainer: {
    marginBottom: 32,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 26,
  },
  
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    maxWidth: 300,
  },
  
  // Breathing animation
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 3,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  breathingText: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 16,
  },
  
  breathingCount: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
  },
  
  breathingInstruction: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Buttons
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  startButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  
  startButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});