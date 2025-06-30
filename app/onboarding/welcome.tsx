import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';

export default function WelcomeScreen() {
  const handleContinue = () => {
    console.log('📱 Navigating to name screen...');
    router.push('/onboarding/name');
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Sparkles size={80} color="#F59E0B" strokeWidth={1.5} />
        </View>
        
        <Text style={styles.title}>Welcome to{'\n'}Daily Inner Reflection</Text>
        
        <Text style={styles.subtitle}>
          Connect directly with your inner wisdom through this daily mirror into yourself.
        </Text>
        
        <Text style={styles.description}>
          Let's set up your personalized journey of self-discovery and growth.
        </Text>
      </View>
      
      <Pressable style={styles.button} onPress={handleContinue}>
        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Begin Your Journey</Text>
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
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
    maxWidth: 320,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
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