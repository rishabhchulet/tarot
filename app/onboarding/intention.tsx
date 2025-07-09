import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';

export default function IntentionScreen() {
  const handleContinue = () => {
    router.push('/breathing');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
            <Heart size={80} color="#1e3a8a" strokeWidth={1.5} />
        </View>
        
        <Text style={styles.title}>Everything in your life begins with intention.</Text>
        
        <Text style={styles.subtitle}>
          Pause for a moment and check with your heart. Then press the button and take a deep breath as you focus inwardly on your intention to connect to yourself—and what that means for you.
        </Text>
        
      </View>
      
      <Pressable style={styles.button} onPress={handleContinue}>
        <View style={styles.buttonSolid}>
          <Text style={styles.buttonText}>Set My Intention →</Text>
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
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
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
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
    maxWidth: 320,
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