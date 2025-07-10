import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Feather } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';

export default function IntentionScreen() {
  const glowScale = useSharedValue(1);
  const iconScale = useSharedValue(1);

  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );
  }, []);

  const animatedGlowStyle = useAnimatedStyle(() => ({ transform: [{ scale: glowScale.value }] }));
  const animatedIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));

  const handleContinue = () => {
    router.push('/breathing');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#0f0f0f', '#1a1a1a']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.glow, animatedGlowStyle]} />

      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          <LinearGradient colors={['#ec4899', '#f87171']} style={styles.iconGradient}>
            <Feather size={80} color="#FFFFFF" strokeWidth={1.5} />
          </LinearGradient>
        </Animated.View>
        
        <Text style={styles.title}>Everything begins with intention.</Text>
        
        <Text style={styles.subtitle}>
          Pause and check with your heart. Then, take a deep breath as you focus on your intention to connect to yourself.
        </Text>
      </View>
      
      <Pressable onPress={handleContinue}>
        <LinearGradient
            colors={['#ec4899', '#f87171']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Set My Intention</Text>
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
    backgroundColor: 'rgba(236, 72, 153, 0.2)', borderRadius: 200,
    transform: [{ translateX: -200 }],
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconContainer: {
    width: 120, height: 120, alignItems: 'center', justifyContent: 'center',
    borderRadius: 30, shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 },
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
    textAlign: 'center', lineHeight: 26, maxWidth: 320,
  },
  primaryButton: {
    borderRadius: 12, paddingVertical: 18, paddingHorizontal: 32,
    alignItems: 'center', shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4,
    shadowRadius: 10, elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#F9FAFB',
  },
}); 