import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NoteEntry } from '@/components/NoteEntry';
import { GlassCard, FloatingAction, ParticleSystem, designTokens, animationHelpers } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { getJournalEntries } from '@/utils/database';
import { BookOpen, Heart, Sparkles, Calendar, Search } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withDelay,
  interpolate
} from 'react-native-reanimated';

export default function JournalScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Enhanced animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(40);
  const backgroundGlow = useSharedValue(0);
  const statsOpacity = useSharedValue(0);

  useEffect(() => {
    loadEntries();
    startJournalAnimations();
  }, []);

  const startJournalAnimations = () => {
    // Background glow
    backgroundGlow.value = withTiming(1, { duration: 2000 });
    
    // Staggered entrance animations
    setTimeout(() => {
      animationHelpers.fadeIn(headerOpacity, 800);
      headerTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 200);

    setTimeout(() => {
      animationHelpers.fadeIn(statsOpacity, 600);
    }, 600);

    setTimeout(() => {
      animationHelpers.fadeIn(contentOpacity, 800);
      contentTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 800);
  };

  const loadEntries = async () => {
    try {
      setLoading(true);
      const journalEntries = await getJournalEntries();
      setEntries(journalEntries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await HapticManager.triggerSelection();
    await loadEntries();
  };

  // Enhanced animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));

  const backgroundGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backgroundGlow.value, [0, 1], [0, 0.6]),
  }));

  // Calculate journal statistics
  const totalEntries = entries.length;
  const recentEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  }).length;

  return (
    <LinearGradient
      colors={designTokens.colors.gradients.cosmic}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ParticleSystem count={20} animate={true} />
        
        {/* Enhanced Background Glow */}
        <Animated.View style={[styles.backgroundGlow, backgroundGlowStyle]} />

        {/* Enhanced Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.headerContent}>
            <View style={styles.titleSection}>
              <FloatingAction style={styles.titleIcon}>
                <BookOpen size={32} color={designTokens.colors.accent.brightBlue} strokeWidth={1.5} />
              </FloatingAction>
              <View>
                <Text style={styles.title}>My Journal</Text>
                <Text style={styles.subtitle}>Your reflection archive</Text>
              </View>
            </View>
            
            <FloatingAction onPress={handleRefresh} style={styles.refreshButton}>
              <Search size={20} color={designTokens.colors.text.muted} />
            </FloatingAction>
          </View>

          {/* Enhanced Statistics */}
          <Animated.View style={[styles.statsContainer, statsStyle]}>
            <GlassCard style={styles.statsCard} intensity="medium">
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Heart size={16} color={designTokens.colors.accent.rose} />
                  </View>
                  <Text style={styles.statNumber}>{totalEntries}</Text>
                  <Text style={styles.statLabel}>Total Entries</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Sparkles size={16} color={designTokens.colors.accent.gold} />
                  </View>
                  <Text style={styles.statNumber}>{recentEntries}</Text>
                  <Text style={styles.statLabel}>This Week</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Calendar size={16} color={designTokens.colors.accent.purple} />
                  </View>
                  <Text style={styles.statNumber}>
                    {totalEntries > 0 ? Math.ceil(totalEntries / 7) : 0}
                  </Text>
                  <Text style={styles.statLabel}>Avg/Week</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        </Animated.View>

        {/* Enhanced Content */}
        <Animated.View style={[styles.contentContainer, contentStyle]}>
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {loading ? (
              <View style={styles.loadingState}>
                <GlassCard style={styles.loadingCard} intensity="medium">
                  <Sparkles size={48} color={designTokens.colors.accent.gold} />
                  <Text style={styles.loadingText}>Loading your reflections...</Text>
                </GlassCard>
              </View>
            ) : entries.length === 0 ? (
              <View style={styles.emptyState}>
                <GlassCard style={styles.emptyCard} intensity="medium">
                  <View style={styles.emptyIcon}>
                    <BookOpen size={64} color={designTokens.colors.text.muted} strokeWidth={1.5} />
                  </View>
                  <Text style={styles.emptyTitle}>No entries yet</Text>
                  <Text style={styles.emptyDescription}>
                    Your daily reflections will appear here as you build your inner practice.
                  </Text>
                  <View style={styles.emptyHint}>
                    <Heart size={16} color={designTokens.colors.accent.rose} />
                    <Text style={styles.emptyHintText}>
                      Complete your first tarot reading to start your journal
                    </Text>
                  </View>
                </GlassCard>
              </View>
            ) : (
              <View style={styles.entriesContainer}>
                {entries.map((entry, index) => (
                  <NoteEntry
                    key={entry.id || index}
                    entry={entry}
                    onUpdate={loadEntries}
                    index={index}
                  />
                ))}
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
    top: '15%',
    left: '10%',
    right: '10%',
    height: '50%',
    borderRadius: 200,
    backgroundColor: designTokens.colors.accent.purple,
    opacity: 0.4,
  },

  // Enhanced Header
  header: {
    paddingHorizontal: designTokens.spacing.md,
    paddingTop: designTokens.spacing.lg,
    paddingBottom: designTokens.spacing.md,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.lg,
  },

  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.md,
  },

  titleIcon: {
    padding: designTokens.spacing.sm,
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

  refreshButton: {
    padding: designTokens.spacing.sm,
  },

  // Enhanced Statistics
  statsContainer: {
    marginBottom: designTokens.spacing.md,
  },

  statsCard: {
    paddingVertical: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.md,
  },

  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: designTokens.spacing.xs,
  },

  statIcon: {
    padding: designTokens.spacing.xs,
  },

  statNumber: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
  },

  statLabel: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
  },

  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: designTokens.colors.glass.border,
    marginHorizontal: designTokens.spacing.sm,
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

  // Loading State
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: designTokens.spacing.xxxl,
  },

  loadingCard: {
    paddingVertical: designTokens.spacing.xl,
    paddingHorizontal: designTokens.spacing.lg,
    alignItems: 'center',
    gap: designTokens.spacing.lg,
  },

  loadingText: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
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
    borderColor: designTokens.colors.accent.rose,
  },

  emptyHintText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.accent.rose,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },

  // Enhanced Entries
  entriesContainer: {
    gap: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
  },
});