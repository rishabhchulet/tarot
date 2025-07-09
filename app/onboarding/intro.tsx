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
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />
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
        <View style={[styles.buttonSolid, loading && styles.buttonSolidDisabled]}>
          <Text style={styles.buttonText}>
            {loading ? 'Setting up...' : 'Let\'s go'}
          </Text>
        </View>
      </Pressable>
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
  title: {
    fontSize: 48,
    fontFamily: 'Inter-ExtraBold',
    color: '#F9FAFB',
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
  buttonSolid: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonSolidDisabled: {
    backgroundColor: '#4B5563',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
  },
});