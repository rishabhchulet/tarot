import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  withDelay,
} from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';

const OrbitingCircle = ({ radius, delay, duration, size }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = Math.cos(progress.value * 2 * Math.PI) * radius;
    const translateY = Math.sin(progress.value * 2 * Math.PI) * radius;
    const scale = interpolate(progress.value, [0, 0.5, 1], [0.5, 1, 0.5]);
    return {
      transform: [{ translateX }, { translateY }, { scale }],
    };
  });

  return <Animated.View style={[styles.orbitingCircle, { width: size, height: size }, animatedStyle]} />;
};

export function GeneratingPlacements() {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.8, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
  }, []);

  const animatedCoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <Animated.View style={[styles.core, animatedCoreStyle]}>
          <Sparkles size={40} color="#F9FAFB" />
        </Animated.View>
        <OrbitingCircle radius={60} delay={0} duration={8000} size={12} />
        <OrbitingCircle radius={90} delay={500} duration={12000} size={8} />
        <OrbitingCircle radius={120} delay={1000} duration={16000} size={10} />
      </View>
      <Text style={styles.text}>Generating your cosmic blueprint...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
  },
  animationContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  orbitingCircle: {
    position: 'absolute',
    backgroundColor: '#60A5FA',
    borderRadius: 10,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  text: {
    marginTop: 32,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#D1D5DB',
  },
}); 