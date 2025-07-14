import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withTiming, 
  Easing, 
  useAnimatedStyle,
  withRepeat,
  withSequence,
  interpolate,
  useDerivedValue
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.createAnimatedComponent(View);

const CIRCLE_LENGTH = 300; // 2 * Math.PI * 50
const R = CIRCLE_LENGTH / (2 * Math.PI);

interface ScoreGaugeProps {
  score: number; // 0-100
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const progress = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);

  React.useEffect(() => {
    // Main progress animation
    progress.value = withTiming(score / 100, { 
      duration: 2000, 
      easing: Easing.out(Easing.exp)
    });

    // Glow effect
    glowOpacity.value = withTiming(0.8, { 
      duration: 1000,
      easing: Easing.out(Easing.quad)
    });

    // Pulse animation for high scores
    if (score >= 70) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }

    // Sparkle rotation
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
  }, [score]);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_LENGTH * (1 - progress.value),
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(glowOpacity.value, [0, 1], [0.8, 1.1]) }],
  }));

  const animatedSparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const getStrokeColor = () => {
    if (score < 40) return '#ef4444'; // red
    if (score < 70) return '#f59e0b'; // amber
    return '#22c55e'; // green
  };

  const getGlowColor = () => {
    if (score < 40) return 'rgba(239, 68, 68, 0.4)'; // red glow
    if (score < 70) return 'rgba(245, 158, 11, 0.4)'; // amber glow
    return 'rgba(34, 197, 94, 0.4)'; // green glow
  };

  return (
    <View style={styles.container}>
      {/* Glow Effect Background */}
      <AnimatedView style={[styles.glowContainer, animatedGlowStyle, { backgroundColor: getGlowColor() }]} />
      
      {/* Sparkle Effects for High Scores */}
      {score >= 80 && (
        <AnimatedView style={[styles.sparkleContainer, animatedSparkleStyle]}>
          <View style={[styles.sparkle, { top: 10, left: 20 }]} />
          <View style={[styles.sparkle, { top: 30, right: 15 }]} />
          <View style={[styles.sparkle, { bottom: 25, left: 25 }]} />
          <View style={[styles.sparkle, { bottom: 15, right: 20 }]} />
        </AnimatedView>
      )}

      <Svg width={140} height={140} viewBox="0 0 140 140" style={styles.svg}>
        <Defs>
          <RadialGradient id="scoreGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor={getStrokeColor()} stopOpacity="1" />
            <Stop offset="100%" stopColor={getStrokeColor()} stopOpacity="0.6" />
          </RadialGradient>
        </Defs>
        
        {/* Background Circle */}
        <Circle
          cx="70"
          cy="70"
          r={R}
          stroke="rgba(51, 65, 85, 0.3)"
          strokeWidth="12"
        />
        
        {/* Progress Circle */}
        <AnimatedCircle
          cx="70"
          cy="70"
          r={R}
          stroke="url(#scoreGradient)"
          strokeWidth="12"
          strokeDasharray={CIRCLE_LENGTH}
          animatedProps={animatedCircleProps}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ filter: 'drop-shadow(0px 0px 8px rgba(255,255,255,0.3))' }}
        />
      </Svg>
      
      <AnimatedView style={[styles.textContainer, animatedTextStyle]}>
        <Text style={[styles.scoreText, { color: getStrokeColor() }]}>{score}</Text>
        <Text style={styles.scoreLabel}>Overall Score</Text>
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.3,
    zIndex: -1,
  },
  sparkleContainer: {
    position: 'absolute',
    width: 180,
    height: 180,
    zIndex: 1,
  },
  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    opacity: 0.9,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  svg: {
    zIndex: 0,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  scoreText: {
    fontFamily: 'Inter-Black',
    fontSize: 42,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  scoreLabel: {
    color: '#e2e8f0',
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
    marginTop: 4,
  },
}); 