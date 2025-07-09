import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  Easing 
} from 'react-native-reanimated';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  progress?: number; // 0-100
  showProgress?: boolean;
}

export function LoadingState({ 
  message = 'Loading...', 
  submessage,
  progress,
  showProgress = false 
}: LoadingStateProps) {
  const sparkleRotation = useSharedValue(0);
  const sparkleScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  React.useEffect(() => {
    // Sparkle rotation animation
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );

    // Sparkle scale animation
    sparkleScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Glow effect
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const sparkleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${sparkleRotation.value}deg` },
        { scale: sparkleScale.value }
      ],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />
      {/* Background glow effect */}
      <Animated.View style={[styles.backgroundGlow, glowAnimatedStyle]} />
      
      <View style={styles.content}>
        {/* Animated icon */}
        <View style={styles.iconContainer}>
          <Animated.View style={sparkleAnimatedStyle}>
            <Sparkles size={48} color="#1e3a8a" strokeWidth={1.5} />
          </Animated.View>
        </View>
        
        {/* Main message */}
        <Text style={styles.message}>{message}</Text>
        
        {/* Submessage */}
        {submessage && (
          <Text style={styles.submessage}>{submessage}</Text>
        )}
        
        {/* Progress bar */}
        {showProgress && progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#1e3a8a', '#1e40af']}
                style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, progress))}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}
        
        {/* Connection status dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                useAnimatedStyle(() => ({
                  opacity: withRepeat(
                    withSequence(
                      withTiming(0.3, { duration: 200 }),
                      withTiming(1, { duration: 400 }),
                      withTiming(0.3, { duration: 200 })
                    ),
                    -1,
                    false
                  ),
                  transform: [
                    {
                      scale: withRepeat(
                        withSequence(
                          withTiming(0.8, { duration: 300 }),
                          withTiming(1.2, { duration: 300 }),
                          withTiming(1, { duration: 300 })
                        ),
                        -1,
                        false
                      ),
                    },
                  ],
                }))
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  backgroundGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    top: '40%',
    alignSelf: 'center',
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 24,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  message: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 8,
  },
  submessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    maxWidth: 280,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: 200,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#D1D5DB',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
});