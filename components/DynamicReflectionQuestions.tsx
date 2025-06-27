import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { MessageCircle, RefreshCw, Lightbulb } from 'lucide-react-native';
import { getAIReflectionPrompts, extractRecentThemes } from '@/utils/ai';
import { getJournalEntries } from '@/utils/database';
import { useAuth } from '@/contexts/AuthContext';

interface DynamicReflectionQuestionsProps {
  card: {
    name: string;
    keywords: string[];
  };
  hexagram: {
    name: string;
  };
  reflection1: string;
  setReflection1: (text: string) => void;
  reflection2: string;
  setReflection2: (text: string) => void;
  onQuestionSelect: (question: string, questionIndex: number) => void;
}

export function DynamicReflectionQuestions({ 
  card, 
  hexagram, 
  reflection1,
  setReflection1,
  reflection2,
  setReflection2,
  onQuestionSelect 
}: DynamicReflectionQuestionsProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateQuestions();
  }, [card.name, hexagram.name]);

  const createFallbackQuestions = () => {
    const primaryKeyword = card.keywords[0] || 'wisdom';
    const focusArea = user?.focusArea || 'spiritual journey';
    
    return [
      `How does the energy of ${primaryKeyword.toLowerCase()} from ${card.name} guide your ${focusArea} today?`,
      `What wisdom from ${hexagram.name} can you apply to your current path forward?`
    ];
  };

  const generateQuestions = async (isRegeneration = false) => {
    if (isRegeneration) {
      setRegenerating(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('🤔 Generating reflection questions...');
      
      // Get recent journal entries for context
      const recentEntries = await getJournalEntries();
      const recentThemes = extractRecentThemes(recentEntries);

      const { questions: aiQuestions, error: aiError } = await getAIReflectionPrompts({
        cardName: card.name,
        cardKeywords: card.keywords,
        hexagramName: hexagram.name,
        focusArea: user?.focusArea,
        previousEntries: recentThemes,
      });

      if (aiError) {
        console.warn('⚠️ AI questions error, using fallback:', aiError);
        setError(aiError);
        setQuestions(createFallbackQuestions());
      } else if (!aiQuestions || aiQuestions.length < 2) {
        console.warn('⚠️ Insufficient AI questions, using fallback');
        setQuestions(createFallbackQuestions());
      } else {
        console.log('✅ AI questions generated successfully');
        setQuestions(aiQuestions.slice(0, 2)); // Only take first 2 questions
      }
    } catch (err: any) {
      console.error('❌ Error generating questions:', err);
      setError(err.message);
      setQuestions(createFallbackQuestions());
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  const handleRegenerate = () => {
    console.log('🔄 Regenerating questions...');
    generateQuestions(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MessageCircle size={16} color="#3B82F6" />
          <Text style={styles.title}>Reflection Questions</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.loadingText}>Crafting personalized questions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MessageCircle size={16} color="#3B82F6" />
        <Text style={styles.title}>Reflection Questions</Text>
        <Pressable
          style={[styles.regenerateButton, regenerating && styles.regenerateButtonDisabled]}
          onPress={handleRegenerate}
          disabled={regenerating}
        >
          <RefreshCw 
            size={12} 
            color={regenerating ? "#6B7280" : "#9CA3AF"} 
          />
        </Pressable>
      </View>

      {error && (
        <Text style={styles.errorText}>Using personalized fallback questions</Text>
      )}

      {/* Question 1 */}
      <View style={styles.questionContainer}>
        <Pressable
          style={styles.questionButton}
          onPress={() => onQuestionSelect(questions[0] || '', 0)}
        >
          <View style={styles.questionContent}>
            <Lightbulb size={12} color="#3B82F6" />
            <Text style={styles.questionText}>{questions[0] || 'Loading question...'}</Text>
          </View>
        </Pressable>
        
        <TextInput
          style={styles.textInput}
          value={reflection1}
          onChangeText={setReflection1}
          placeholder="Share your thoughts..."
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />
      </View>

      {/* Question 2 */}
      <View style={styles.questionContainer}>
        <Pressable
          style={styles.questionButton}
          onPress={() => onQuestionSelect(questions[1] || '', 1)}
        >
          <View style={styles.questionContent}>
            <Lightbulb size={12} color="#3B82F6" />
            <Text style={styles.questionText}>{questions[1] || 'Loading question...'}</Text>
          </View>
        </Pressable>
        
        <TextInput
          style={styles.textInput}
          value={reflection2}
          onChangeText={setReflection2}
          placeholder="Share your thoughts..."
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#3B82F6',
    flex: 1,
  },
  regenerateButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  regenerateButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#F59E0B',
    marginBottom: 8,
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: 12,
  },
  questionButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  questionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  questionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    lineHeight: 16,
    flex: 1,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 8,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 50,
  },
});