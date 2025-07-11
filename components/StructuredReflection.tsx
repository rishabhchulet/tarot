import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Sparkles, Heart, ArrowRight, RefreshCw } from 'lucide-react-native';
import { StructuredReflectionResponse } from '@/data/structuredData';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';

interface StructuredReflectionProps {
  cardName: string;
  hexagramName: string;
  isReversed?: boolean;
  onReflectionGenerated?: (reflectionPrompt: string) => void;
}

export function StructuredReflection({ 
  cardName, 
  hexagramName, 
  isReversed = false, 
  onReflectionGenerated 
}: StructuredReflectionProps) {
  const [reflection, setReflection] = useState<StructuredReflectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const fadeIn1 = useSharedValue(0);
  const fadeIn2 = useSharedValue(0);
  const fadeIn3 = useSharedValue(0);
  const fadeIn4 = useSharedValue(0);
  const glow = useSharedValue(0.5);

  useEffect(() => {
    // Start glow animation
    glow.value = withTiming(1, { 
      duration: 2000, 
      easing: Easing.inOut(Easing.ease) 
    });
    
    generateReflection();
  }, [cardName, hexagramName, isReversed]);

  const generateReflection = async () => {
    setLoading(true);
    setError(null);
    
    // Reset animations
    fadeIn1.value = 0;
    fadeIn2.value = 0;
    fadeIn3.value = 0;
    fadeIn4.value = 0;

    try {
      // Import the function dynamically to avoid import issues
      const { getStructuredReflection } = await import('@/utils/structuredAI');
      
      const { reflection: aiReflection, error: aiError } = await getStructuredReflection(
        cardName,
        hexagramName,
        isReversed
      );

      if (aiError) {
        throw new Error(aiError);
      }

      if (aiReflection) {
        setReflection(aiReflection);
        
        // Send the reflection prompt to parent if callback provided
        if (onReflectionGenerated && aiReflection.reflectionPrompt) {
          onReflectionGenerated(aiReflection.reflectionPrompt);
        }
        
        // Stagger the animations
        fadeIn1.value = withDelay(200, withTiming(1, { duration: 800 }));
        fadeIn2.value = withDelay(400, withTiming(1, { duration: 800 }));
        fadeIn3.value = withDelay(600, withTiming(1, { duration: 800 }));
        fadeIn4.value = withDelay(800, withTiming(1, { duration: 800 }));
      } else {
        throw new Error('No reflection generated');
      }
    } catch (err: any) {
      console.error('Error generating structured reflection:', err);
      setError(err.message || 'Failed to generate reflection');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    generateReflection();
  };

  // Animated styles
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const fade1Style = useAnimatedStyle(() => ({
    opacity: fadeIn1.value,
    transform: [{ translateY: (1 - fadeIn1.value) * 20 }],
  }));

  const fade2Style = useAnimatedStyle(() => ({
    opacity: fadeIn2.value,
    transform: [{ translateY: (1 - fadeIn2.value) * 20 }],
  }));

  const fade3Style = useAnimatedStyle(() => ({
    opacity: fadeIn3.value,
    transform: [{ translateY: (1 - fadeIn3.value) * 20 }],
  }));

  const fade4Style = useAnimatedStyle(() => ({
    opacity: fadeIn4.value,
    transform: [{ translateY: (1 - fadeIn4.value) * 20 }],
  }));

  if (loading) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c7d2fe" />
          <Text style={styles.loadingText}>Weaving wisdom from the cards and stars...</Text>
          <Text style={styles.loadingSubtext}>
            Synthesizing {cardName} {isReversed ? '(reversed)' : ''} with {hexagramName}
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MessageCircle size={48} color="#fda4af" />
          <Text style={styles.errorTitle}>Unable to Generate Reflection</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={handleRetry} style={styles.retryButton}>
            <RefreshCw size={20} color="#f9fafb" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!reflection) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glow, glowStyle]} />
      
      {/* I Ching Reflection */}
      <Animated.View style={[styles.section, fade1Style]}>
        <View style={styles.sectionHeader}>
          <Sparkles size={16} color="#fde047" />
          <Text style={styles.sectionTitle}>I Ching Reflection</Text>
        </View>
        <Text style={styles.reflectionText}>{reflection.iChingReflection}</Text>
      </Animated.View>

      {/* Tarot Reflection */}
      <Animated.View style={[styles.section, fade2Style]}>
        <View style={styles.sectionHeader}>
          <MessageCircle size={16} color="#c084fc" />
          <Text style={styles.sectionTitle}>Tarot Reflection</Text>
        </View>
        <Text style={styles.reflectionText}>{reflection.tarotReflection}</Text>
      </Animated.View>

      {/* Synthesis */}
      <Animated.View style={[styles.synthesisSection, fade3Style]}>
        <View style={styles.sectionHeader}>
          <Heart size={16} color="#f87171" />
          <Text style={styles.sectionTitle}>Synthesis</Text>
        </View>
        <Text style={styles.synthesisText}>{reflection.synthesis}</Text>
      </Animated.View>

      {/* Reflection Prompt */}
      <Animated.View style={[styles.promptSection, fade4Style]}>
        <View style={styles.sectionHeader}>
          <ArrowRight size={16} color="#60a5fa" />
          <Text style={styles.sectionTitle}>Your Reflection Today</Text>
        </View>
        <Text style={styles.promptText}>"{reflection.reflectionPrompt}"</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    top: -50,
    right: -50,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#c7d2fe',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#94a3b8',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#fecaca',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#e5e7eb',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    gap: 8,
  },
  retryButtonText: {
    color: '#f9fafb',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  synthesisSection: {
    marginBottom: 20,
    backgroundColor: 'rgba(248, 113, 113, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#f87171',
  },
  promptSection: {
    backgroundColor: 'rgba(96, 165, 250, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#60a5fa',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    color: '#e0e7ff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reflectionText: {
    color: '#f8fafc',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  synthesisText: {
    color: '#f8fafc',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 26,
  },
  promptText: {
    color: '#ddd6fe',
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic',
  },
}); 