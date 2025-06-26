import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Save } from 'lucide-react-native';
import { saveJournalEntry } from '@/utils/database';

interface ReflectionPromptProps {
  card: any;
  hexagram: any;
  onComplete: () => void;
}

export function ReflectionPrompt({ card, hexagram, onComplete }: ReflectionPromptProps) {
  const [firstImpressions, setFirstImpressions] = useState('');
  const [personalMeaning, setPersonalMeaning] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!firstImpressions.trim() && !personalMeaning.trim()) {
      return;
    }

    setSaving(true);

    const entry = {
      date: new Date().toISOString(),
      card_name: card.name,
      card_keywords: card.keywords,
      first_impressions: firstImpressions.trim(),
      personal_meaning: personalMeaning.trim(),
      reflection: `${firstImpressions.trim()} ${personalMeaning.trim()}`.trim(),
    };

    const { error } = await saveJournalEntry(entry);
    
    if (error) {
      console.error('Error saving journal entry:', error);
    }
    
    setSaving(false);
    onComplete();
  };

  const handleVoiceRecording = () => {
    // Voice recording functionality would be implemented here
    // Using expo-av for audio recording
    setIsRecording(!isRecording);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reflect on Your Draw</Text>
      
      <View style={styles.guidanceContainer}>
        <Text style={styles.guidanceTitle}>Your Spiritual Messages</Text>
        <View style={styles.messageRow}>
          <View style={styles.messageCard}>
            <Text style={styles.messageLabel}>Tarot Card</Text>
            <Text style={styles.messageName}>{card.name}</Text>
            <View style={styles.messageKeywords}>
              {card.keywords.slice(0, 2).map((keyword: string, index: number) => (
                <Text key={index} style={styles.messageKeyword}>{keyword}</Text>
              ))}
            </View>
          </View>
          
          <View style={styles.messageCard}>
            <Text style={styles.messageLabel}>I Ching</Text>
            <Text style={styles.messageName}>{hexagram.name}</Text>
            <Text style={styles.messageKeyword}>#{hexagram.number}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.promptContainer}>
        <Text style={styles.promptLabel}>What are your first impressions with this pull?</Text>
        <TextInput
          style={styles.textInput}
          value={firstImpressions}
          onChangeText={setFirstImpressions}
          placeholder="Share your initial thoughts and feelings..."
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.promptContainer}>
        <Text style={styles.promptLabel}>What does it mean to you right now?</Text>
        <TextInput
          style={styles.textInput}
          value={personalMeaning}
          onChangeText={setPersonalMeaning}
          placeholder="How does this message relate to your current journey?"
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.actionContainer}>
        <Pressable 
          style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
          onPress={handleVoiceRecording}
        >
          <Mic size={24} color={isRecording ? '#FFFFFF' : '#F59E0B'} />
          <Text style={[styles.voiceButtonText, isRecording && styles.voiceButtonTextActive]}>
            {isRecording ? 'Stop Recording' : 'Voice Memo'}
          </Text>
        </Pressable>

        <Pressable 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={saving ? ['#6B7280', '#4B5563'] : ['#10B981', '#059669']}
            style={styles.saveButtonGradient}
          >
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Reflection'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 24,
  },
  guidanceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  guidanceTitle: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  messageCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  messageName: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 8,
  },
  messageKeywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  messageKeyword: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  promptContainer: {
    marginBottom: 24,
  },
  promptLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 100,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  voiceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#F59E0B',
  },
  voiceButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
  },
  voiceButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});