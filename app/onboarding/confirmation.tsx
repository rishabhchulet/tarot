import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CircleCheck as CheckCircle } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay, Easing } from 'react-native-reanimated';

export default function ConfirmationScreen() {
  const glowScale = useSharedValue(1);
  const iconScale = useSharedValue(0.8);

  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );
    iconScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(2)) });
  }, []);

  const animatedGlowStyle = useAnimatedStyle(() => ({ transform: [{ scale: glowScale.value }] }));
  const animatedIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));

  const handleContinue = () => router.replace('/(tabs)');

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#052e16', '#064e3b', '#052e16']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.glow, animatedGlowStyle]} />

      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          <LinearGradient colors={['#10b981', '#6ee7b7']} style={styles.iconGradient}>
            <CheckCircle size={80} color="#FFFFFF" strokeWidth={1.5} />
          </LinearGradient>
        </Animated.View>
        
        <Text style={styles.title}>Powerful.</Text>
        
        <Text style={styles.subtitle}>
          You are ready to begin. Each day, you will have the opportunity to connect intentionally. If you’re consistent, you will notice powerful shifts from the inside out.
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Pressable onPress={handleContinue}>
          <LinearGradient
              colors={['#10b981', '#34d399']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Let’s Go →</Text>
            </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#052e16' },
  glow: {
    position: 'absolute', top: '15%', left: '50%', width: 400, height: 400,
    backgroundColor: 'rgba(16, 185, 129, 0.25)', borderRadius: 200,
    transform: [{ translateX: -200 }],
  },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  iconContainer: {
    width: 120, height: 120, alignItems: 'center', justifyContent: 'center',
    borderRadius: 60, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 10, marginBottom: 32, alignSelf: 'center',
  },
  iconGradient: {
    width: '100%', height: '100%', borderRadius: 60,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: 40, fontFamily: 'Inter-Bold', color: '#F8FAFC',
    textAlign: 'center', marginBottom: 24,
  },
  subtitle: {
    fontSize: 18, fontFamily: 'Inter-Regular', color: '#d1fae5',
    textAlign: 'center', lineHeight: 28, maxWidth: 340,
  },
  buttonContainer: { paddingHorizontal: 32, paddingBottom: 40, paddingTop: 20 },
  primaryButton: {
    borderRadius: 12, paddingVertical: 18, alignItems: 'center',
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  primaryButtonText: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#064e3b' },
}); 