import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { MessageCircle, RefreshCw, Lightbulb } from 'lucide-react-native';
import { getAIReflectionPrompts, extractRecentThemes } from '@/utils/ai';
import { getJournalEntries } from '@/utils/database';
import { useAuth } from '@/contexts/AuthContext';

interface AIReflectionPromptsProps {
  card: {
    name: string;
    keywords: string[];
  };
  hexagram: {
    name: string;
  };
  onPromptSelect: (prompt: string) => void;
}

export function AIReflectionPrompts({ card, hexagram, onPromptSelect }: AIReflectionPromptsProps) {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    generatePrompts();
  }, [card.name, hexagram.name]);

  const generatePrompts = async (isRegeneration = false) => {
    if (isRegeneration) {
      setRegenerating(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Get recent journal entries for context
      const recentEntries = await getJournalEntries();
      const recentThemes = extractRecentThemes(recentEntries);

      const { questions, error: aiError } = await getAIReflectionPrompts({
        cardName: card.name,
        cardKeywords: card.keywords,
        hexagramName: hexagram.name,
        focusArea: user?.focusArea,
        previousEntries: recentThemes,
      });

      if (aiError) {
        setError(aiError);
        // Enhanced fallback prompts matching the new AI style
        // Focus on real-life situations, relationships, and personal experiences
        setPrompts([
          `Where in your life are you being called to embrace ${card.keywords[0]?.toLowerCase() || 'wisdom'}, even when it feels uncertain?`,
          `How might the energy of ${card.name} guide you through a current relationship or situation that needs your attention?`,
          `What would it look like to embody ${card.keywords[1]?.toLowerCase() || 'growth'} in your daily choices, inspired by ${hexagram.name}?`
        ]);
      } else {
        setPrompts(questions);
      }
    } catch (err: any) {
      setError('Unable to generate prompts at this time');
      // Enhanced fallback prompts matching the new AI style
      setPrompts([
        `Where in your life are you being called to choose what sets your heart alight, even if it's uncertain?`,
        `How might you honor your authentic truth in a current situation or relationship?`,
        `What would it look like to fully trust your inner guidance as you navigate today's opportunities?`
      ]);
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  const handleRegenerate = () => {
    generatePrompts(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MessageCircle size={20} color="#3B82F6" />
          <Text style={styles.title}>AI Reflection Prompts</Text>
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
        <MessageCircle size={20} color="#1e3a8a" />
        <Text style={[styles.title, { color: '#1e3a8a' }]}>AI Reflection Prompts</Text>
        <Pressable
          style={[styles.regenerateButton, regenerating && styles.regenerateButtonDisabled]}
          onPress={handleRegenerate}
          disabled={regenerating}
        >
          <RefreshCw 
            size={16} 
            color={regenerating ? "#6B7280" : "#9CA3AF"} 
            style={regenerating ? styles.spinning : undefined}
          />
        </Pressable>
      </View>

      {error && (
        <Text style={styles.errorText}>Using fallback prompts</Text>
      )}

      <Text style={styles.subtitle}>Choose a question to guide your reflection:</Text>

      <View style={styles.promptsContainer}>
        {prompts.map((prompt, index) => (
          <Pressable
            key={index}
            style={styles.promptButton}
            onPress={() => onPromptSelect(prompt)}
          >
            <View style={styles.promptContent}>
              <Lightbulb size={16} color="#1e3a8a" />
              <Text style={styles.promptText}>{prompt}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Text style={styles.footerText}>
        ✨ Questions personalized for your {user?.focusArea || 'inner journey'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  regenerateButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
  },
  regenerateButtonDisabled: {
    opacity: 0.5,
  },
  spinning: {
    transform: [{ rotate: '180deg' }],
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#F59E0B',
    marginBottom: 8,
  },
  promptsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  promptButton: {
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.2)',
  },
  promptContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  promptText: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: '#F9FAFB',
    lineHeight: 24,
    flex: 1,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
});