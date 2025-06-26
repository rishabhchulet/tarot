import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  Easing 
} from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';

export default function WelcomeScreen() {
  const sparkleScale = useSharedValue(1);
  const sparkleRotation = useSharedValue(0);

  useEffect(() => {
    sparkleScale.value = withRepeat(
      withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedSparkleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: sparkleScale.value },
        { rotate: `${sparkleRotation.value}deg` }
      ],
    };
  });

  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, animatedSparkleStyle]}>
          <Sparkles size={80} color="#F59E0B" strokeWidth={1.5} />
        </Animated.View>
        
        <Text style={styles.title}>Daily Tarot{'\n'}Reflection</Text>
        
        <Text style={styles.subtitle}>
          Welcome, friend. I'm your companion on this journey of self-connection.
        </Text>
        
        <Text style={styles.description}>
          Let's begin with understanding who you are and what matters most to you right now.
        </Text>
      </View>
      
      <Pressable style={styles.button} onPress={() => router.push('/onboarding/name')}>
        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Begin Your Journey</Text>
        </LinearGradient>
      </Pressable>
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
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
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