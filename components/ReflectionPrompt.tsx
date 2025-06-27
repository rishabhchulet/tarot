import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Save, Mic, Square, Play, Pause } from 'lucide-react-native';
import { saveJournalEntry } from '@/utils/database';
import { saveAudioToDocuments, AudioRecording, startRecording, stopRecording, playAudio } from '@/utils/audio';
import { AIInterpretation } from './AIInterpretation';
import { DynamicReflectionQuestions } from '@/components/DynamicReflectionQuestions';
import { router } from 'expo-router';

const { height: screenHeight } = Dimensions.get('window');

interface ReflectionPromptProps {
  card: any;
  hexagram: any;
  onComplete: () => void;
}

export function ReflectionPrompt({ card, hexagram, onComplete }: ReflectionPromptProps) {
  const [reflection1, setReflection1] = useState('');
  const [reflection2, setReflection2] = useState('');
  const [voiceRecording, setVoiceRecording] = useState<AudioRecording | null>(null);
  const [saving, setSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    const success = await startRecording();
    if (success) {
      setIsRecording(true);
      setRecordingTime(0);
      setVoiceRecording(null);
    }
  };

  const handleStopRecording = async () => {
    const recording = await stopRecording();
    setIsRecording(false);
    setRecordingTime(0);
    
    if (recording) {
      try {
        const timestamp = new Date().getTime();
        const filename = `voice_memo_${timestamp}.m4a`;
        const savedUri = await saveAudioToDocuments(recording.uri, filename);
        
        if (savedUri) {
          setVoiceRecording({
            ...recording,
            uri: savedUri,
          });
        }
      } catch (error) {
        console.error('Error saving voice recording:', error);
        Alert.alert('Error', 'Failed to save voice recording');
      }
    }
  };

  const handlePlayRecording = async () => {
    if (!voiceRecording) return;

    setIsPlayingAudio(true);
    await playAudio(voiceRecording.uri);
    
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, Math.min(voiceRecording.duration, 5000));
  };

  const handleQuestionSelect = (question: string, questionIndex: number) => {
    if (questionIndex === 0) {
      setReflection1(question);
    } else {
      setReflection2(question);
    }
  };

  const handleSave = async () => {
    const hasTextInput = reflection1.trim() || reflection2.trim();
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
        date: new Date().toISOString().split('T')[0],
        card_name: card.name,
        card_keywords: card.keywords,
        first_impressions: reflection1.trim(),
        personal_meaning: reflection2.trim(),
        reflection: `${reflection1.trim()} ${reflection2.trim()}`.trim(),
        voice_memo_path: voiceRecording?.uri || null,
      };

      const { error } = await saveJournalEntry(entry);
      
      if (error) {
        console.error('Error saving journal entry:', error);
        Alert.alert('Error', 'Failed to save your reflection. Please try again.');
      } else {
        console.log('Journal entry saved successfully');
        // Navigate back to today screen
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Unexpected error saving journal entry:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reflect on Your Draw</Text>
      
      {/* Spiritual Messages Header */}
      <View style={styles.messagesHeader}>
        <View style={styles.messageCard}>
          <Text style={styles.messageLabel}>Tarot</Text>
          <Text style={styles.messageName}>{card.name}</Text>
        </View>
        
        <View style={styles.messageCard}>
          <Text style={styles.messageLabel}>I Ching</Text>
          <Text style={styles.messageName}>{hexagram.name}</Text>
        </View>
      </View>

      {/* Spiritual Insight */}
      <AIInterpretation
        card={card}
        hexagram={hexagram}
      />

      {/* Dynamic Questions */}
      <DynamicReflectionQuestions
        card={card}
        hexagram={hexagram}
        onQuestionSelect={handleQuestionSelect}
        reflection1={reflection1}
        setReflection1={setReflection1}
        reflection2={reflection2}
        setReflection2={setReflection2}
      />

      {/* Voice Recording Section */}
      <View style={styles.voiceSection}>
        <Text style={styles.voiceLabel}>Or record a voice memo</Text>
        
        {voiceRecording ? (
          <View style={styles.recordingInfo}>
            <Text style={styles.recordingLabel}>Voice memo recorded ({formatTime(Math.floor(voiceRecording.duration / 1000))})</Text>
            <View style={styles.playbackControls}>
              <Pressable
                style={[styles.playButton, isPlayingAudio && styles.playButtonActive]}
                onPress={handlePlayRecording}
                disabled={isPlayingAudio}
              >
                {isPlayingAudio ? (
                  <Pause size={16} color="#FFFFFF" />
                ) : (
                  <Play size={16} color="#F59E0B" />
                )}
              </Pressable>
              
              <Pressable
                style={styles.newRecordingButton}
                onPress={() => setVoiceRecording(null)}
              >
                <Text style={styles.newRecordingText}>Record New</Text>
              </Pressable>
            </View>
          </View>
        ) : isRecording ? (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording... {formatTime(recordingTime)}</Text>
            </View>
            
            <Pressable style={styles.stopButton} onPress={handleStopRecording}>
              <Square size={20} color="#FFFFFF" fill="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[styles.recordButton, saving && styles.recordButtonDisabled]}
            onPress={handleStartRecording}
            disabled={saving}
          >
            <Mic size={20} color={saving ? '#6B7280' : '#F59E0B'} />
            <Text style={[styles.recordButtonText, saving && styles.recordButtonTextDisabled]}>
              Voice Memo
            </Text>
          </Pressable>
        )}
      </View>

      {/* Save Button */}
      <Pressable 
        style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
        onPress={handleSave}
        disabled={saving}
      >
        <LinearGradient
          colors={saving ? ['#6B7280', '#4B5563'] : ['#10B981', '#059669']}
          style={styles.saveButtonGradient}
        >
          <Save size={18} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Reflection'}
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: screenHeight - 140, // Account for tab bar
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 16,
  },
  
  // Compact Messages Header
  messagesHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  messageCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  messageName: {
    fontSize: 14,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F3F4F6',
    textAlign: 'center',
  },
  
  // Voice Section
  voiceSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  voiceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 8,
  },
  recordButtonDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: '#6B7280',
  },
  recordButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
  },
  recordButtonTextDisabled: {
    color: '#6B7280',
  },
  recordingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingInfo: {
    alignItems: 'center',
  },
  recordingLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    marginBottom: 8,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  playButtonActive: {
    backgroundColor: '#F59E0B',
  },
  newRecordingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  newRecordingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  
  // Save Button
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 'auto',
    marginBottom: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});