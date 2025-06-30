import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  Easing,
  withSequence 
} from 'react-native-reanimated';

export default function BreathScreen() {
  const [phase, setPhase] = useState<'prepare' | 'breathing' | 'complete'>('prepare');
  const [breathCount, setBreathCount] = useState(0);
  const circleScale = useSharedValue(0.8);

  useEffect(() => {
    if (phase === 'breathing') {
      // Breathing animation cycle
      const animate = () => {
        circleScale.value = withSequence(
          withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }), // Inhale
          withTiming(0.8, { duration: 4000, easing: Easing.inOut(Easing.ease) })  // Exhale
        );
      };
      
      animate();
      const interval = setInterval(() => {
        animate();
        setBreathCount(prev => {
          if (prev + 1 >= 3) {
            setPhase('complete');
            return prev + 1;
          }
          return prev + 1;
        });
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [phase]);

  const startBreathing = () => {
    console.log('🫁 Starting breathing exercise...');
    setPhase('breathing');
    setBreathCount(0);
  };

  const handleContinue = () => {
    console.log('📱 Breathing complete, navigating to tutorial...');
    router.push('/onboarding/tutorial');
  };

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: circleScale.value }],
    };
  });

  const renderContent = () => {
    switch (phase) {
      case 'prepare':
        return (
          <>
            <Text style={styles.title}>Take a Deep Breath</Text>
            <Text style={styles.subtitle}>
              Let's set your intention for this inner journey together.
            </Text>
            <Text style={styles.description}>
              Find a comfortable position and prepare to breathe deeply with me.
            </Text>
            <Pressable style={styles.startButton} onPress={startBreathing}>
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
            <Animated.View style={[styles.breathingCircle, animatedCircleStyle]} />
            <Text style={styles.breathingText}>
              {breathCount < 3 ? 'Breathe in... and out...' : 'One more breath...'}
            </Text>
            <Text style={styles.breathingCount}>
              Breath {breathCount + 1} of 3
            </Text>
          </>
        );
      
      case 'complete':
        return (
          <>
            <Text style={styles.title}>Perfect</Text>
            <Text style={styles.subtitle}>
              You're now centered and ready to begin your tarot journey.
            </Text>
            <Text style={styles.description}>
              Your intention has been set. Let's learn how to use your daily reflection practice.
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
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      {phase === 'complete' && (
        <Pressable style={styles.button} onPress={handleContinue}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Continue to Tutorial</Text>
          </LinearGradient>
        </Pressable>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'CormorantGaramond-Bold',
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
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
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
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 3,
    borderColor: '#3B82F6',
    marginBottom: 40,
  },
  breathingText: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 16,
  },
  breathingCount: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});