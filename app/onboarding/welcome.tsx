import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomeScreen() {
  const { user } = useAuth();
  const glowScale = useSharedValue(1);
  const iconTranslateY = useSharedValue(0);
  
  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    iconTranslateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: glowScale.value }],
    };
  });
  
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: iconTranslateY.value }],
    };
  });

  const handleContinue = () => {
    console.log('📱 Navigating to quiz screen...');
    router.push('/onboarding/quiz');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a']}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.glow, animatedGlowStyle]} />

      <View style={styles.content}>
        <View style={styles.iconSection}>
          <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
            <LinearGradient
              colors={['#1e40af', '#3b82f6']}
              style={styles.iconGradient}
            >
              <Sparkles size={80} color="#FFFFFF" strokeWidth={1.5} />
            </LinearGradient>
          </Animated.View>
        </View>
        
        <Text style={styles.title}>Welcome{user?.name ? `, ${user.name}` : ''}.</Text>
        
        <Text style={styles.subtitle}>
          It's no coincidence you are here. This tool is a mirror and a guide, to help you tap into your inner wisdom.
        </Text>
        
      </View>
      
      <Pressable onPress={handleContinue}>
        <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Let’s Begin →</Text>
          </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
    backgroundColor: '#0a0a0a',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '10%',
    left: '50%',
    width: 400,
    height: 400,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 200,
    transform: [{ translateX: -200 }],
    filter: 'blur(80px)', 
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSection: {
    marginBottom: 48,
  },
  iconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
    maxWidth: 320,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
  },
});