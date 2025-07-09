import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Eye, Sparkles, Heart, PenTool, Bell } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const TUTORIAL_STEPS = [
  {
    icon: Eye,
    title: 'You are connecting to your inner wisdom.',
    description: 'This is a tool that assists you in receiving direct inner messages from yourself.\n\nIt uses a mix of ancient tools, modalities, and teachings including:\n\nTarot • I Ching • Symbols',
  },
  {
    icon: Sparkles,
    title: 'Daily Inner Message',
    description: 'Each day, you will connect to your heart and pull a message. It will reflect to you a highly synchronistic message. Let your intuition guide you.',
  },
  {
    icon: Heart,
    title: 'Reflect & Connect',
    description: 'Reveal the pull and reflect on the symbols and meanings to better understand your life, as you connect with yourself each day.',
  },
  {
    icon: PenTool,
    title: 'Capture Insights',
    description: 'Write down your thoughts or record a voice memo to remember your daily reflections.',
  },
  {
    icon: Bell,
    title: 'Daily Reminders',
    description: 'Set a gentle reminder so you never miss your moment of daily inner connection.',
  },
];

export default function TutorialScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    console.log('📱 Tutorial next button pressed, current step:', currentStep);
    
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    console.log('🎉 Tutorial complete, navigating to breathing exercise...');
    setLoading(true);
    
    // Navigate to breathing exercise
    router.push('/breathing');
  };

  const handleSkip = () => {
    console.log('⏭️ Tutorial skipped, going to breathing exercise...');
    router.push('/breathing');
  };

  const currentTutorial = TUTORIAL_STEPS[currentStep];
  const IconComponent = currentTutorial.icon;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />
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
          <IconComponent size={80} color="#1e3a8a" strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>{currentTutorial.title}</Text>
        <Text style={styles.description}>{currentTutorial.description}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleNext}
          disabled={loading}
        >
          <View style={[styles.buttonSolid, loading && styles.buttonSolidDisabled]}>
            <Text style={styles.buttonText}>
              {loading ? 'Setting up...' : currentStep === TUTORIAL_STEPS.length - 1 ? 'Start My Journey' : 'Next'}
            </Text>
          </View>
        </Pressable>
        
        {currentStep < TUTORIAL_STEPS.length - 1 && !loading && (
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip Tutorial</Text>
          </Pressable>
        )}
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
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 60,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
  },
  progressDotActive: {
    backgroundColor: '#1e3a8a',
  },
  iconContainer: {
    marginBottom: 40,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
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
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
});