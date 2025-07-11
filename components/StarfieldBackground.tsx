import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const NUM_STARS = 150;

const Star = ({ size, x, y, duration, delay }) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top: y,
          left: x,
        },
        style,
      ]}
    />
  );
};

export function StarfieldBackground() {
  const stars = React.useMemo(
    () =>
      Array.from({ length: NUM_STARS }).map((_, i) => ({
        id: i,
        size: Math.random() * 2 + 1,
        x: Math.random() * width,
        y: Math.random() * height,
        duration: Math.random() * 4000 + 4000,
        delay: Math.random() * 8000,
      })),
    []
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map(star => (
        <Star key={star.id} {...star} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0a',
    zIndex: -1,
  },
  star: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
}); 