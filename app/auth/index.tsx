import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CircleCheck as CheckCircle } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  interpolate
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { MandalaIcon } from '@/components/MandalaIcon';

export default function AuthWelcomeScreen() {
  const { user, session } = useAuth();
  
  React.useEffect(() => {
    if (user && session) {
      router.replace('/(tabs)');
    }
  }, [user, session]);

  // Animation values
  const iconRotation = useSharedValue(0);
  const iconScale = useSharedValue(1);
  const glowScale = useSharedValue(1);
  const particleRotation = useSharedValue(0);
  const particleOpacity = useSharedValue(0.6);

  useEffect(() => {
    // Pulsating glow animation
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Enhanced mandala rotation: starts fast, then slows down to gentle rotation
    iconRotation.value = withSequence(
      // Fast initial spin (3 full rotations in 2 seconds)
      withTiming(1080, { duration: 2000, easing: Easing.out(Easing.cubic) }),
      // Then continue with slow, eternal rotation
      withRepeat(
        withTiming(1080 + 360, { duration: 20000, easing: Easing.linear }),
        -1,
        false
      )
    );

    // Add a scaling effect that complements the rotation
    iconScale.value = withSequence(
      withTiming(1.1, { duration: 1000, easing: Easing.out(Easing.back(1.5)) }),
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Add particle effects for extra ambiance
    particleRotation.value = withRepeat(
      withTiming(360, { duration: 30000, easing: Easing.linear }),
      -1,
      false
    );

    particleOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [user, session]);

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: glowScale.value }],
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${iconRotation.value}deg` },
        { scale: iconScale.value }
      ],
    };
  });

  const animatedParticleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${particleRotation.value}deg` }],
      opacity: particleOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Background Glow */}
      <Animated.View style={[styles.glow, animatedGlowStyle]} />

      {!(user || session) && (
        <View style={styles.signOutSuccess}>
          <CheckCircle size={16} color="#10B981" />
          <Text style={styles.signOutSuccessText}>Successfully signed out</Text>
        </View>
      )}
      
      {(user || session) && (
        <View style={styles.signOutError}>
          <Text style={styles.signOutErrorText}>⚠️ Sign out incomplete</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.iconSection}>
          {/* Floating Particles for Sacred Geometry Ambiance */}
          <Animated.View style={[styles.particleContainer, animatedParticleStyle]}>
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i * 45) * (Math.PI / 180);
              const radius = 80;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <View
                  key={i}
                  style={[
                    styles.particle,
                    {
                      transform: [
                        { translateX: x },
                        { translateY: y },
                      ],
                    },
                  ]}
                />
              );
            })}
          </Animated.View>

          <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
            <LinearGradient
              colors={['#1e40af', '#3b82f6']}
              style={styles.iconGradient}
            >
              <MandalaIcon size={100} color="#FFFFFF" strokeWidth={1.2} />
            </LinearGradient>
          </Animated.View>
        </View>
        
        <Text style={styles.title}>Daily Inner{'\n'}Reflection</Text>
        
        <Text style={styles.subtitle}>
          Connect with your inner wisdom through daily reflection.
        </Text>
      </View>
      
      <View style={styles.buttonSection}>
        <Pressable onPress={() => router.push('/auth/signup')}>
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </LinearGradient>
        </Pressable>
        
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/auth/signin')}>
          <Text style={styles.secondaryButtonText}>
            Already have an account? <Text style={styles.linkHighlight}>Sign In</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
    backgroundColor: '#0a0a0a',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '10%',
    left: '50%',
    width: 400,
    height: 400,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 200,
    transform: [{ translateX: -200 }],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSection: {
    marginBottom: 48,
  },
  iconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 280,
  },
  buttonSection: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  linkHighlight: {
    color: '#60a5fa',
    fontFamily: 'Inter-Medium',
  },
  signOutSuccess: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 8,
    zIndex: 10,
  },
  signOutSuccessText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
  signOutError: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    zIndex: 10,
  },
  signOutErrorText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginBottom: 4,
  },
  particleContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    opacity: 0.3,
    backgroundColor: 'transparent',
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});