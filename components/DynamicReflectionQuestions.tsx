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
    console.log('🎯 DynamicReflectionQuestions mounted, generating questions...');
    generateQuestions();
  }, [card.name, hexagram.name]);

  const createPersonalizedFallbackQuestions = () => {
    const primaryKeyword = card.keywords[0] || 'wisdom';
    const secondaryKeyword = card.keywords[1] || 'growth';
    const focusArea = user?.focusArea || 'spiritual journey';
    
    const fallbackQuestions = [
      `Where in your life are you being called to choose what sets your heart alight, even if it's uncertain?`,
      `Can you let ${primaryKeyword.toLowerCase()} be a guide—not to possession, but to illumination?`
    ];
    
    console.log('🔄 Created personalized fallback questions:', fallbackQuestions);
    return fallbackQuestions;
  };

  const generateQuestions = async (isRegeneration = false) => {
    console.log(`🤔 ${isRegeneration ? 'Regenerating' : 'Generating'} reflection questions...`);
    
    if (isRegeneration) {
      setRegenerating(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Get recent journal entries for context
      console.log('📚 Fetching recent journal entries...');
      const recentEntries = await getJournalEntries();
      const recentThemes = extractRecentThemes(recentEntries);
      console.log('📝 Recent themes extracted:', recentThemes);

      console.log('🤖 Calling AI for reflection prompts...');
      const { questions: aiQuestions, error: aiError } = await getAIReflectionPrompts({
        cardName: card.name,
        cardKeywords: card.keywords,
        hexagramName: hexagram.name,
        focusArea: user?.focusArea,
        previousEntries: recentThemes,
      });

      console.log('📋 AI response:', { aiQuestions, aiError });

      if (aiError) {
        console.warn('⚠️ AI questions error, using personalized fallback:', aiError);
        setError('Using personalized questions');
        const fallbackQuestions = createPersonalizedFallbackQuestions();
        setQuestions(fallbackQuestions);
      } else if (!aiQuestions || !Array.isArray(aiQuestions) || aiQuestions.length < 2) {
        console.warn('⚠️ Insufficient AI questions, using personalized fallback. Received:', aiQuestions);
        setError('Using personalized questions');
        const fallbackQuestions = createPersonalizedFallbackQuestions();
        setQuestions(fallbackQuestions);
      } else {
        console.log('✅ AI questions generated successfully:', aiQuestions);
        setQuestions(aiQuestions.slice(0, 2)); // Only take first 2 questions
        setError(null);
      }
    } catch (err: any) {
      console.error('❌ Error generating questions:', err);
      setError('Using personalized questions');
      const fallbackQuestions = createPersonalizedFallbackQuestions();
      setQuestions(fallbackQuestions);
    } finally {
      setLoading(false);
      setRegenerating(false);
      console.log('🏁 Question generation complete');
    }
  };

  const handleRegenerate = () => {
    console.log('🔄 User requested question regeneration');
    generateQuestions(true);
  };

  const handleQuestionPress = (questionIndex: number) => {
    const question = questions[questionIndex];
    if (question) {
      console.log(`📝 Question ${questionIndex + 1} selected:`, question);
      onQuestionSelect(question, questionIndex);
    }
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
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Question 1 */}
      <View style={styles.questionContainer}>
        <Pressable
          style={styles.questionButton}
          onPress={() => handleQuestionPress(0)}
        >
          <View style={styles.questionContent}>
            <Lightbulb size={12} color="#3B82F6" />
            <Text style={styles.questionText}>
              {questions[0] || 'Where in your life are you being called to choose what sets your heart alight?'}
            </Text>
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
          onPress={() => handleQuestionPress(1)}
        >
          <View style={styles.questionContent}>
            <Lightbulb size={12} color="#3B82F6" />
            <Text style={styles.questionText}>
              {questions[1] || 'Can you let desire be a guide—not to possession, but to illumination?'}
            </Text>
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

      <Text style={styles.footerText}>
        ✨ Questions personalized for your {user?.focusArea || 'spiritual journey'}
      </Text>
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
  footerText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});