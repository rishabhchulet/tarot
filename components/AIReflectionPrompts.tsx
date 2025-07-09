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
        // Fallback prompts
        setPrompts([
          `How does the energy of ${card.name} guide your inner journey today?`,
          `What wisdom from ${hexagram.name} can you apply to your current challenges?`,
          `How can you embody the qualities of ${card.keywords[0]?.toLowerCase()} in your daily life?`
        ]);
      } else {
        setPrompts(questions);
      }
    } catch (err: any) {
      setError('Unable to generate prompts at this time');
      // Fallback prompts
      setPrompts([
        `What message does ${card.name} have for you today?`,
        `How can ${hexagram.name} guide your current path?`,
        `What insights emerge when you reflect on today's inner combination?`
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
    fontFamily: 'CormorantGaramond-SemiBold',
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
    fontSize: 14,
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
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
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
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#F9FAFB',
    lineHeight: 22,
    flex: 1,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
});