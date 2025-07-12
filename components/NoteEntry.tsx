import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, Heart, Play, Pause, Sparkles } from 'lucide-react-native';
import { playAudio } from '@/utils/audio';

interface NoteEntryProps {
  entry: any;
  onUpdate: () => void;
}

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
      {/* Header with date and heart */}
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <View style={styles.dateIconContainer}>
            <Calendar size={16} color="#fbbf24" />
          </View>
          <Text style={styles.date}>{formatDate(entry.date)}</Text>
        </View>
        <View style={styles.heartContainer}>
          <Heart size={18} color="#fbbf24" fill="rgba(251, 191, 36, 0.1)" />
        </View>
      </View>

      {/* Card name */}
      <Text style={styles.cardName}>{entry.card_name}</Text>
      
      {/* Keywords */}
      {entry.card_keywords && (
        <View style={styles.keywords}>
          {entry.card_keywords.map((keyword: string, index: number) => (
            <View key={index} style={styles.keyword}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Reflection sections */}
      <View style={styles.reflectionContainer}>
        {entry.first_impressions && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={16} color="#fbbf24" />
              <Text style={styles.sectionTitle}>First Impressions</Text>
            </View>
            <Text style={styles.reflectionText}>{entry.first_impressions}</Text>
          </View>
        )}

        {entry.personal_meaning && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Heart size={16} color="#fbbf24" />
              <Text style={styles.sectionTitle}>Personal Meaning</Text>
            </View>
            <Text style={styles.reflectionText}>{entry.personal_meaning}</Text>
          </View>
        )}

        {entry.voice_memo_path && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Play size={16} color="#fbbf24" />
              <Text style={styles.sectionTitle}>Voice Memo</Text>
            </View>
            <Pressable
              style={[styles.voiceButton, isPlayingAudio && styles.voiceButtonActive]}
              onPress={handlePlayVoiceMemo}
              disabled={isPlayingAudio}
            >
              <View style={styles.voiceButtonIcon}>
                {isPlayingAudio ? (
                  <Pause size={20} color="#0f172a" />
                ) : (
                  <Play size={20} color="#fbbf24" />
                )}
              </View>
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
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  date: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
  },
  heartContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.1)',
  },
  cardName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  keyword: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  keywordText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#fbbf24',
  },
  reflectionContainer: {
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#cbd5e1',
  },
  reflectionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    lineHeight: 24,
    paddingLeft: 24,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    gap: 12,
    alignSelf: 'flex-start',
    marginLeft: 24,
  },
  voiceButtonActive: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  voiceButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#fbbf24',
  },
  voiceButtonTextActive: {
    color: '#0f172a',
  },
});