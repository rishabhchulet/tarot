import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { CustomEyeIcon } from '@/components/CustomEyeIcon';

export default function AboutScreen() {
  const glowScale = useSharedValue(1);
  const iconPulse = useSharedValue(1);

  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1, true
    );
    iconPulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1, true
    );
  }, []);

  const animatedGlowStyle = useAnimatedStyle(() => ({ transform: [{ scale: glowScale.value }] }));
  const animatedIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconPulse.value }] }));

  const handleContinue = () => {
    router.push('/onboarding/intention');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#170a1c', '#0a0a0a']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.glow, animatedGlowStyle]} />

      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.iconGradient}>
            <CustomEyeIcon size={70} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>
        
        <Text style={styles.title}>Fascinating choice.{"\n"}I’m enjoying getting to know you.</Text>
        
        <Text style={styles.subtitle}>
          Now, a few more questions to bring your personal life map online.
        </Text>
      </View>
      
      <Pressable onPress={handleContinue}>
        <LinearGradient
            colors={['#8b5cf6', '#a855f7']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Next →</Text>
          </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, paddingHorizontal: 32, paddingTop: 80, paddingBottom: 40,
    backgroundColor: '#0a0a0a', overflow: 'hidden',
  },
  glow: {
    position: 'absolute', top: '10%', left: '50%', width: 400, height: 400,
    backgroundColor: 'rgba(139, 92, 246, 0.2)', borderRadius: 200,
    transform: [{ translateX: -200 }],
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconContainer: {
    width: 120, height: 120, alignItems: 'center', justifyContent: 'center',
    borderRadius: 30, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 },
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
    fontSize: 20, fontFamily: 'Inter-Regular', color: '#D1D5DB',
    textAlign: 'center', lineHeight: 28, maxWidth: 340,
  },
  primaryButton: {
    borderRadius: 12, paddingVertical: 18, paddingHorizontal: 32,
    alignItems: 'center', shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4,
    shadowRadius: 10, elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#F9FAFB',
  },
}); 