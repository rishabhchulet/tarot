import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing
} from 'react-native-reanimated';
import { Eye, Sparkles, Heart, PenTool, Bell } from 'lucide-react-native';
import { startFreeTrial } from '@/utils/database';

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
  
  // Animation values
  const iconScale = useSharedValue(1);
  const iconRotate = useSharedValue(0);
  const iconOpacity = useSharedValue(0.8);

  useEffect(() => {
    // Start animations when step changes
    iconScale.value = withSequence(
      withTiming(1.2, { duration: 600, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
    );
    
    iconRotate.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(10, { duration: 300, easing: Easing.inOut(Easing.ease) }),
      withTiming(-10, { duration: 300, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) })
    );
    
    iconOpacity.value = withTiming(1, { duration: 600 });
    
    // Start gentle pulse animation after initial animation
    setTimeout(() => {
      iconScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.95, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, 1200);
  }, [currentStep]);

  // Create animated style
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: iconScale.value },
        { rotate: `${iconRotate.value}deg` }
      ],
      opacity: iconOpacity.value,
    };
  });

  const handleNext = () => {
    console.log('📱 Tutorial next button pressed, current step:', currentStep);
    
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    console.log('🎉 Tutorial complete, starting trial and navigating to breathing exercise...');
    setLoading(true);
    
    try {
      // Start free trial
      console.log('💾 Starting free trial...');
      await startFreeTrial();
      console.log('✅ Free trial started successfully');
    } catch (error) {
      console.error('❌ Error starting free trial:', error);
      // Continue anyway - don't block the user flow
    }
    
    // Navigate to breathing exercise
    console.log('🫁 Navigating to breathing exercise...');
    router.replace('/breathing');
  };

  const handleSkip = async () => {
    console.log('⏭️ Tutorial skipped, starting trial and going to breathing exercise...');
    setLoading(true);
    
    try {
      await startFreeTrial();
    } catch (error) {
      console.error('❌ Error starting free trial:', error);
    }
    
    router.replace('/breathing');
  };

  const currentTutorial = TUTORIAL_STEPS[currentStep];
  const IconComponent = currentTutorial.icon;

  // Create animated progress dots
  const renderProgressDots = () => {
    return TUTORIAL_STEPS.map((_, index) => {
      const isActive = index <= currentStep;
      const dotScale = useSharedValue(isActive ? 1 : 0.8);
      
      useEffect(() => {
        if (index === currentStep) {
          dotScale.value = withSequence(
            withTiming(1.5, { duration: 300, easing: Easing.out(Easing.back(2)) }),
            withTiming(1, { duration: 200, easing: Easing.inOut(Easing.ease) })
          );
        } else if (isActive && index < currentStep) {
          dotScale.value = withTiming(1, { duration: 300 });
        } else {
          dotScale.value = withTiming(0.8, { duration: 300 });
        }
      }, [currentStep]);
      
      const animatedDotStyle = useAnimatedStyle(() => {
        return {
          transform: [{ scale: dotScale.value }],
        };
      });
      
      return (
        <Animated.View
          key={index}
          style={[
            styles.progressDot,
            isActive && styles.progressDotActive,
            animatedDotStyle
          ]}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={styles.progressContainer}>
          {renderProgressDots()}
        </View>

        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          <IconComponent size={80} color="#1e3a8a" strokeWidth={1.5} />
        </Animated.View>

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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: 'transparent',
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