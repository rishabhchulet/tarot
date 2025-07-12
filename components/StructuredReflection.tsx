import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { MessageCircle, RefreshCw, Sparkles, Star, Zap } from 'lucide-react-native';
import { PlanetaryLoadingAnimation } from '@/components/PlanetaryLoadingAnimation';

const { width } = Dimensions.get('window');

interface StructuredReflectionProps {
  cardName: string;
  hexagramName: string;
  isReversed?: boolean;
  onReflectionGenerated?: (reflection: string) => void;
}

export function StructuredReflection({ 
  cardName, 
  hexagramName, 
  isReversed = false, 
  onReflectionGenerated 
}: StructuredReflectionProps) {
  const [reflection, setReflection] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const fadeIn1 = useSharedValue(0);
  const fadeIn2 = useSharedValue(0);
  const fadeIn3 = useSharedValue(0);
  const fadeIn4 = useSharedValue(0);

  useEffect(() => {
    generateReflection();
  }, [cardName, hexagramName]);

  const generateReflection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a wise and insightful spiritual guide who creates thoughtful reflection questions. Your role is to help people connect with their inner wisdom through meaningful contemplation.

Create a single, powerful reflection question that combines the wisdom of both Tarot and I Ching. The question should be:
- Deeply personal and introspective
- Focused on growth and self-discovery
- Practical for daily reflection
- Meaningful and thought-provoking
- Suitable for quiet contemplation

Format: Return ONLY the question itself, without quotes, prefixes, or explanations.`
            },
            {
              role: 'user',
              content: `Create a reflection question that weaves together the energy of the Tarot card "${cardName}"${isReversed ? ' (reversed)' : ''} and the I Ching hexagram "${hexagramName}". The question should help someone reflect on how these combined energies might guide their day.`
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate reflection');
      }

      const data = await response.json();
      const generatedReflection = data.content.trim();
      
      setReflection(generatedReflection);
      
      // Trigger the callback with the generated reflection
      if (onReflectionGenerated) {
        onReflectionGenerated(generatedReflection);
      }
      
      // Start animations
      fadeIn1.value = withDelay(300, withTiming(1, { duration: 800 }));
      fadeIn2.value = withDelay(600, withTiming(1, { duration: 800 }));
      fadeIn3.value = withDelay(900, withTiming(1, { duration: 800 }));
      fadeIn4.value = withDelay(1200, withTiming(1, { duration: 800 }));
      
    } catch (err) {
      console.error('Error generating reflection:', err);
      setError('Unable to generate reflection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    generateReflection();
  };

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
      <PlanetaryLoadingAnimation 
        message="Weaving Cosmic Wisdom"
        submessage={`Synthesizing ${cardName} ${isReversed ? '(reversed)' : ''} with ${hexagramName}`}
        showFloatingStars={true}
      />
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
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        {/* Enhanced Header */}
        <Animated.View style={[styles.header, fade1Style]}>
          <Sparkles size={20} color="#fbbf24" />
          <Text style={styles.headerTitle}>Your Daily Reflection</Text>
          <Sparkles size={20} color="#fbbf24" />
        </Animated.View>

        {/* Card and Hexagram Info */}
        <Animated.View style={[styles.sourceInfo, fade2Style]}>
          <Text style={styles.sourceText}>
            {cardName} {isReversed ? '(reversed)' : ''} • {hexagramName}
          </Text>
        </Animated.View>

        {/* Main Reflection Question */}
        <Animated.View style={[styles.reflectionContainer, fade3Style]}>
          <Text style={styles.reflectionQuestion}>{reflection}</Text>
        </Animated.View>

        {/* Guidance Text */}
        <Animated.View style={[styles.guidanceContainer, fade4Style]}>
          <Text style={styles.guidanceText}>
            Take a moment to sit with this question. Let it guide your awareness throughout the day.
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 500,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    textAlign: 'center',
  },
  sourceInfo: {
    marginBottom: 32,
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    textAlign: 'center',
  },
  reflectionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  reflectionQuestion: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#f8fafc',
    textAlign: 'center',
    lineHeight: 26,
  },
  guidanceContainer: {
    alignItems: 'center',
  },
  guidanceText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#f9fafb',
  },
}); 