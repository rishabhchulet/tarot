import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard, FloatingAction, designTokens } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { router } from 'expo-router';
import { Sparkles, Calendar, BookOpen, Settings, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getTodaysEntry, getJournalEntries } from '@/utils/database';
import { getRandomCard } from '@/data/tarotCards';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export default function HomeScreen() {
  const { user } = useAuth();
  const [dailyCard, setDailyCard] = useState<any>(null);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Clean, simple animations
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.95);

  useEffect(() => {
    loadHomeData();
    startHomeAnimations();
  }, []);

  const startHomeAnimations = () => {
    // Simple, clean entrance animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    setTimeout(() => {
      contentOpacity.value = withTiming(1, { duration: 800 });
      cardScale.value = withSpring(1, designTokens.animations.spring.gentle);
    }, 200);
  };

  const loadHomeData = async () => {
    try {
      console.log('🏠 Loading home screen data...');
      
      // Try to get today's journal entry first
      const todaysEntry = await getTodaysEntry();
      console.log('📱 Today\'s entry:', todaysEntry);
      
      if (todaysEntry && todaysEntry.card_name) {
        // Use the card from today's entry
        setDailyCard({
          id: todaysEntry.id,
          name: todaysEntry.card_name,
          meaning: todaysEntry.card_keywords?.[0] || 'Daily Guidance',
          description: todaysEntry.reflection || 'Your daily guidance awaits.',
        });
      } else {
        // Get a consistent "daily" card based on today's date
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
        
        // Seed random to be consistent for the day
        const dailyCardIndex = dayOfYear % 78; // 78 cards in tarot deck
        const randomCard = getRandomCard();
        
        setDailyCard({
          id: `daily-${dayOfYear}`,
          name: randomCard.name,
          meaning: randomCard.keywords[0] || 'Daily Wisdom',
          description: randomCard.description,
          reflectionQuestion: randomCard.reflectionQuestion,
        });
      }

      // Load recent journal entries
      const entries = await getJournalEntries();
      console.log('📖 Recent entries:', entries?.length || 0);
      setRecentEntries(entries?.slice(0, 3) || []);

    } catch (error) {
      console.error('❌ Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = async () => {
    await HapticManager.triggerSelection();
    if (dailyCard) {
      router.push(`/reading?cardId=${dailyCard.id}`);
    }
  };

  const handleJournalPress = async () => {
    await HapticManager.triggerSelection();
    router.push('/(tabs)/journal');
  };

  const handleCalendarPress = async () => {
    await HapticManager.triggerSelection();
    router.push('/(tabs)/calendar');
  };

  const handleProfilePress = async () => {
    await HapticManager.triggerSelection();
    router.push('/profile');
  };

  // Animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <LinearGradient
        colors={designTokens.colors.gradients.main}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your daily wisdom...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={designTokens.colors.gradients.main}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Clean Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Seeker'}</Text>
        </View>
            <FloatingAction onPress={handleProfilePress}>
              <View style={styles.profileButton}>
                <User size={20} color={designTokens.colors.text.primary} strokeWidth={1.5} />
              </View>
            </FloatingAction>
          </View>
          <Text style={styles.date}>{formatDate()}</Text>
        </Animated.View>

        {/* Content with excellent readability */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={[styles.content, contentStyle]}>
            {/* Daily Card - Clean and readable */}
            {dailyCard && (
              <Animated.View style={cardStyle}>
                <GlassCard style={styles.dailyCardContainer}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleSection}>
                      <Sparkles size={20} color={designTokens.colors.accent.gold} strokeWidth={1.5} />
                      <Text style={styles.cardTitle}>Your Daily Guidance</Text>
                    </View>
                  </View>
                  
                  <FloatingAction onPress={handleCardPress}>
                    <GlassCard style={styles.dailyCard} intensity="medium">
                      <View style={styles.cardContent}>
                        <Text style={styles.cardName}>{dailyCard.name}</Text>
                        <Text style={styles.cardMeaning}>{dailyCard.meaning}</Text>
                        <Text style={styles.cardDescription} numberOfLines={3}>
                          {dailyCard.description}
                  </Text>
                      </View>
                      <View style={styles.cardFooter}>
                        <Text style={styles.readMoreText}>Tap to explore deeper</Text>
                      </View>
                    </GlassCard>
                  </FloatingAction>
                </GlassCard>
              </Animated.View>
            )}

            {/* Quick Actions */}
            <GlassCard style={styles.actionsCard}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <FloatingAction onPress={handleJournalPress}>
                  <GlassCard style={styles.actionItem} intensity="light">
                    <BookOpen size={24} color={designTokens.colors.accent.purple} strokeWidth={1.5} />
                    <Text style={styles.actionLabel}>Journal</Text>
                    <Text style={styles.actionHint}>Reflect & record</Text>
                  </GlassCard>
                </FloatingAction>

                <FloatingAction onPress={handleCalendarPress}>
                  <GlassCard style={styles.actionItem} intensity="light">
                    <Calendar size={24} color={designTokens.colors.accent.primary} strokeWidth={1.5} />
                    <Text style={styles.actionLabel}>Calendar</Text>
                    <Text style={styles.actionHint}>View your journey</Text>
                  </GlassCard>
                </FloatingAction>
                  </View>
            </GlassCard>

            {/* Recent Entries - Clean and readable */}
            {recentEntries.length > 0 && (
              <GlassCard style={styles.recentCard}>
                <View style={styles.recentHeader}>
                  <Text style={styles.sectionTitle}>Recent Reflections</Text>
                  <FloatingAction onPress={handleJournalPress}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </FloatingAction>
                </View>
                
                <View style={styles.entriesList}>
                  {recentEntries.map((entry, index) => (
                    <GlassCard key={entry.id || index} style={styles.entryItem} intensity="light">
                      <View style={styles.entryContent}>
                        <Text style={styles.entryCard}>{entry.card_name}</Text>
                        <Text style={styles.entryDate}>
                          {new Date(entry.date).toLocaleDateString()}
            </Text>
          </View>
                      {entry.keywords && entry.keywords.length > 0 && (
                        <View style={styles.entryKeywords}>
                          {entry.keywords.slice(0, 2).map((keyword: string, keywordIndex: number) => (
                            <View key={keywordIndex} style={styles.keyword}>
                              <Text style={styles.keywordText}>{keyword}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </GlassCard>
                  ))}
                </View>
              </GlassCard>
            )}
          </Animated.View>
        </ScrollView>
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
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
  },

  // Clean Header
  header: {
    paddingHorizontal: designTokens.spacing.md,
    paddingTop: designTokens.spacing.sm,
    paddingBottom: designTokens.spacing.lg,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.sm,
  },

  userInfo: {
    flex: 1,
  },

  greeting: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.xs,
  },

  userName: {
    fontSize: designTokens.typography.fontSize['2xl'],
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
  },

  profileButton: {
    padding: designTokens.spacing.sm,
    backgroundColor: designTokens.colors.glass.background,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
  },

  date: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
  },

  // Content
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.xxxl,
  },

  content: {
    gap: designTokens.spacing.lg,
  },

  // Daily Card - Clean and readable
  dailyCardContainer: {
    backgroundColor: designTokens.colors.background.tertiary,
    padding: designTokens.spacing.lg,
  },

  cardHeader: {
    marginBottom: designTokens.spacing.lg,
  },

  cardTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },

  cardTitle: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
  },

  dailyCard: {
    backgroundColor: designTokens.colors.background.elevated,
    padding: designTokens.spacing.lg,
  },

  cardContent: {
    marginBottom: designTokens.spacing.md,
  },

  cardName: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.sm,
  },

  cardMeaning: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.medium as any,
    color: designTokens.colors.accent.gold,
    marginBottom: designTokens.spacing.md,
  },

  cardDescription: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
  },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.glass.border,
    paddingTop: designTokens.spacing.md,
  },

  readMoreText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.accent.primary,
    fontWeight: designTokens.typography.fontWeight.medium as any,
    textAlign: 'center',
  },

  // Quick Actions
  actionsCard: {
    backgroundColor: designTokens.colors.background.tertiary,
    padding: designTokens.spacing.lg,
  },

  sectionTitle: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.md,
  },

  actionsGrid: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
  },

  actionItem: {
    flex: 1,
    backgroundColor: designTokens.colors.background.elevated,
    padding: designTokens.spacing.md,
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },

  actionLabel: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.medium as any,
    color: designTokens.colors.text.primary,
  },

  actionHint: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.text.muted,
    textAlign: 'center',
  },
  
  // Recent Entries
  recentCard: {
    backgroundColor: designTokens.colors.background.tertiary,
    padding: designTokens.spacing.lg,
  },

  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },

  viewAllText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.accent.primary,
    fontWeight: designTokens.typography.fontWeight.medium as any,
  },

  entriesList: {
    gap: designTokens.spacing.sm,
  },

  entryItem: {
    backgroundColor: designTokens.colors.background.elevated,
    padding: designTokens.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  entryContent: {
    flex: 1,
  },

  entryCard: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.medium as any,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
  },

  entryDate: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.text.muted,
  },

  entryKeywords: {
    flexDirection: 'row',
    gap: designTokens.spacing.xs,
  },

  keyword: {
    backgroundColor: designTokens.colors.glass.background,
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.sm,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
  },

  keywordText: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.text.muted,
  },
});