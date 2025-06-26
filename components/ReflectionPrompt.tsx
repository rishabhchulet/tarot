import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Save } from 'lucide-react-native';
import { saveJournalEntry } from '@/utils/database';

interface ReflectionPromptProps {
  card: any;
  onComplete: () => void;
}

export function ReflectionPrompt({ card, onComplete }: ReflectionPromptProps) {
  const [firstImpressions, setFirstImpressions] = useState('');
  const [personalMeaning, setPersonalMeaning] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSave = async () => {
    if (!firstImpressions.trim() && !personalMeaning.trim()) {
      return;
    }

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

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.saveButtonGradient}
          >
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Reflection</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 24,
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