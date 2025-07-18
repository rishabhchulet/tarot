import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Sparkles, Brain, CircleAlert as AlertCircle } from 'lucide-react-native';
import { getAICardInterpretation } from '@/utils/ai';
import { useAuth } from '@/contexts/AuthContext';

interface AIInterpretationProps {
  card: {
    name: string;
    keywords: string[];
  };
  hexagram: {
    name: string;
    number: number;
  };
  userContext?: string;
}

export function AIInterpretation({ card, hexagram, userContext }: AIInterpretationProps) {
  const { user } = useAuth();
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateInterpretation();
  }, [card.name, hexagram.name]);

  const generateInterpretation = async () => {
    setLoading(true);
    setError(null);

    try {
      const { interpretation: aiInterpretation, error: aiError } = await getAICardInterpretation({
        cardName: card.name,
        cardKeywords: card.keywords,
        hexagramName: hexagram.name,
        hexagramNumber: hexagram.number,
        focusArea: user?.focusArea,
        userContext,
      });

      if (aiError) {
        console.warn('⚠️ AI interpretation error, using fallback:', aiError);
        setError(aiError);
        setInterpretation(createFallbackInsight());
      } else {
        // Enhanced smart truncation that preserves complete meaning
        const enhancedTruncate = (text: string, maxWords: number = 50): string => {
          const words = text.split(' ');
          if (words.length <= maxWords) return text;
          
          // Find natural break points (sentences, clauses)
          let truncated = words.slice(0, maxWords).join(' ');
          
          // Look for sentence endings in the last 40% of the text
          const sentenceEndings = ['.', '!', '?'];
          let bestEndIndex = -1;
          
          for (let i = Math.floor(truncated.length * 0.6); i < truncated.length; i++) {
            if (sentenceEndings.includes(truncated[i])) {
              bestEndIndex = i;
            }
          }
          
          if (bestEndIndex > 0) {
            return truncated.substring(0, bestEndIndex + 1);
          }
          
          // Look for clause endings (commas, semicolons) in the last 30%
          const clauseEndings = [',', ';', ':'];
          for (let i = Math.floor(truncated.length * 0.7); i < truncated.length; i++) {
            if (clauseEndings.includes(truncated[i])) {
              bestEndIndex = i;
            }
          }
          
          if (bestEndIndex > 0) {
            return truncated.substring(0, bestEndIndex + 1);
          }
          
          // If no natural break, ensure we end with complete meaning
          return truncated.trim() + '.';
        };

        const processedInterpretation = enhancedTruncate(aiInterpretation || '');
        setInterpretation(processedInterpretation);
      }
    } catch (err: any) {
      console.error('❌ Error generating interpretation:', err);
      setError('Unable to generate interpretation at this time');
      setInterpretation(createFallbackInsight());
    } finally {
      setLoading(false);
    }
  };

  // Enhanced fallback insight that mentions keywords naturally and completes meaning
  const createFallbackInsight = () => {
    const primaryKeyword = card.keywords[0] || 'wisdom';
    const secondaryKeyword = card.keywords[1] || 'growth';
    const thirdKeyword = card.keywords[2] || 'insight';
    const focusArea = user?.focusArea || 'life';
    
    // Enhanced fallback matching the new AI style
    // Focus on real-life situations, relationships, and personal experiences
    return `${card.name} brings together themes of ${primaryKeyword.toLowerCase()}, ${secondaryKeyword.toLowerCase()}, and ${thirdKeyword.toLowerCase()}—offering guidance for your current ${focusArea} situation. ${hexagram.name} converges with this energy to illuminate how you might navigate your relationships, decisions, and daily experiences with greater authenticity. Consider where you're being called to embody these qualities in practical, meaningful ways as you move forward.`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Brain size={16} color="#F59E0B" />
          <Text style={styles.title}>Inner Insight</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#F59E0B" />
          <Text style={styles.loadingText}>Channeling guidance...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={16} color="#1e3a8a" />
        <Text style={[styles.title, { color: '#1e3a8a' }]}>Inner Insight</Text>
      </View>
      <Text style={styles.interpretation}>
        {interpretation || createFallbackInsight()}
      </Text>
      {error && (
        <Text style={styles.fallbackNote}>✨ Personalized for your inner journey</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  interpretation: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F9FAFB',
    lineHeight: 24,
  },
  fallbackNote: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});