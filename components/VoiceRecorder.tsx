import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Mic, Square, Play, Pause } from 'lucide-react-native';
import { startRecording, stopRecording, playAudio, AudioRecording } from '@/utils/audio';

interface VoiceRecorderProps {
  onRecordingComplete: (recording: AudioRecording) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onRecordingComplete, disabled = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentRecording, setCurrentRecording] = useState<AudioRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
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
    if (disabled) return;

    const success = await startRecording();
    if (success) {
      setIsRecording(true);
      setRecordingTime(0);
      setCurrentRecording(null);
    }
  };

  const handleStopRecording = async () => {
    const recording = await stopRecording();
    setIsRecording(false);
    setRecordingTime(0);
    
    if (recording) {
      setCurrentRecording(recording);
      onRecordingComplete(recording);
    }
  };

  const handlePlayRecording = async () => {
    if (!currentRecording) return;

    setIsPlaying(true);
    const success = await playAudio(currentRecording.uri);
    
    // Simulate playback duration
    setTimeout(() => {
      setIsPlaying(false);
    }, Math.min(currentRecording.duration, 5000));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentRecording) {
    return (
      <View style={styles.container}>
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingLabel}>Voice memo recorded</Text>
          <Text style={styles.recordingDuration}>
            {formatTime(Math.floor(currentRecording.duration / 1000))}
          </Text>
        </View>
        
        <View style={styles.playbackControls}>
          <Pressable
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={handlePlayRecording}
            disabled={isPlaying}
          >
            {isPlaying ? (
              <Pause size={20} color="#FFFFFF" />
            ) : (
              <Play size={20} color="#F59E0B" />
            )}
          </Pressable>
          
          <Pressable
            style={styles.newRecordingButton}
            onPress={() => setCurrentRecording(null)}
          >
            <Text style={styles.newRecordingText}>Record New</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isRecording ? (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording...</Text>
            <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
          </View>
          
          <Pressable style={styles.stopButton} onPress={handleStopRecording}>
            <Square size={24} color="#FFFFFF" fill="#FFFFFF" />
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[styles.recordButton, disabled && styles.recordButtonDisabled]}
          onPress={handleStartRecording}
          disabled={disabled}
        >
          <Mic size={24} color={disabled ? '#6B7280' : '#F59E0B'} />
          <Text style={[styles.recordButtonText, disabled && styles.recordButtonTextDisabled]}>
            Voice Memo
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 8,
    minWidth: 140,
  },
  recordButtonDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: '#6B7280',
  },
  recordButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
  },
  recordButtonTextDisabled: {
    color: '#6B7280',
  },
  recordingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
  recordingTime: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#F3F4F6',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    marginBottom: 4,
  },
  recordingDuration: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F3F4F6',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 12,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  newRecordingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
});