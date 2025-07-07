import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, Heart, Play, Pause, MessageCircle } from 'lucide-react-native';
import { GlassCard, FloatingAction, designTokens, animationHelpers } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { playAudio } from '@/utils/audio';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withDelay,
  interpolate
} from 'react-native-reanimated';

interface NoteEntryProps {
  entry: any;
  onUpdate: () => void;
  index?: number;
}
//TESTING in my new game
//let's see
export function NoteEntry({ entry, onUpdate, index = 0 }: NoteEntryProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Enhanced animation values
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.95);
  const cardTranslateY = useSharedValue(20);
  const heartPulse = useSharedValue(1);

  useEffect(() => {
    // Staggered entrance animation
    setTimeout(() => {
      animationHelpers.fadeIn(cardOpacity, 600);
      cardScale.value = withSpring(1, designTokens.animations.spring.gentle);
      cardTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, index * 150 + 200);

    // Heart pulse animation
    setTimeout(() => {
      heartPulse.value = withSpring(1.2, designTokens.animations.spring.bouncy, () => {
        heartPulse.value = withSpring(1, designTokens.animations.spring.gentle);
      });
    }, index * 150 + 800);
  }, []);

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

    await HapticManager.triggerSelection();
    setIsPlayingAudio(true);
    const success = await playAudio(entry.voice_memo_path);
    
    // Simulate playback duration (in a real app, you'd get the actual duration)
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 5000); // 5 seconds placeholder
  };

  const handleCardPress = async () => {
    await HapticManager.triggerSelection();
    // Add any expansion/detail view logic here
  };

  // Enhanced animated styles
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { scale: cardScale.value },
      { translateY: cardTranslateY.value }
    ],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartPulse.value }],
  }));

  return (
    <Animated.View style={cardStyle}>
      <Pressable onPress={handleCardPress}>
        <GlassCard style={styles.container} intensity="medium">
          {/* Enhanced Header */}
          <View style={styles.header}>
            <View style={styles.dateContainer}>
              <FloatingAction style={styles.calendarIcon}>
                <Calendar size={16} color={designTokens.colors.text.muted} />
              </FloatingAction>
              <Text style={styles.date}>{formatDate(entry.date)}</Text>
            </View>
            
            <Animated.View style={heartStyle}>
              <FloatingAction style={styles.heartIcon}>
                <Heart size={16} color={designTokens.colors.accent.rose} fill={designTokens.colors.accent.rose} />
              </FloatingAction>
            </Animated.View>
          </View>

          {/* Enhanced Card Name */}
          <View style={styles.cardNameContainer}>
            <Text style={styles.cardName}>{entry.card_name}</Text>
            <View style={styles.cardNameUnderline} />
          </View>
          
          {/* Enhanced Keywords */}
          {entry.card_keywords && (
            <View style={styles.keywords}>
              {entry.card_keywords.map((keyword: string, keywordIndex: number) => (
                <View key={keywordIndex}>
                  <GlassCard style={styles.keyword} intensity="light">
                    <Text style={styles.keywordText}>{keyword}</Text>
                  </GlassCard>
                </View>
              ))}
            </View>
          )}

          {/* Enhanced Reflection Sections */}
          <View style={styles.reflectionContainer}>
            {entry.first_impressions && (
              <GlassCard style={styles.section} intensity="light">
                <View style={styles.sectionHeader}>
                  <MessageCircle size={16} color={designTokens.colors.accent.brightBlue} />
                  <Text style={styles.sectionTitle}>First Impressions</Text>
                </View>
                <Text style={styles.reflectionText}>{entry.first_impressions}</Text>
              </GlassCard>
            )}

            {entry.personal_meaning && (
              <GlassCard style={styles.section} intensity="light">
                <View style={styles.sectionHeader}>
                  <Heart size={16} color={designTokens.colors.accent.purple} />
                  <Text style={styles.sectionTitle}>Personal Meaning</Text>
                </View>
                <Text style={styles.reflectionText}>{entry.personal_meaning}</Text>
              </GlassCard>
            )}

            {entry.voice_memo_path && (
              <GlassCard style={styles.section} intensity="light">
                <View style={styles.sectionHeader}>
                  <Play size={16} color={designTokens.colors.accent.gold} />
                  <Text style={styles.sectionTitle}>Voice Memo</Text>
                </View>
                
                <Pressable
                  onPress={handlePlayVoiceMemo}
                  disabled={isPlayingAudio}
                  style={[
                    styles.voiceButton,
                    isPlayingAudio && styles.voiceButtonActive
                  ]}
                >
                  <View style={styles.voiceButtonContent}>
                    {isPlayingAudio ? (
                      <Pause size={20} color={designTokens.colors.text.primary} />
                    ) : (
                      <Play size={20} color={designTokens.colors.accent.gold} />
                    )}
                    <Text style={[
                      styles.voiceButtonText,
                      isPlayingAudio && styles.voiceButtonTextActive
                    ]}>
                      {isPlayingAudio ? 'Playing...' : 'Play Voice Memo'}
                    </Text>
                  </View>
                </Pressable>
              </GlassCard>
            )}
          </View>

          {/* Enhanced Footer */}
          <View style={styles.footer}>
            <View style={styles.entryStats}>
              <Text style={styles.entryStatsText}>
                {[
                  entry.first_impressions && 'Impressions',
                  entry.personal_meaning && 'Meaning',
                  entry.voice_memo_path && 'Voice'
                ].filter(Boolean).join(' • ')}
              </Text>
            </View>
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.md,
    marginBottom: designTokens.spacing.sm,
  },

  // Enhanced Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.lg,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },

  calendarIcon: {
    padding: designTokens.spacing.xs,
  },

  date: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },

  heartIcon: {
    padding: designTokens.spacing.xs,
  },

  // Enhanced Card Name
  cardNameContainer: {
    marginBottom: designTokens.spacing.lg,
  },

  cardName: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
    textAlign: 'center',
  },

  cardNameUnderline: {
    height: 2,
    backgroundColor: designTokens.colors.accent.gold,
    alignSelf: 'center',
    width: '30%',
    borderRadius: 1,
  },

  // Enhanced Keywords
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.lg,
    justifyContent: 'center',
  },

  keyword: {
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    borderWidth: 1,
    borderColor: designTokens.colors.accent.gold,
  },

  keywordText: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.accent.gold,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
  },

  // Enhanced Reflection Container
  reflectionContainer: {
    gap: designTokens.spacing.md,
    marginBottom: designTokens.spacing.md,
  },

  section: {
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.md,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.sm,
  },

  sectionTitle: {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.secondary,
  },

  reflectionText: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.primary,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
  },

  // Enhanced Voice Button
  voiceButton: {
    marginTop: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.lg,
    borderWidth: 1,
    borderColor: designTokens.colors.accent.gold,
    alignSelf: 'flex-start',
  },

  voiceButtonActive: {
    backgroundColor: designTokens.colors.accent.gold,
    borderColor: designTokens.colors.accent.gold,
  },

  voiceButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },

  voiceButtonText: {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.accent.gold,
  },

  voiceButtonTextActive: {
    color: designTokens.colors.text.primary,
  },

  // Enhanced Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.glass.border,
    paddingTop: designTokens.spacing.md,
    alignItems: 'center',
  },

  entryStats: {
    paddingVertical: designTokens.spacing.xs,
    paddingHorizontal: designTokens.spacing.md,
    backgroundColor: designTokens.colors.glass.background,
    borderRadius: designTokens.borderRadius.md,
  },

  entryStatsText: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.text.accent,
    fontWeight: designTokens.typography.fontWeight.medium as any,
    textAlign: 'center',
  },
});