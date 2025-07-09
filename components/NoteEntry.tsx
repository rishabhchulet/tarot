import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, Heart, Play, Pause } from 'lucide-react-native';
import { playAudio } from '@/utils/audio';

interface NoteEntryProps {
  entry: any;
  onUpdate: () => void;
}
//TESTING in my new game
//let's see
export function NoteEntry({ entry }: NoteEntryProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePlayVoiceMemo = async () => {
    if (!entry.voice_memo_path || isPlayingAudio) return;

    setIsPlayingAudio(true);
    const success = await playAudio(entry.voice_memo_path);
    
    // Simulate playback duration (in a real app, you'd get the actual duration)
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 5000); // 5 seconds placeholder
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Calendar size={16} color="#6B7280" />
          <Text style={styles.date}>{formatDate(entry.date)}</Text>
        </View>
        <Heart size={16} color="#1e3a8a" />
      </View>

      <Text style={[styles.cardName, { color: '#F9FAFB' }]}>{entry.card_name}</Text>
      
      {entry.card_keywords && (
        <View style={styles.keywords}>
          {entry.card_keywords.map((keyword: string, index: number) => (
            <View key={index} style={[styles.keyword, { 
              backgroundColor: 'rgba(30, 58, 138, 0.2)',
              borderColor: 'rgba(30, 58, 138, 0.3)'
            }]}>
              <Text style={[styles.keywordText, { color: '#F9FAFB' }]}>{keyword}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.reflectionContainer}>
        {entry.first_impressions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>First Impressions</Text>
            <Text style={styles.reflectionText}>{entry.first_impressions}</Text>
          </View>
        )}

        {entry.personal_meaning && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Meaning</Text>
            <Text style={styles.reflectionText}>{entry.personal_meaning}</Text>
          </View>
        )}

        {entry.voice_memo_path && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Memo</Text>
            <Pressable
              style={[styles.voiceButton, isPlayingAudio && styles.voiceButtonActive]}
              onPress={handlePlayVoiceMemo}
              disabled={isPlayingAudio}
            >
              {isPlayingAudio ? (
                <Pause size={20} color="#FFFFFF" />
              ) : (
                <Play size={20} color="#F59E0B" />
              )}
              <Text style={[styles.voiceButtonText, isPlayingAudio && styles.voiceButtonTextActive]}>
                {isPlayingAudio ? 'Playing...' : 'Play Voice Memo'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.15)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  cardName: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond-Bold',
    marginBottom: 12,
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  keyword: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  keywordText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  reflectionContainer: {
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
  },
  reflectionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F9FAFB',
    lineHeight: 24,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1e3a8a',
    gap: 8,
    alignSelf: 'flex-start',
  },
  voiceButtonActive: {
    backgroundColor: '#1e3a8a',
  },
  voiceButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1e3a8a',
  },
  voiceButtonTextActive: {
    color: '#F9FAFB',
  },
});