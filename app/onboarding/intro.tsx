import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { startFreeTrial } from '@/utils/database';

export default function IntroScreen() {
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    console.log('🎉 Starting free trial and navigating to tutorial...');
    setLoading(true);
    
    try {
      console.log('💾 Starting free trial...');
      await startFreeTrial();
      console.log('✅ Free trial started successfully');
    } catch (error) {
      console.error('❌ Error starting free trial:', error);
    }
    
    console.log('📱 Navigating to tutorial...');
    router.replace('/onboarding/tutorial');
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Rad.</Text>
        
        <Text style={styles.subtitle}>
          You're almost ready to reveal your first reflection…
        </Text>
        
        <Text style={styles.subtitle}>
          And connect deeply with your inner truths.
        </Text>
        
        <Text style={styles.description}>
          First, take a look at how this tool works with your inner guidance…
          And how to get the most out of it.
        </Text>
      </View>
      
      <Pressable 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleContinue}
        disabled={loading}
      >
        <LinearGradient
          colors={loading ? ['#6B7280', '#4B5563'] : ['#F59E0B', '#D97706']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Setting up...' : 'Let\'s go'}
          </Text>
        </LinearGradient>
      </Pressable>
    </LinearGradient>
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
  title: {
    fontSize: 48,
    fontFamily: 'Inter-ExtraBold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Inter-Medium',
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
    maxWidth: 320,
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});