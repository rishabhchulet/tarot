import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  Easing
} from 'react-native-reanimated';

export default function AuthWelcomeScreen() {
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
        
        <Text style={styles.title}>Daily Inner{'\n'}Reflection</Text>
        
        <Text style={styles.subtitle}>
          Connect directly with your inner wisdom through this daily mirror into yourself.
        </Text>
        
        <Text style={styles.description}>
          Join thousands discovering their path to self-connection and growth.
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/auth/signup')}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.buttonGradient}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </LinearGradient>
        </Pressable>
        
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/auth/signin')}>
          <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
        </Pressable>
      </View>
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
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
});