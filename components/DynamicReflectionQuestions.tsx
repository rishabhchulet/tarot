import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { MessageCircle, Sparkles, Edit3 } from 'lucide-react-native';
import { StructuredReflection } from '@/components/StructuredReflection';
import { SubscriptionGate, FreemiumPreview } from '@/components/SubscriptionGate';

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
  onDailyQuestionReceived?: (question: string) => void;
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
  const dailyQuestionSentRef = useRef(false);

  const handleReflectionGenerated = (reflectionPrompt: string) => {
    if (onDailyQuestionReceived && !dailyQuestionSentRef.current) {
      console.log('📤 Sending daily question to parent:', reflectionPrompt);
      onDailyQuestionReceived(reflectionPrompt);
      dailyQuestionSentRef.current = true;
    }
  };

  return (
    <View style={styles.container}>


      {/* Enhanced Structured Reflection Component - Premium Feature */}
      <SubscriptionGate
        feature="AI Wisdom Synthesis"
        description="Get personalized insights combining Tarot and I Ching wisdom, crafted specifically for your journey."
        requiredPlan="trial"
        fallbackContent={
          <View style={styles.basicReflection}>
            <Text style={styles.basicTitle}>Basic Card Information</Text>
            <Text style={styles.basicText}>
              Today's card is {card.name}. Take time to reflect on its meaning and how it relates to your current situation.
            </Text>
            <Text style={styles.basicKeywords}>
              Key themes: {card.keywords.slice(0, 3).join(', ')}
            </Text>
          </View>
        }
      >
        <StructuredReflection
          cardName={card.name}
          hexagramName={hexagram.name}
          onReflectionGenerated={handleReflectionGenerated}
        />
      </SubscriptionGate>

      {/* Enhanced Reflection Input Areas with better styling */}
      <View style={styles.inputSection}>
        <View style={styles.inputGroup}>
          <View style={styles.inputHeader}>
            <Edit3 size={16} color="#60a5fa" />
            <Text style={styles.inputLabel}>Your First Thoughts</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={reflection1}
            onChangeText={setReflection1}
            placeholder="Share your initial thoughts and feelings..."
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputHeader}>
            <MessageCircle size={16} color="#60a5fa" />
            <Text style={styles.inputLabel}>Deeper Reflection</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={reflection2}
            onChangeText={setReflection2}
            placeholder="How does this message relate to your current journey?"
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Optional note */}
        <View style={styles.optionalNote}>
          <Text style={styles.noteText}>
            ✨ These reflections are optional - you can save your reading with or without them
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 16,
    marginVertical: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    textAlign: 'center',
  },
  inputSection: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  inputLabel: {
    color: '#F9FAFB',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    color: '#F9FAFB',
    fontFamily: 'Inter-Regular',
    fontSize: 17,
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    lineHeight: 26,
  },
  optionalNote: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    marginTop: 8,
  },
  noteText: {
    color: '#fbbf24',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  basicReflection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  basicTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  basicText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 8,
  },
  basicKeywords: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    fontStyle: 'italic',
  },
});