import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Dimensions, Platform } from 'react-native';
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
import { getStructuredReflection } from '@/utils/structuredAI';
import { StructuredReflectionResponse } from '@/data/structuredData';
import { playScreenAmbient } from '@/utils/ambientSounds';

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
  const [reflection, setReflection] = useState<StructuredReflectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const fadeIn1 = useSharedValue(0);
  const fadeIn2 = useSharedValue(0);
  const fadeIn3 = useSharedValue(0);
  const fadeIn4 = useSharedValue(0);

  useEffect(() => {
    generateReflection();
    // Play forest whispers for peaceful reflection
    playScreenAmbient('reflection');
  }, [cardName, hexagramName]);

  const generateReflection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Start the loading animation timer
      const startTime = Date.now();
      const minLoadingTime = 2000; // 2 seconds minimum loading time
      
      // Use the proper structured AI utility function
      const { reflection: structuredReflection, error: apiError } = await getStructuredReflection(
        cardName,
        hexagramName,
        isReversed
      );

      if (apiError) {
        throw new Error(apiError);
      }

      if (structuredReflection) {
        // Store the complete structured reflection
        setReflection(structuredReflection);
        
        // Trigger the callback with the reflection prompt
        if (onReflectionGenerated) {
          onReflectionGenerated(structuredReflection.reflectionPrompt);
        }
      } else {
        throw new Error('No reflection data received');
      }
      
      // Ensure minimum loading time for better UX
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      // Start animations
      fadeIn1.value = withDelay(300, withTiming(1, { duration: 800 }));
      fadeIn2.value = withDelay(600, withTiming(1, { duration: 800 }));
      fadeIn3.value = withDelay(900, withTiming(1, { duration: 800 }));
      fadeIn4.value = withDelay(1200, withTiming(1, { duration: 800 }));
      
    } catch (err: any) {
      console.error('Error generating reflection:', err);
      
      // Enhanced fallback with meaningful content
      const fallbackReflection = createFallbackReflection(cardName, hexagramName, isReversed);
      setReflection(fallbackReflection);
      
      if (onReflectionGenerated) {
        onReflectionGenerated(fallbackReflection);
      }
      
      // Start animations even with fallback
      fadeIn1.value = withDelay(300, withTiming(1, { duration: 800 }));
      fadeIn2.value = withDelay(600, withTiming(1, { duration: 800 }));
      fadeIn3.value = withDelay(900, withTiming(1, { duration: 800 }));
      fadeIn4.value = withDelay(1200, withTiming(1, { duration: 800 }));
      
      // Don't show error if we have fallback content
      if (!fallbackReflection) {
        setError('Unable to generate reflection. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Enhanced fallback reflection generator
  const createFallbackReflection = (cardName: string, hexagramName: string, isReversed: boolean): string => {
    const cardKeywords = {
      'The Fool': 'new beginnings, spontaneity, innocence',
      'The Magician': 'manifestation, resourcefulness, power',
      'The High Priestess': 'intuition, sacred knowledge, divine feminine',
      'The Empress': 'femininity, beauty, nature',
      'The Emperor': 'authority, structure, control',
      'The Hierophant': 'spiritual wisdom, religious beliefs, conformity',
      'The Lovers': 'love, harmony, relationships',
      'The Chariot': 'control, willpower, success',
      'Strength': 'inner strength, bravery, compassion',
      'The Hermit': 'soul searching, introspection, inner guidance',
      'Wheel of Fortune': 'good luck, karma, life cycles',
      'Justice': 'justice, fairness, truth',
      'The Hanged Man': 'suspension, restriction, letting go',
      'Death': 'endings, beginnings, change',
      'Temperance': 'balance, moderation, patience',
      'The Devil': 'bondage, addiction, sexuality',
      'The Tower': 'sudden change, upheaval, chaos',
      'The Star': 'hope, faith, purpose',
      'The Moon': 'illusion, fear, anxiety',
      'The Sun': 'optimism, freedom, fun',
      'Judgement': 'judgement, rebirth, inner calling',
      'The World': 'completion, accomplishment, travel'
    };

    const keywords = cardKeywords[cardName as keyof typeof cardKeywords] || 'wisdom, growth, insight';
    const reversedText = isReversed ? ' in its shadow aspect' : '';
    
    return `The energy of ${cardName}${reversedText} combines with the ancient wisdom of ${hexagramName} to offer you guidance today. ${keywords.split(', ')[0]} emerges as a key theme, inviting you to explore how this quality can serve your highest good.

How might you embody the essence of ${keywords.split(', ')[0]} while honoring the deeper wisdom that ${hexagramName} brings to your path?`;
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
      
      {/* Card and Hexagram Info */}
      <Animated.View style={[styles.sourceInfo, fade1Style]}>
        <Text style={styles.sourceText}>
          {cardName} {isReversed ? '(reversed)' : ''} • {hexagramName}
        </Text>
      </Animated.View>

      {/* I Ching Reflection */}
      <Animated.View style={[styles.section, fade2Style]}>
        <View style={styles.sectionHeader}>
          <Star size={16} color="#60a5fa" />
          <Text style={styles.sectionTitle}>I Ching Wisdom</Text>
        </View>
        <Text style={styles.sectionText}>{reflection.iChingReflection}</Text>
      </Animated.View>

      {/* Tarot Reflection */}
      <Animated.View style={[styles.section, fade2Style]}>
        <View style={styles.sectionHeader}>
          <Sparkles size={16} color="#fbbf24" />
          <Text style={styles.sectionTitle}>Tarot Insight</Text>
        </View>
        <Text style={styles.sectionText}>{reflection.tarotReflection}</Text>
      </Animated.View>

      {/* Synthesis */}
      <Animated.View style={[styles.section, fade3Style]}>
        <View style={styles.sectionHeader}>
          <Zap size={16} color="#a855f7" />
          <Text style={styles.sectionTitle}>Combined Wisdom</Text>
        </View>
        <Text style={styles.sectionText}>{reflection.synthesis}</Text>
      </Animated.View>

      {/* Daily Question - Highlighted */}
      <Animated.View style={[styles.questionSection, fade4Style]}>
        <View style={styles.sectionHeader}>
          <MessageCircle size={16} color="#fbbf24" />
          <Text style={styles.questionTitle}>Your Question for Today</Text>
        </View>
        <Text style={styles.questionText}>{reflection.reflectionPrompt}</Text>
      </Animated.View>

      {/* Guidance Text */}
      <Animated.View style={[styles.guidance, fade4Style]}>
        <Text style={styles.guidanceText}>
          Take a moment to sit with this question. Let it guide your awareness throughout the day.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 500,
    paddingHorizontal: Platform.OS === 'android' ? 20 : 16,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  sourceInfo: {
    marginBottom: 24,
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    textAlign: 'center',
  },
  section: {
    marginBottom: Platform.OS === 'android' ? 24 : 20,
    paddingHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#f8fafc',
  },
  sectionText: {
    fontSize: Platform.OS === 'android' ? 15 : 16,
    fontFamily: 'Inter-Regular',
    color: '#d1d5db',
    lineHeight: Platform.OS === 'android' ? 22 : 24,
    paddingLeft: 4,
    paddingRight: 4,
  },
  questionSection: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 12,
    padding: Platform.OS === 'android' ? 20 : 16,
    marginBottom: 24,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  questionTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#fbbf24',
  },
  questionText: {
    fontSize: Platform.OS === 'android' ? 15 : 16,
    fontFamily: 'Inter-Medium',
    color: '#f8fafc',
    lineHeight: Platform.OS === 'android' ? 22 : 24,
    paddingTop: 4,
  },
  guidance: {
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