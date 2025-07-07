import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard, FloatingAction, ParticleSystem, designTokens, animationHelpers } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { getJournalEntries } from '@/utils/database';
import { Calendar as CalendarIcon, TrendingUp, Sparkles, Heart, Clock, Target, Star, ChevronRight, BarChart3 } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

export default function CalendarScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Enhanced animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);
  const statsOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(40);
  const backgroundGlow = useSharedValue(0);
  const insightsScale = useSharedValue(0.9);

  useEffect(() => {
    loadEntries();
    startCalendarAnimations();
  }, []);

  const startCalendarAnimations = () => {
    // Background glow
    backgroundGlow.value = withTiming(1, { duration: 2000 });
    
    // Staggered entrance animations
    setTimeout(() => {
      animationHelpers.fadeIn(headerOpacity, 800);
      headerTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 200);

    setTimeout(() => {
      animationHelpers.fadeIn(statsOpacity, 600);
      insightsScale.value = withSpring(1, designTokens.animations.spring.bouncy);
    }, 600);

    setTimeout(() => {
      animationHelpers.fadeIn(contentOpacity, 800);
      contentTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 1000);
  };

  const loadEntries = async () => {
    try {
      const journalEntries = await getJournalEntries();
      setEntries(journalEntries);
      calculateStreak(journalEntries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  const calculateStreak = (entries: any[]) => {
    // Enhanced streak calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    
    // Sort entries by date (most recent first)
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
  };

  const groupEntriesByMonth = () => {
    const grouped: { [key: string]: any[] } = {};
    
    entries.forEach((entry: any) => {
      const date = new Date(entry.date);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(entry);
    });
    
    // Sort months (most recent first)
    const sortedGrouped: { [key: string]: any[] } = {};
    Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .forEach(key => {
        sortedGrouped[key] = grouped[key].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
    
    return sortedGrouped;
  };

  const calculateInsights = () => {
    const totalDays = entries.length;
    // Simple unique cards calculation without Set
    const cardNames: string[] = [];
    entries.forEach((entry: any) => {
      if (cardNames.indexOf(entry.card_name) === -1) {
        cardNames.push(entry.card_name);
      }
    });
    const uniqueCards = cardNames.length;
    const averagePerWeek = totalDays > 0 ? Math.round((totalDays / (totalDays * 7 / 30)) * 10) / 10 : 0;
    const mostFrequentCard = entries.length > 0 ? 
      entries.reduce((acc: Record<string, number>, entry: any) => {
        acc[entry.card_name] = (acc[entry.card_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) : {};
    
    const topCard = Object.keys(mostFrequentCard).reduce((a, b) => 
      mostFrequentCard[a] > mostFrequentCard[b] ? a : b, Object.keys(mostFrequentCard)[0] || '');

    return { totalDays, uniqueCards, averagePerWeek, topCard };
  };

  const handleMonthPress = async (month: string) => {
    await HapticManager.triggerSelection();
    setSelectedMonth(selectedMonth === month ? null : month);
  };

  const handleEntryPress = async (entry: any) => {
    await HapticManager.triggerSelection();
    // Navigate to entry detail or expand functionality
  };

  // Enhanced animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ scale: insightsScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const backgroundGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backgroundGlow.value, [0, 1], [0, 0.4]),
  }));

  const groupedEntries = groupEntriesByMonth();
  const insights = calculateInsights();

  return (
    <LinearGradient
      colors={designTokens.colors.gradients.cosmic}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ParticleSystem count={15} animate={true} />
        
        {/* Enhanced Background Glow */}
        <Animated.View style={[styles.backgroundGlow, backgroundGlowStyle]} />

        {/* Enhanced Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.headerContent}>
            <FloatingAction style={styles.titleIcon}>
              <BarChart3 size={32} color={designTokens.colors.accent.brightBlue} strokeWidth={1.5} />
            </FloatingAction>
            <View style={styles.titleSection}>
              <Text style={styles.title}>Your Journey</Text>
              <Text style={styles.subtitle}>Tracking your inner growth</Text>
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Insights Dashboard */}
        <Animated.View style={[styles.insightsContainer, statsStyle]}>
          <GlassCard style={styles.insightsCard} intensity="medium">
            <View style={styles.insightsHeader}>
              <Sparkles size={20} color={designTokens.colors.accent.gold} />
              <Text style={styles.insightsTitle}>Journey Insights</Text>
            </View>
            
            <View style={styles.insightsGrid}>
              <View style={styles.insightItem}>
                <View style={styles.insightIcon}>
                  <Target size={16} color={designTokens.colors.accent.brightBlue} />
                </View>
                <Text style={styles.insightNumber}>{streak}</Text>
                <Text style={styles.insightLabel}>Day Streak</Text>
              </View>
              
              <View style={styles.insightDivider} />
              
              <View style={styles.insightItem}>
                <View style={styles.insightIcon}>
                  <Heart size={16} color={designTokens.colors.accent.rose} />
                </View>
                <Text style={styles.insightNumber}>{insights.totalDays}</Text>
                <Text style={styles.insightLabel}>Reflections</Text>
              </View>
              
              <View style={styles.insightDivider} />
              
              <View style={styles.insightItem}>
                <View style={styles.insightIcon}>
                  <Star size={16} color={designTokens.colors.accent.purple} />
                </View>
                <Text style={styles.insightNumber}>{insights.uniqueCards}</Text>
                <Text style={styles.insightLabel}>Unique Cards</Text>
              </View>
            </View>

            {insights.topCard && (
              <View style={styles.favoriteCard}>
                <Text style={styles.favoriteCardLabel}>Most Drawn Card</Text>
                <Text style={styles.favoriteCardName}>{insights.topCard}</Text>
              </View>
            )}
          </GlassCard>
        </Animated.View>

        {/* Enhanced Content */}
        <Animated.View style={[styles.contentContainer, contentStyle]}>
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {Object.keys(groupedEntries).length === 0 ? (
              <View style={styles.emptyState}>
                <GlassCard style={styles.emptyCard} intensity="medium">
                  <View style={styles.emptyIcon}>
                    <CalendarIcon size={64} color={designTokens.colors.text.muted} strokeWidth={1.5} />
                  </View>
                  <Text style={styles.emptyTitle}>Your journey begins</Text>
                  <Text style={styles.emptyDescription}>
                    Start your daily practice to see your inner growth over time.
                  </Text>
                  <View style={styles.emptyHint}>
                    <Sparkles size={16} color={designTokens.colors.accent.gold} />
                    <Text style={styles.emptyHintText}>
                      Complete readings to build your timeline
                    </Text>
                  </View>
                </GlassCard>
              </View>
            ) : (
              <View style={styles.timelineContainer}>
                {Object.keys(groupedEntries).map((month, monthIndex) => {
                  const monthEntries = groupedEntries[month];
                  return (
                  <View key={month} style={styles.monthSection}>
                    <Pressable onPress={() => handleMonthPress(month)}>
                      <GlassCard style={styles.monthHeader} intensity="light">
                        <View style={styles.monthTitleContainer}>
                          <CalendarIcon size={20} color={designTokens.colors.accent.gold} />
                          <Text style={styles.monthTitle}>{month}</Text>
                          <Text style={styles.monthCount}>({monthEntries.length})</Text>
                        </View>
                        <ChevronRight 
                          size={20} 
                          color={designTokens.colors.text.muted}
                          style={{ 
                            transform: [{ 
                              rotate: selectedMonth === month ? '90deg' : '0deg' 
                            }] 
                          }}
                        />
                      </GlassCard>
                    </Pressable>
                    
                    {(selectedMonth === month || selectedMonth === null) && (
                      <View style={styles.timelineEntries}>
                        {monthEntries.map((entry, index) => (
                          <Pressable 
                            key={entry.id || index} 
                            onPress={() => handleEntryPress(entry)}
                          >
                            <GlassCard style={styles.timelineEntry} intensity="light">
                              <View style={styles.timelineLine}>
                                <View style={styles.timelineDot} />
                                {index < monthEntries.length - 1 && (
                                  <View style={styles.timelineConnector} />
                                )}
                              </View>
                              
                              <View style={styles.entryContent}>
                                <View style={styles.entryHeader}>
                                  <View style={styles.entryDate}>
                                    <Clock size={14} color={designTokens.colors.text.muted} />
                                    <Text style={styles.entryDateText}>
                                      {new Date(entry.date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </Text>
                                  </View>
                                  <FloatingAction style={styles.entryAction}>
                                    <ChevronRight size={16} color={designTokens.colors.text.muted} />
                                  </FloatingAction>
                                </View>
                                
                                <Text style={styles.entryCardName}>{entry.card_name}</Text>
                                
                                {entry.card_keywords && entry.card_keywords.length > 0 && (
                                  <View style={styles.entryKeywords}>
                                    {entry.card_keywords.slice(0, 2).map((keyword: string, keywordIndex: number) => (
                                      <View key={keywordIndex} style={styles.entryKeyword}>
                                        <Text style={styles.entryKeywordText}>{keyword}</Text>
                                      </View>
                                    ))}
                                  </View>
                                )}
                                
                                {(entry.first_impressions || entry.personal_meaning) && (
                                  <Text style={styles.entryPreview} numberOfLines={2}>
                                    {entry.first_impressions || entry.personal_meaning}
                                  </Text>
                                )}
                              </View>
                            </GlassCard>
                          </Pressable>
                        ))}
                      </View>
                                         )}
                   </View>
                 );
                })}
                </View>
            )}
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  backgroundGlow: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    right: '20%',
    height: '40%',
    borderRadius: 150,
    backgroundColor: designTokens.colors.accent.brightBlue,
    opacity: 0.3,
  },

  // Enhanced Header
  header: {
    paddingHorizontal: designTokens.spacing.md,
    paddingTop: designTokens.spacing.lg,
    paddingBottom: designTokens.spacing.md,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.md,
  },

  titleIcon: {
    padding: designTokens.spacing.sm,
  },

  titleSection: {
    flex: 1,
  },

  title: {
    fontSize: designTokens.typography.fontSize['3xl'],
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
  },

  subtitle: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.muted,
    marginTop: designTokens.spacing.xs,
  },

  // Enhanced Insights Dashboard
  insightsContainer: {
    paddingHorizontal: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.lg,
  },

  insightsCard: {
    paddingVertical: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.md,
  },

  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.lg,
  },

  insightsTitle: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
  },

  insightsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.lg,
  },

  insightItem: {
    flex: 1,
    alignItems: 'center',
    gap: designTokens.spacing.xs,
  },

  insightIcon: {
    padding: designTokens.spacing.xs,
  },

  insightNumber: {
    fontSize: designTokens.typography.fontSize['2xl'],
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
  },

  insightLabel: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
  },

  insightDivider: {
    width: 1,
    height: 40,
    backgroundColor: designTokens.colors.glass.border,
    marginHorizontal: designTokens.spacing.sm,
  },

  favoriteCard: {
    alignItems: 'center',
    paddingTop: designTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.glass.border,
  },

  favoriteCardLabel: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
    marginBottom: designTokens.spacing.xs,
  },

  favoriteCardName: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.accent.gold,
  },

  // Enhanced Content
  contentContainer: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.xxxl,
  },

  // Enhanced Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: designTokens.spacing.xxxl,
  },

  emptyCard: {
    paddingVertical: designTokens.spacing.xxxl,
    paddingHorizontal: designTokens.spacing.xl,
    alignItems: 'center',
    maxWidth: 320,
  },

  emptyIcon: {
    marginBottom: designTokens.spacing.xl,
    padding: designTokens.spacing.lg,
  },

  emptyTitle: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.md,
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
    marginBottom: designTokens.spacing.lg,
  },

  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.md,
    backgroundColor: designTokens.colors.glass.background,
    borderRadius: designTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: designTokens.colors.accent.gold,
  },

  emptyHintText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.accent.gold,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },

  // Enhanced Timeline
  timelineContainer: {
    gap: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
  },

  monthSection: {
    gap: designTokens.spacing.md,
  },

  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.lg,
  },

  monthTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },

  monthTitle: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
  },

  monthCount: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
  },

  timelineEntries: {
    gap: designTokens.spacing.md,
    paddingLeft: designTokens.spacing.lg,
  },

  timelineEntry: {
    flexDirection: 'row',
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.md,
  },

  timelineLine: {
    alignItems: 'center',
    marginRight: designTokens.spacing.lg,
  },

  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: designTokens.colors.accent.gold,
    borderWidth: 2,
    borderColor: designTokens.colors.glass.background,
  },

  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: designTokens.colors.glass.border,
    marginTop: designTokens.spacing.sm,
  },

  entryContent: {
    flex: 1,
    gap: designTokens.spacing.sm,
  },

  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  entryDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
  },

  entryDateText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },

  entryAction: {
    padding: designTokens.spacing.xs,
  },

  entryCardName: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
  },

  entryKeywords: {
    flexDirection: 'row',
    gap: designTokens.spacing.xs,
  },

  entryKeyword: {
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    backgroundColor: designTokens.colors.glass.background,
    borderRadius: designTokens.borderRadius.sm,
    borderWidth: 1,
    borderColor: designTokens.colors.accent.purple,
  },

  entryKeywordText: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.accent.purple,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },

  entryPreview: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.secondary,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.sm,
  },
});