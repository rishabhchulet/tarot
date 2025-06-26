import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Car as Card, Heart, PenTool, Bell } from 'lucide-react-native';
import { startFreeTrial } from '@/utils/database';

const { width } = Dimensions.get('window');

const TUTORIAL_STEPS = [
  {
    icon: Card,
    title: 'Daily Card Pull',
    description: 'Each day, take a breath and pull a card that speaks to your soul. Let your intuition guide you.',
  },
  {
    icon: Heart,
    title: 'Reflect & Connect',
    description: 'Read the card\'s message and discover what it means for your current journey and growth.',
  },
  {
    icon: PenTool,
    title: 'Capture Insights',
    description: 'Write down your thoughts or record a voice memo to remember your daily reflections.',
  },
  {
    icon: Bell,
    title: 'Daily Reminders',
    description: 'Set a gentle reminder so you never miss your moment of daily spiritual connection.',
  },
];

export default function TutorialScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      await startFreeTrial();
    } catch (error) {
      console.error('Error starting free trial:', error);
    }
    
    router.replace('/(tabs)');
  };

  const currentTutorial = TUTORIAL_STEPS[currentStep];
  const IconComponent = currentTutorial.icon;

  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.progressContainer}>
          {TUTORIAL_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive
              ]}
            />
          ))}
        </View>

        <View style={styles.iconContainer}>
          <IconComponent size={80} color="#F59E0B" strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>{currentTutorial.title}</Text>
        <Text style={styles.description}>{currentTutorial.description}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={handleNext}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {currentStep === TUTORIAL_STEPS.length - 1 ? 'Start My Journey' : 'Next'}
            </Text>
          </LinearGradient>
        </Pressable>
        
        {currentStep < TUTORIAL_STEPS.length - 1 && (
          <Pressable style={styles.skipButton} onPress={handleComplete}>
            <Text style={styles.skipButtonText}>Skip Tutorial</Text>
          </Pressable>
        )}
      </View>
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
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 60,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: '#F59E0B',
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 16,
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
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
});