import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { hasDrawnCardToday } from '@/utils/database';

export function DailyReflectionCard() {
  const [hasDrawn, setHasDrawn] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      const drawn = await hasDrawnCardToday();
      setHasDrawn(drawn);
      setLoading(false);
    };
    checkStatus();
  }, []);

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.7);

  useEffect(() => {
    if (!hasDrawn && !loading) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ), -1, true
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.7, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ), -1, true
      );
    }
  }, [hasDrawn, loading]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (loading) {
    return <View style={[styles.container, styles.loadingState]} />;
  }
  
  const handlePress = () => {
    if (hasDrawn) {
      router.push('/daily-question');
    } else {
      router.push('/draw');
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <LinearGradient
          colors={hasDrawn ? ['#374151', '#1f2937'] : ['#3B82F6', '#60A5FA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {!hasDrawn && (
            <Animated.View style={[styles.glow, animatedGlowStyle]} />
          )}
          <View style={styles.iconContainer}>
            <Sparkles size={28} color="#f9fafb" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {hasDrawn ? "Review Today's Reading" : 'Your Daily Reading is Ready'}
            </Text>
            <Text style={styles.subtitle}>
              {hasDrawn ? 'Revisit your reflection for today' : 'Tap here to draw your card'}
            </Text>
          </View>
          <View style={styles.arrowContainer}>
            <ArrowRight size={24} color="#e5e7eb" />
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    shadowColor: '#818cf8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  loadingState: {
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    opacity: 0.7,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#f9fafb',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#e5e7eb',
  },
  arrowContainer: {
    marginLeft: 16,
  },
}); 