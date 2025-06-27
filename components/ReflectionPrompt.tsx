import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Save } from 'lucide-react-native';
import { saveJournalEntry } from '@/utils/database';
import { saveAudioToDocuments, AudioRecording } from '@/utils/audio';
import { VoiceRecorder } from './VoiceRecorder';
import { AIReflectionPrompts } from './AIReflectionPrompts';

interface ReflectionPromptProps {
  card: any;
  hexagram: any;
  onComplete: () => void;
}

export function ReflectionPrompt({ card, hexagram, onComplete }: ReflectionPromptProps) {
  const [firstImpressions, setFirstImpressions] = useState('');
  const [personalMeaning, setPersonalMeaning] = useState('');
  const [voiceRecording, setVoiceRecording] = useState<AudioRecording | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAIPrompts, setShowAIPrompts] = useState(true);

  const handleVoiceRecording = async (recording: AudioRecording) => {
    try {
      // Save the audio file with a unique name
      const timestamp = new Date().getTime();
      const filename = `voice_memo_${timestamp}.m4a`;
      const savedUri = await saveAudioToDocuments(recording.uri, filename);
      
      if (savedUri) {
        setVoiceRecording({
          ...recording,
          uri: savedUri,
        });
        console.log('Voice recording saved:', savedUri);
      }
    } catch (error) {
      console.error('Error saving voice recording:', error);
      Alert.alert('Error', 'Failed to save voice recording');
    }
  };

  const handleAIPromptSelect = (prompt: string) => {
    // If first impressions is empty, use it there, otherwise use personal meaning
    if (!firstImpressions.trim()) {
      setFirstImpressions(prompt);
    } else {
      setPersonalMeaning(prompt);
    }
    setShowAIPrompts(false);
  };

  const handleSave = async () => {
    // Check if user has provided any input
    const hasTextInput = firstImpressions.trim() || personalMeaning.trim();
    const hasVoiceInput = voiceRecording !== null;

    if (!hasTextInput && !hasVoiceInput) {
      Alert.alert(
        'No Reflection Added', 
        'Please add some thoughts or record a voice memo before saving.'
      );
      return;
    }

    setSaving(true);

    try {
      const entry = {
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        card_name: card.name,
        card_keywords: card.keywords,
        first_impressions: firstImpressions.trim(),
        personal_meaning: personalMeaning.trim(),
        reflection: `${firstImpressions.trim()} ${personalMeaning.trim()}`.trim(),
        voice_memo_path: voiceRecording?.uri || null,
      };

      console.log('Saving journal entry:', entry);

      const { error } = await saveJournalEntry(entry);
      
      if (error) {
        console.error('Error saving journal entry:', error);
        Alert.alert('Error', 'Failed to save your reflection. Please try again.');
      } else {
        console.log('Journal entry saved successfully');
        Alert.alert(
          'Reflection Saved!', 
          'Your daily reflection has been saved to your journal.',
          [
            {
              text: 'OK',
              onPress: onComplete,
            }
          ]
        );
      }
    } catch (error) {
      console.error('Unexpected error saving journal entry:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
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

      {showAIPrompts && (
        <AIReflectionPrompts
          card={card}
          hexagram={hexagram}
          onPromptSelect={handleAIPromptSelect}
        />
      )}

      {!showAIPrompts && (
        <Pressable 
          style={styles.showPromptsButton}
          onPress={() => setShowAIPrompts(true)}
        >
          <Text style={styles.showPromptsText}>Show AI Prompts Again</Text>
        </Pressable>
      )}
      
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

      <View style={styles.voiceContainer}>
        <Text style={styles.promptLabel}>Or record a voice memo</Text>
        <VoiceRecorder 
          onRecordingComplete={handleVoiceRecording}
          disabled={saving}
        />
      </View>

      <View style={styles.actionContainer}>
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
    marginBottom: 16,
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
  showPromptsButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  showPromptsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
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
  voiceContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  actionContainer: {
    marginTop: 24,
  },
  saveButton: {
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
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});