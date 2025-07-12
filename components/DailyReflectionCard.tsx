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
          withTiming(1.02, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
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
        <View style={styles.card}>
          <LinearGradient
            colors={hasDrawn 
              ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)'] 
              : ['rgba(251,191,36,0.2)', 'rgba(251,191,36,0.1)']}
            style={styles.gradient}
          >
            {!hasDrawn && (
              <Animated.View style={[styles.glow, animatedGlowStyle]} />
            )}
            <View style={styles.content}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: hasDrawn ? 'rgba(255,255,255,0.1)' : 'rgba(251,191,36,0.2)' }
              ]}>
                <Sparkles 
                  size={24} 
                  color={hasDrawn ? '#94a3b8' : '#fbbf24'} 
                />
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
                <ArrowRight size={16} color="#64748b" />
              </View>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  loadingState: {
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  gradient: {
    padding: 20,
  },
  glow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderRadius: 18,
    zIndex: -1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#f8fafc',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#64748b',
  },
  arrowContainer: {
    marginLeft: 12,
  },
}); 