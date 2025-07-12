import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CIRCLE_LENGTH = 300; // 2 * Math.PI * 50
const R = CIRCLE_LENGTH / (2 * Math.PI);

interface ScoreGaugeProps {
  score: number; // 0-100
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(score / 100, { 
        duration: 1500, 
        easing: Easing.out(Easing.exp)
    });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_LENGTH * (1 - progress.value),
  }));

  const getStrokeColor = () => {
    if (score < 40) return '#ef4444'; // red
    if (score < 70) return '#f59e0b'; // amber
    return '#22c55e'; // green
  };

  return (
    <View style={styles.container}>
      <Svg width={120} height={120} viewBox="0 0 120 120">
        <Circle
          cx="60"
          cy="60"
          r={R}
          stroke="#334155"
          strokeWidth="10"
        />
        <AnimatedCircle
          cx="60"
          cy="60"
          r={R}
          stroke={getStrokeColor()}
          strokeWidth="10"
          strokeDasharray={CIRCLE_LENGTH}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.scoreText}>{score}</Text>
        <Text style={styles.scoreLabel}>Overall Score</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    color: '#f8fafc',
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    // Add additional styling for better visibility
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  scoreLabel: {
    color: '#d1d5db',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
}); 