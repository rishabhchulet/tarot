import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';

export default function ConfirmationScreen() {
  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
            <CheckCircle size={80} color="#10B981" strokeWidth={1.5} />
        </View>
        
        <Text style={styles.title}>Powerful.</Text>
        
        <Text style={styles.subtitle}>
          In a moment, I’ll take you to your personal profile. You’ll be able to read your personal life map, based on your astrological placements.
          {"\\n\\n"}
          Each day, you’ll have the opportunity to connect intentionally using the Daily Reflection button. This tool combines astrology, the I Ching, and card-based guidance with intuitive prompts. It’s designed by master-level facilitators with over 15 years of experience across modalities.
          {"\\n\\n"}
          If you’re consistent with it, you’ll begin to notice powerful shifts—from the inside out.
        </Text>
        
      </View>
      
      <Pressable style={styles.button} onPress={handleContinue}>
        <View style={styles.buttonSolid}>
          <Text style={styles.buttonText}>Let’s Go →</Text>
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
  iconContainer: {
    marginBottom: 40,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    maxWidth: 340,
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonSolid: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
  },
}); 