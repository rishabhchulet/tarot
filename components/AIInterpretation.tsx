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
          <Brain size={18} color="#F59E0B" />
          <Text style={styles.title}>Spiritual Insight</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#F59E0B" />
          <Text style={styles.loadingText}>Channeling your guidance...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <AlertCircle size={18} color="#EF4444" />
          <Text style={styles.title}>Spiritual Insight</Text>
        </View>
        <Text style={styles.fallbackText}>
          Trust your intuition as you reflect on the {card.name} and {hexagram.name} combination.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={18} color="#F59E0B" />
        <Text style={styles.title}>Spiritual Insight</Text>
      </View>
      <Text style={styles.interpretation}>{interpretation}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  interpretation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    lineHeight: 20,
  },
  fallbackText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});