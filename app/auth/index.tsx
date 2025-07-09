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
  Easing
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthWelcomeScreen() {
  const { user, session } = useAuth();
  
  // Animation values
  const iconRotation = useSharedValue(0);
  const iconScale = useSharedValue(0.8);
  const iconOpacity = useSharedValue(0.6);

  useEffect(() => {
    console.log('🔍 Auth welcome screen loaded');
    console.log('👤 User state:', { hasUser: !!user, hasSession: !!session });
    
    if (user || session) {
      console.log('⚠️ WARNING: User still has session on auth screen!');
      console.log('User ID:', user?.id);
      console.log('Session exists:', !!session);
      
      // CRITICAL FIX: If user has session/profile, redirect immediately
      if (session) {
        console.log('🔄 Redirecting authenticated user away from auth screen...');
        if (user?.focusArea) {
          console.log('📱 User has completed onboarding, going to main app...');
          router.replace('/(tabs)');
        } else {
          console.log('📚 User needs onboarding, going to quiz...');
          router.replace('/onboarding/quiz');
        }
        return;
      }
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

  return (
    <View style={styles.container}>
      {/* Almost black gradient with subtle dark blue edges */}
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />

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
        {/* Animated icon with swirl effect - subtle dark blue */}
        <View style={styles.iconSection}>
          <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
            <Sparkles size={64} color="#1e3a8a" strokeWidth={1.5} />
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
  },
  
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Animated icon section - very subtle dark blue
  iconSection: {
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.15)',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
    color: '#1e3a8a', // Subtle dark blue accent
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