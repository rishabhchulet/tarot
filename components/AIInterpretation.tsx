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
        setError(aiError);
      } else {
        // Smart truncation that preserves sentence completion
        const smartTruncate = (text: string, maxWords: number = 45): string => {
          const words = text.split(' ');
          if (words.length <= maxWords) return text;
          
          // Find the last complete sentence within the word limit
          let truncated = words.slice(0, maxWords).join(' ');
          const lastSentenceEnd = Math.max(
            truncated.lastIndexOf('.'),
            truncated.lastIndexOf('!'),
            truncated.lastIndexOf('?')
          );
          
          if (lastSentenceEnd > truncated.length * 0.6) {
            // If we have a sentence ending in the last 40% of text, use it
            return truncated.substring(0, lastSentenceEnd + 1);
          } else {
            // Otherwise, add ellipsis to the word-truncated version
            return truncated + '...';
          }
        };

        const shortInterpretation = smartTruncate(aiInterpretation || '');
        setInterpretation(shortInterpretation);
      }
    } catch (err: any) {
      setError('Unable to generate interpretation at this time');
    } finally {
      setLoading(false);
    }
  };

  // Create a fallback insight using the keywords - ensuring it mentions them and completes meaning
  const createFallbackInsight = () => {
    const primaryKeyword = card.keywords[0]?.toLowerCase() || 'wisdom';
    const secondaryKeyword = card.keywords[1]?.toLowerCase() || 'growth';
    const thirdKeyword = card.keywords[2]?.toLowerCase() || 'insight';
    
    return `Today's combination of ${card.name} and ${hexagram.name} brings ${primaryKeyword}, ${secondaryKeyword}, and ${thirdKeyword} into focus. This powerful pairing invites you to embrace transformation and trust your inner guidance as you navigate your spiritual journey with clarity and purpose.`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Brain size={16} color="#F59E0B" />
          <Text style={styles.title}>Spiritual Insight</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#F59E0B" />
          <Text style={styles.loadingText}>Channeling guidance...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Sparkles size={16} color="#F59E0B" />
          <Text style={styles.title}>Spiritual Insight</Text>
        </View>
        <Text style={styles.interpretation}>{createFallbackInsight()}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={16} color="#F59E0B" />
        <Text style={styles.title}>Spiritual Insight</Text>
      </View>
      <Text style={styles.interpretation}>{interpretation || createFallbackInsight()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  interpretation: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    lineHeight: 18,
  },
});