import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Platform } from 'react-native';
import { MessageCircle, Lightbulb } from 'lucide-react-native';
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
  onDailyQuestionReceived?: (question: string) => void; // NEW: Callback for daily question
}

export function DynamicReflectionQuestions({ 
  card, 
  hexagram, 
  reflection1,
  setReflection1,
  reflection2,
  setReflection2,
  onQuestionSelect,
  onDailyQuestionReceived
}: DynamicReflectionQuestionsProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<string[]>([]);
  const [shadowQuestion, setShadowQuestion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // NEW: Use ref to track if daily question has been sent to prevent loops
  const dailyQuestionSentRef = useRef(false);

  useEffect(() => {
    console.log('🎯 DynamicReflectionQuestions mounted, generating questions...');
    generateQuestions();
  }, [card.name, hexagram.name]);

  // FIXED: Only send daily question once when it's first set
  useEffect(() => {
    if (shadowQuestion && onDailyQuestionReceived && !dailyQuestionSentRef.current) {
      console.log('📤 Sending daily question to parent (first time):', shadowQuestion);
      onDailyQuestionReceived(shadowQuestion);
      dailyQuestionSentRef.current = true; // Mark as sent to prevent loops
    }
  }, [shadowQuestion, onDailyQuestionReceived]);

  const createPersonalizedFallbackQuestions = () => {
    const primaryKeyword = card.keywords[0] || 'wisdom';
    const secondaryKeyword = card.keywords[1] || 'growth';
    const focusArea = user?.focusArea || 'life';
    
    // Create more personal, life-focused questions following the pattern
    const fallbackQuestions = [
      `Where in your ${focusArea} are you being called to choose what sets your heart alight, even if it's uncertain?`,
      `Can you let ${primaryKeyword.toLowerCase()} be a guide—not to possession, but to illumination in your daily choices?`
    ];
    
    // Create a shadow/daily reflection question
    const fallbackShadowQuestion = `What am I truly devoted to—and does it reflect my authentic truth?`;
    
    console.log('🔄 Created personalized fallback questions:', fallbackQuestions);
    console.log('🌙 Created shadow question:', fallbackShadowQuestion);
    
    return { questions: fallbackQuestions, shadowQuestion: fallbackShadowQuestion };
  };

  // Check if we should skip AI requests (mobile development environment)
  const shouldSkipAI = () => {
    // Skip AI on mobile in development to avoid network errors
    if (Platform.OS !== 'web' && __DEV__) {
      console.log('📱 Mobile development detected - skipping AI requests');
      return true;
    }
    return false;
  };

  const generateQuestions = async () => {
    console.log('🤔 Generating personal reflection questions...');
    setLoading(true);
    setError(null);
    
    // Reset the daily question sent flag when generating new questions
    dailyQuestionSentRef.current = false;

    // Check if we should skip AI requests for mobile
    if (shouldSkipAI()) {
      console.log('📱 Using fallback questions for mobile development');
      const { questions: fallbackQuestions, shadowQuestion: fallbackShadowQuestion } = createPersonalizedFallbackQuestions();
      setQuestions(fallbackQuestions);
      setShadowQuestion(fallbackShadowQuestion);
      setLoading(false);
      return;
    }

    try {
      // Get recent journal entries for context
      console.log('📚 Fetching recent journal entries...');
      const recentEntries = await getJournalEntries();
      const recentThemes = extractRecentThemes(recentEntries);
      console.log('📝 Recent themes extracted:', recentThemes);

      console.log('🤖 Calling AI for personal reflection prompts...');
      const { questions: aiQuestions, error: aiError } = await getAIReflectionPrompts({
        cardName: card.name,
        cardKeywords: card.keywords,
        hexagramName: hexagram.name,
        focusArea: user?.focusArea,
        previousEntries: recentThemes,
      });

      console.log('📋 AI response:', { aiQuestions, aiError });

      if (aiError || !aiQuestions || !Array.isArray(aiQuestions) || aiQuestions.length < 3) {
        console.warn('⚠️ AI questions insufficient, using personalized fallback. Received:', aiQuestions);
        setError(null); // Don't show error to user
        const { questions: fallbackQuestions, shadowQuestion: fallbackShadowQuestion } = createPersonalizedFallbackQuestions();
        setQuestions(fallbackQuestions);
        setShadowQuestion(fallbackShadowQuestion);
      } else {
        console.log('✅ AI questions generated successfully:', aiQuestions);
        // Take first 2 questions for main reflection, 3rd for shadow question
        setQuestions(aiQuestions.slice(0, 2));
        setShadowQuestion(aiQuestions[2] || createPersonalizedFallbackQuestions().shadowQuestion);
        setError(null);
      }
    } catch (err: any) {
      console.error('❌ Error generating questions:', err);
      setError(null); // Don't show error to user
      const { questions: fallbackQuestions, shadowQuestion: fallbackShadowQuestion } = createPersonalizedFallbackQuestions();
      setQuestions(fallbackQuestions);
      setShadowQuestion(fallbackShadowQuestion);
    } finally {
      setLoading(false);
      console.log('🏁 Question generation complete');
    }
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
          <Text style={styles.title}>Your Reflection Today</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.loadingText}>Crafting your personal questions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header following the pattern */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Reflection Today</Text>
      </View>

      {/* Card and Hexagram description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          <Text style={styles.cardName}>{card.name}</Text> speaks to {card.keywords.slice(0, 2).join(', ').toLowerCase()}, and the deep mirroring that occurs in relationships—both with others and within yourself.
        </Text>
        <Text style={styles.descriptionText}>
          <Text style={styles.hexagramName}>Hexagram {hexagram.name}</Text> invites you to honor the intensity of your inner flame: your desire, your devotion, and what lights you up from within.
        </Text>
      </View>

      {/* Together, this pairing asks: */}
      <View style={styles.pairingContainer}>
        <Text style={styles.pairingTitle}>Together, this pairing asks:</Text>
        
        {/* Question 1 */}
        <Pressable
          style={styles.questionButton}
          onPress={() => handleQuestionPress(0)}
        >
          <Text style={styles.questionText}>
            {questions[0] || 'Where in your life are you being called to choose what sets your heart alight, even if it\'s uncertain?'}
          </Text>
        </Pressable>
        
        <TextInput
          style={styles.textInput}
          value={reflection1}
          onChangeText={setReflection1}
          placeholder="Share your thoughts and feelings..."
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Question 2 */}
        <Pressable
          style={styles.questionButton}
          onPress={() => handleQuestionPress(1)}
        >
          <Text style={styles.questionText}>
            {questions[1] || 'Can you let desire be a guide—not to possession, but to illumination?'}
          </Text>
        </Pressable>
        
        <TextInput
          style={styles.textInput}
          value={reflection2}
          onChangeText={setReflection2}
          placeholder="How does this message relate to your current journey?"
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Return to this question throughout the day */}
      <View style={styles.shadowContainer}>
        <Text style={styles.shadowTitle}>Return to this question throughout the day:</Text>
        <Text style={styles.shadowQuestion}>
          "{shadowQuestion || 'What am I truly devoted to—and does it reflect my truth?'}"
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  
  // Description section
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardName: {
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
  },
  hexagramName: {
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#3B82F6',
  },
  
  // Pairing section
  pairingContainer: {
    marginBottom: 16,
  },
  pairingTitle: {
    fontSize: 15,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F3F4F6',
    marginBottom: 12,
  },
  questionButton: {
    marginBottom: 8,
    paddingVertical: 4,
  },
  questionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#F3F4F6',
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 70,
    marginBottom: 16,
  },
  
  // Shadow question section
  shadowContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  shadowTitle: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#F59E0B',
    marginBottom: 6,
  },
  shadowQuestion: {
    fontSize: 14,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F3F4F6',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});