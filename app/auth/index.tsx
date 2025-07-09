import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthWelcomeScreen() {
  const { user, session } = useAuth();

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

  return (
    <View style={styles.container}>
      {/* Dark gradient background */}
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
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
        {/* Static icon - no animation */}
        <View style={styles.iconSection}>
          <View style={styles.iconContainer}>
            <Sparkles size={64} color="#6B7280" strokeWidth={1.5} />
          </View>
        </View>
        
        {/* Clean title */}
        <Text style={styles.title}>Daily Inner{'\n'}Reflection</Text>
        
        {/* Simple subtitle */}
        <Text style={styles.subtitle}>
          Connect with your inner wisdom through daily reflection.
        </Text>
      </View>
      
      {/* Dark themed buttons */}
      <View style={styles.buttonSection}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/auth/signup')}>
          <View style={styles.primaryButtonContent}>
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
  
  // Static icon section - no animation
  iconSection: {
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.2)',
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
  
  // Dark themed button section
  buttonSection: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  primaryButtonContent: {
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
    color: '#9CA3AF',
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