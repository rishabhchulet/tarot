import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';

export default function BreathScreen() {
  const handleContinue = () => {
    console.log('📱 Navigating to tutorial...');
    router.push('/onboarding/tutorial');
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Heart size={60} color="#F59E0B" fill="#F59E0B" />
        </View>
        
        <Text style={styles.title}>Take a Deep Breath</Text>
        
        <Text style={styles.subtitle}>
          Before we begin your journey, let's center ourselves with a moment of mindful breathing.
        </Text>
        
        <Text style={styles.description}>
          This practice will help you connect with your inner wisdom and prepare for your daily reflections.
        </Text>
      </View>
      
      <Pressable style={styles.button} onPress={handleContinue}>
        <LinearGradient
          colors={['#3B82F6', '#1D4ED8']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Begin Breathing Exercise</Text>
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