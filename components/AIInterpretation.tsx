import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Sparkles, Brain, AlertCircle } from 'lucide-react-native';
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
        setInterpretation(aiInterpretation);
      }
    } catch (err: any) {
      setError('Unable to generate interpretation at this time');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Brain size={20} color="#F59E0B" />
          <Text style={styles.title}>AI Spiritual Guidance</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#F59E0B" />
          <Text style={styles.loadingText}>Channeling your personalized guidance...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <AlertCircle size={20} color="#EF4444" />
          <Text style={styles.title}>Guidance Unavailable</Text>
        </View>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.fallbackText}>
          Trust your intuition as you reflect on the {card.name} and {hexagram.name} combination.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={20} color="#F59E0B" />
        <Text style={styles.title}>AI Spiritual Guidance</Text>
      </View>
      <Text style={styles.interpretation}>{interpretation}</Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>✨ Personalized for your spiritual journey</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  interpretation: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    lineHeight: 24,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginBottom: 12,
  },
  fallbackText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.2)',
    paddingTop: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
});