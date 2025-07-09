import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';

export default function BreathScreen() {
  // Animation values
  const iconScale = useSharedValue(1);
  const iconOpacity = useSharedValue(0.8);
  
  React.useEffect(() => {
    // Start gentle pulse animation
    iconScale.value = withRepeat(
      withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    iconOpacity.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);
  
  // Create animated style
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }],
      opacity: iconOpacity.value,
    };
  });

  const handleContinue = () => {
    console.log('📱 Navigating to tutorial...');
    router.push('/onboarding/tutorial');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Animated.View style={animatedIconStyle}>
            <Heart size={60} color="#1e3a8a" fill="#1e3a8a" strokeWidth={1.5} />
          </Animated.View>
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
        <View style={styles.buttonSolid}>
          <Text style={styles.buttonText}>Begin Breathing Exercise</Text>
        </View>
      </Pressable>
    </View>
  );
}

const animatedIconStyle = {
  transform: [{ scale: 1 }],
};

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
    width: 80,
    height: 80,
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