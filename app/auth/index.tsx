import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles, CircleCheck as CheckCircle } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  Easing
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthWelcomeScreen() {
  const { user, session } = useAuth();
  
  // Subtle animation values
  const sparkleRotation = useSharedValue(0);
  const iconGlow = useSharedValue(0.8);

  // CRITICAL: Add test to verify user is signed out
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
  }, [user, session]);

  useEffect(() => {
    // Very subtle sparkle rotation
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );

    // Subtle glow effect
    iconGlow.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedSparkleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${sparkleRotation.value}deg` }],
      opacity: iconGlow.value,
    };
  });

  return (
    <View style={styles.container}>
      {/* Clean gradient background */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
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
        {/* Simple icon with subtle animation */}
        <View style={styles.iconSection}>
          <Animated.View style={[styles.iconContainer, animatedSparkleStyle]}>
            <Sparkles size={80} color="#FFD700" strokeWidth={1.5} />
          </Animated.View>
        </View>
        
        {/* Clean title */}
        <Text style={styles.title}>Daily Inner{'\n'}Reflection</Text>
        
        {/* Simple subtitle */}
        <Text style={styles.subtitle}>
          Connect directly with your inner wisdom through this daily mirror into yourself.
        </Text>
      </View>
      
      {/* Clean button section */}
      <View style={styles.buttonSection}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/auth/signup')}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.primaryButtonGradient}
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
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Simple icon section
  iconSection: {
    marginBottom: 40,
  },
  iconContainer: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  
  // Clean title
  title: {
    fontSize: 36,
    fontFamily: 'Inter-ExtraBold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 44,
  },
  
  // Simple subtitle
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },
  
  // Clean button section
  buttonSection: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  linkHighlight: {
    color: '#F59E0B',
    fontFamily: 'Inter-SemiBold',
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