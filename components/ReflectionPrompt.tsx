import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, Dimensions, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Save, Mic, Square, Play, Pause } from 'lucide-react-native';
import { buttonHaptics, uiHaptics } from '@/utils/haptics';
import { saveJournalEntry, saveDailyQuestion } from '@/utils/database';
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
  const [dailyQuestion, setDailyQuestion] = useState<string>('');

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
    // Haptic feedback for recording action
    buttonHaptics.record();
    
    const success = await startRecording();
    if (success) {
      setIsRecording(true);
      setRecordingTime(0);
      setVoiceRecording(null);
    }
  };

  const handleStopRecording = async () => {
    // Haptic feedback for stopping recording
    buttonHaptics.secondary();
    
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

    // Haptic feedback for playing audio
    buttonHaptics.select();
    
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

  // FIXED: Handle daily question from DynamicReflectionQuestions with proper state management
  const handleDailyQuestionReceived = (question: string) => {
    console.log('📝 Daily question received in ReflectionPrompt:', question);
    // Only update if it's different to prevent unnecessary re-renders
    if (question !== dailyQuestion) {
      setDailyQuestion(question);
    }
  };

  const handleSave = async () => {
    // Haptic feedback for primary action
    buttonHaptics.primary();
    
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

      console.log('💾 Saving journal entry...');
      const { error } = await saveJournalEntry(entry);
      
      if (error) {
        console.error('Error saving journal entry:', error);
        Alert.alert('Error', 'Failed to save your reflection. Please try again.');
        return;
      }

      // FIXED: Save the daily question if we have one (only once)
      if (dailyQuestion) {
        console.log('💾 Saving daily question...');
        await saveDailyQuestion(dailyQuestion);
      }

      console.log('✅ Journal entry saved successfully');
      
      // Always call onComplete to reliably navigate after save
      if (onComplete) {
        onComplete();
      }
      
      // Success haptic feedback
      buttonHaptics.confirm();
      
      // Show success message (no navigation in onPress)
      Alert.alert(
        'Reflection Saved!',
        'Your daily reflection has been saved.'
      );
    } catch (error) {
      console.error('Unexpected error saving journal entry:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    // Haptic feedback for secondary action
    buttonHaptics.secondary();
    
    setSaving(true);

    try {
      // Save minimal entry with just the cards drawn
      const entry = {
        date: new Date().toISOString().split('T')[0],
        card_name: card.name,
        card_keywords: card.keywords,
        first_impressions: '',
        personal_meaning: '',
        reflection: '',
        voice_memo_path: null,
      };

      console.log('💾 Saving reading without reflection...');
      const { error } = await saveJournalEntry(entry);
      
      if (error) {
        console.error('Error saving journal entry:', error);
        Alert.alert('Error', 'Failed to save your reading. Please try again.');
        return;
      }

      // Save the daily question
      if (dailyQuestion) {
        console.log('💾 Saving daily question...');
        await saveDailyQuestion(dailyQuestion);
      }

      console.log('✅ Reading saved successfully');
      
      // Always call onComplete to reliably navigate after save
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Unexpected error saving reading:', error);
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
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Enhanced Dynamic Questions - Now properly contained */}
      <DynamicReflectionQuestions
        card={card}
        hexagram={hexagram}
        onQuestionSelect={handleQuestionSelect}
        onDailyQuestionReceived={handleDailyQuestionReceived}
        reflection1={reflection1}
        setReflection1={setReflection1}
        reflection2={reflection2}
        setReflection2={setReflection2}
      />

      {/* Compact Voice Recording Section */}
      <View style={styles.voiceSection}>
        {voiceRecording ? (
          <View style={styles.recordingInfo}>
            <Text style={styles.recordingLabel}>Voice memo ({formatTime(Math.floor(voiceRecording.duration / 1000))})</Text>
            <View style={styles.playbackControls}>
              <Pressable
                style={[styles.playButton, isPlayingAudio && styles.playButtonActive]}
                onPress={handlePlayRecording}
                disabled={isPlayingAudio}
              >
                {isPlayingAudio ? (
                  <Pause size={14} color="#FFFFFF" />
                ) : (
                  <Play size={14} color="#F59E0B" />
                )}
              </Pressable>
              
              <Pressable
                style={styles.newRecordingButton}
                onPress={() => setVoiceRecording(null)}
              >
                <Text style={styles.newRecordingText}>New</Text>
              </Pressable>
            </View>
          </View>
        ) : isRecording ? (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording {formatTime(recordingTime)}</Text>
            </View>
            
            <Pressable style={styles.stopButton} onPress={handleStopRecording}>
              <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[styles.recordButton, saving && styles.recordButtonDisabled]}
            onPress={handleStartRecording}
            disabled={saving}
          >
            <Mic size={16} color={saving ? '#6B7280' : '#F59E0B'} />
            <Text style={[styles.recordButtonText, saving && styles.recordButtonTextDisabled]}>
              Voice Memo
            </Text>
          </Pressable>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Pressable 
          style={[styles.skipButton, saving && styles.skipButtonDisabled]} 
          onPress={handleSkip}
          disabled={saving}
        >
          <Text style={[styles.skipButtonText, saving && styles.skipButtonTextDisabled]}>
            Skip & Continue
          </Text>
        </Pressable>

        <Pressable 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={saving ? ['#4B5563', '#4B5563'] : ['#3b82f6', '#2563eb']}
            style={[styles.saveButtonSolid, saving && styles.saveButtonSolidDisabled]}
          >
            <Save size={Platform.OS === 'android' ? 18 : 16} color="#F9FAFB" />
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Reflection'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // FIXED: Proper scrollable container
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingBottom: 40, // Extra padding at bottom for save button
  },
  
  // Ultra Compact Messages Header
  messagesHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  messageCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 58, 138, 0.08)', 
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.15)',
  },
  messageLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 2,
  },
  messageName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  
  // Compact Voice Section
  voiceSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1e3a8a',
    gap: 6,
  },
  recordButtonDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: '#6B7280',
  },
  recordButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1e3a8a',
  },
  recordButtonTextDisabled: {
    color: '#6B7280',
  },
  recordingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  recordingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingInfo: {
    alignItems: 'center',
  },
  recordingLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    marginBottom: 6,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 8,
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
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  newRecordingText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  
  // Action Buttons Container
  actionsContainer: {
    flexDirection: 'row',
    gap: Platform.OS === 'android' ? 16 : 12,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  
  // Skip Button
  skipButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Platform.OS === 'android' ? 14 : 12,
    paddingVertical: Platform.OS === 'android' ? 16 : 12,
    paddingHorizontal: Platform.OS === 'android' ? 20 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minHeight: Platform.OS === 'android' ? 52 : 48,
  },
  skipButtonDisabled: {
    opacity: 0.6,
  },
  skipButtonText: {
    fontSize: Platform.OS === 'android' ? 15 : 14,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
    letterSpacing: 0.2,
  },
  skipButtonTextDisabled: {
    color: '#6B7280',
  },
  
  // Save Button
  saveButton: {
    flex: 2,
    borderRadius: Platform.OS === 'android' ? 14 : 12,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: Platform.OS === 'android' ? 4 : 2 },
    shadowOpacity: Platform.OS === 'android' ? 0.4 : 0.2,
    shadowRadius: Platform.OS === 'android' ? 8 : 4,
    elevation: Platform.OS === 'android' ? 6 : 2,
  },
  saveButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonSolid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'android' ? 16 : 12,
    paddingHorizontal: Platform.OS === 'android' ? 28 : 24,
    gap: 8,
    minHeight: Platform.OS === 'android' ? 52 : 48,
  },
  saveButtonSolidDisabled: {
    backgroundColor: '#4B5563',
  },
  saveButtonText: {
    fontSize: Platform.OS === 'android' ? 16 : 14,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});