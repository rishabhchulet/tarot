import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles, CircleCheck as CheckCircle } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSequence,
  withRepeat,
  Easing
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthWelcomeScreen() {
  const { user, session } = useAuth();
  
  // Animation values
  const iconRotation = useSharedValue(0);
  const iconScale = useSharedValue(0.8);
  const iconOpacity = useSharedValue(0.6);
  const glowPulse = useSharedValue(0.3);

  useEffect(() => {
    console.log('🔍 Auth welcome screen loaded');
    console.log('👤 User state:', { hasUser: !!user, hasSession: !!session });
    
    if (user || session) {
      console.log('⚠️ WARNING: User still has session on auth screen!');
      console.log('User ID:', user?.id);
      console.log('Session exists:', !!session);
    } else {
      console.log('✅ Auth screen: User properly signed out');
    }

    // Quick swirl animation that settles down
    iconRotation.value = withSequence(
      withTiming(360, { duration: 800, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
    );
    
    iconScale.value = withSequence(
      withTiming(1.1, { duration: 600, easing: Easing.out(Easing.back(1.2)) }),
      withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
    );
    
    iconOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });

    // Subtle continuous glow pulse
    glowPulse.value = withRepeat(
      withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [user, session]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${iconRotation.value}deg` },
        { scale: iconScale.value }
      ],
      opacity: iconOpacity.value,
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowPulse.value,
    };
  });

  return (
    <View style={styles.container}>
      {/* Almost black gradient with subtle dark blue edges */}
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle side glows */}
      <View style={styles.leftGlow} />
      <View style={styles.rightGlow} />

      {/* CRITICAL: Add sign out verification indicator */}
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
        {/* Animated icon with enhanced glow effect */}
        <View style={styles.iconSection}>
          {/* Outer glow ring */}
          <Animated.View style={[styles.outerGlow, glowStyle]} />
          
          <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
            {/* Inner glow */}
            <Animated.View style={[styles.innerGlow, glowStyle]} />
            <Sparkles size={64} color="#3b82f6" strokeWidth={1.5} />
          </Animated.View>
        </View>
        
        {/* Clean title */}
        <Text style={styles.title}>Daily Inner{'\n'}Reflection</Text>
        
        {/* Simple subtitle */}
        <Text style={styles.subtitle}>
          Connect with your inner wisdom through daily reflection.
        </Text>
      </View>
      
      {/* Single shade dark button */}
      <View style={styles.buttonSection}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/auth/signup')}>
          <View style={styles.primaryButtonSolid}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </View>
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
    position: 'relative',
  },
  
  // Subtle side glows
  leftGlow: {
    position: 'absolute',
    left: -50,
    top: '20%',
    width: 100,
    height: '60%',
    backgroundColor: '#1e3a8a',
    opacity: 0.08,
    borderRadius: 50,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 5,
  },
  rightGlow: {
    position: 'absolute',
    right: -50,
    top: '30%',
    width: 80,
    height: '40%',
    backgroundColor: '#1e40af',
    opacity: 0.06,
    borderRadius: 40,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 3,
  },
  
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Enhanced icon section with multiple glow layers
  iconSection: {
    marginBottom: 48,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Outer glow ring
  outerGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1e3a8a',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  
  iconContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.12)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    position: 'relative',
    zIndex: 2,
  },
  
  // Inner glow
  innerGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  
  // Clean title
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  
  // Simple subtitle
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  
  // Single shade dark button section
  buttonSection: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButtonSolid: {
    backgroundColor: '#374151', // Single dark shade
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
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
    color: '#6B7280',
  },
  linkHighlight: {
    color: '#3b82f6', // Slightly brighter blue for better visibility
    fontFamily: 'Inter-Medium',
  },
  
  // Sign out verification styles
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
});