import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { StructuredReflection } from '@/components/StructuredReflection';

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
      {/* Header following the pattern */}
      <View style={[styles.header, { backgroundColor: 'rgba(30, 58, 138, 0.08)' }]}>
        <Text style={[styles.title, { color: '#F9FAFB' }]}>Your Reflection Today</Text>
      </View>

      {/* Card and Hexagram description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          <Text style={[styles.cardName, { color: '#F9FAFB' }]}>{card.name}</Text> speaks to {card.keywords.slice(0, 2).join(', ').toLowerCase()}, and the deep mirroring that occurs in relationships—both with others and within yourself.
        </Text>
        <Text style={styles.descriptionText}>
          <Text style={[styles.hexagramName, { color: '#1e3a8a' }]}>Hexagram {hexagram.name}</Text> invites you to honor the intensity of your inner flame: your desire, your devotion, and what lights you up from within.
        </Text>
      </View>

      {/* New Structured Reflection Component */}
      <StructuredReflection
        cardName={card.name}
        hexagramName={hexagram.name}
        onReflectionGenerated={handleReflectionGenerated}
      />

      {/* Reflection Input Areas */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Your First Thoughts</Text>
        <TextInput
          style={styles.textInput}
          value={reflection1}
          onChangeText={setReflection1}
          placeholder="Share your initial thoughts and feelings..."
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.inputLabel}>Deeper Reflection</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    borderRadius: 12,
    marginVertical: 16,
    overflow: 'hidden',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  descriptionContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#A1A1AA',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardName: {
    fontFamily: 'Inter-SemiBold',
  },
  hexagramName: {
    fontFamily: 'Inter-SemiBold',
  },
  inputContainer: {
    padding: 20,
  },
  inputLabel: {
    color: '#E0E7FF',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: '#F9FAFB',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    minHeight: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});