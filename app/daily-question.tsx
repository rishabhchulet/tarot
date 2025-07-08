import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, BookOpen, Heart, Calendar } from 'lucide-react-native';
import { GlassCard, FloatingAction, designTokens } from '@/components/DesignSystem';
import { HapticManager } from '@/utils/nativeFeatures';
import { getTodaysEntry } from '@/utils/database';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

export default function DailyQuestionScreen() {
  const [todaysEntry, setTodaysEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Clean animation values
  const heartPulse = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  useEffect(() => {
    loadTodaysEntry();
    startAnimations();
  }, []);

  const loadTodaysEntry = async () => {
    try {
      const entry = await getTodaysEntry();
      console.log('📖 Today\'s entry loaded:', entry);
      setTodaysEntry(entry);
    } catch (error) {
      console.error('❌ Error loading today\'s entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAnimations = () => {
    // Gentle entrance animation
    setTimeout(() => {
      contentOpacity.value = withTiming(1, { duration: 800 });
      contentTranslateY.value = withSpring(0, designTokens.animations.spring.gentle);
    }, 300);

    // Subtle heart pulse
    heartPulse.value = withRepeat(
      withTiming(1.1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  };

  const handleBack = async () => {
    await HapticManager.triggerSelection();
    router.back();
  };

  const handleDrawCard = async () => {
    await HapticManager.triggerSelection();
    router.replace('/(tabs)');
  };

  // Animation styles
  const heartPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartPulse.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  // Extract the daily question from the entry
  const getDailyQuestion = () => {
    if (!todaysEntry) return null;
    
    // Try to get the daily question from the entry
    if (todaysEntry.daily_question) {
      return todaysEntry.daily_question;
    }
    
    // Fallback: create a question based on the card
    return `What am I truly devoted to—and does it reflect my authentic truth?`;
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <LinearGradient
        colors={designTokens.colors.gradients.main}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <BookOpen size={40} color={designTokens.colors.accent.gold} strokeWidth={1.5} />
            <Text style={styles.loadingText}>Loading your daily question...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!todaysEntry) {
    return (
      <LinearGradient
        colors={designTokens.colors.gradients.main}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Clean Header */}
          <View style={styles.header}>
            <FloatingAction onPress={handleBack}>
              <View style={styles.backButton}>
                <ArrowLeft size={24} color={designTokens.colors.text.primary} strokeWidth={1.5} />
              </View>
            </FloatingAction>
            <Text style={styles.headerTitle}>Daily Question</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.emptyContainer}>
            <GlassCard style={styles.emptyCard}>
              <Calendar size={64} color={designTokens.colors.text.muted} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No Card Drawn Today</Text>
              <Text style={styles.emptyDescription}>
                Draw your daily card first to receive your personal question for reflection.
              </Text>
              
              <FloatingAction onPress={handleDrawCard}>
                <GlassCard style={styles.drawCardButton} intensity="medium">
                  <Text style={styles.drawCardButtonText}>Draw Today's Card</Text>
                </GlassCard>
              </FloatingAction>
            </GlassCard>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const dailyQuestion = getDailyQuestion();

  return (
    <LinearGradient
      colors={designTokens.colors.gradients.main}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Clean Header */}
        <View style={styles.header}>
          <FloatingAction onPress={handleBack}>
            <View style={styles.backButton}>
              <ArrowLeft size={24} color={designTokens.colors.text.primary} strokeWidth={1.5} />
            </View>
          </FloatingAction>
          <Text style={styles.headerTitle}>Daily Question</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={[styles.content, contentStyle]}>
            {/* Date and Card Info */}
            <GlassCard style={styles.dateCard}>
              <Text style={styles.dateText}>{formatDate()}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>Your Card Today</Text>
                <Text style={styles.cardName}>{todaysEntry.card_name}</Text>
              </View>
            </GlassCard>

            {/* Main Question Container */}
            <GlassCard style={styles.questionCard}>
              {/* Animated heart icon */}
              <Animated.View style={[styles.heartContainer, heartPulseStyle]}>
                <Heart size={32} color={designTokens.colors.accent.gold} fill={designTokens.colors.accent.gold} />
              </Animated.View>

              <Text style={styles.questionTitle}>
                Return to this question throughout the day:
              </Text>

              <GlassCard style={styles.questionTextCard} intensity="light">
                <Text style={styles.questionText}>
                  "{dailyQuestion}"
                </Text>
              </GlassCard>

              {/* Decorative elements */}
              <View style={styles.decorativeElements}>
                <Text style={styles.decorativeSymbol}>✦</Text>
                <Text style={styles.decorativeSymbol}>◊</Text>
                <Text style={styles.decorativeSymbol}>✦</Text>
              </View>
            </GlassCard>

            {/* Guidance Section */}
            <GlassCard style={styles.guidanceCard}>
              <Text style={styles.guidanceTitle}>How to Use This Question</Text>
              <Text style={styles.guidanceText}>
                Let this question gently guide your awareness throughout the day. Notice what arises when you pause and reflect on it during quiet moments.
              </Text>
              <Text style={styles.guidanceText}>
                There are no right or wrong answers—only deeper understanding of your inner landscape.
              </Text>
              <Text style={styles.guidanceText}>
                Journal your insights when inspiration strikes, or simply hold the question in your heart as you move through your day.
              </Text>
            </GlassCard>
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

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: designTokens.spacing.md,
  },

  loadingText: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.md,
  },

  backButton: {
    padding: designTokens.spacing.sm,
    backgroundColor: designTokens.colors.glass.background,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
  },

  headerTitle: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
  },

  placeholder: {
    width: 48,
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

  // Date Card
  dateCard: {
    backgroundColor: designTokens.colors.background.tertiary,
    padding: designTokens.spacing.lg,
    alignItems: 'center',
  },

  dateText: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.md,
  },

  cardInfo: {
    alignItems: 'center',
    gap: designTokens.spacing.xs,
  },

  cardLabel: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.text.muted,
  },

  cardName: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
  },

  // Question Card
  questionCard: {
    backgroundColor: designTokens.colors.background.tertiary,
    padding: designTokens.spacing.xl,
    alignItems: 'center',
  },

  heartContainer: {
    marginBottom: designTokens.spacing.lg,
  },

  questionTitle: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
  },

  questionTextCard: {
    backgroundColor: designTokens.colors.background.elevated,
    padding: designTokens.spacing.lg,
    width: '100%',
    marginBottom: designTokens.spacing.lg,
  },

  questionText: {
    fontSize: designTokens.typography.fontSize.lg,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.lg,
    fontStyle: 'italic',
  },

  decorativeElements: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
  },

  decorativeSymbol: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.accent.gold,
  },

  // Guidance Card
  guidanceCard: {
    backgroundColor: designTokens.colors.background.tertiary,
    padding: designTokens.spacing.lg,
  },

  guidanceTitle: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.md,
  },

  guidanceText: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
    marginBottom: designTokens.spacing.md,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    paddingHorizontal: designTokens.spacing.md,
    justifyContent: 'center',
  },

  emptyCard: {
    backgroundColor: designTokens.colors.background.tertiary,
    padding: designTokens.spacing.xl,
    alignItems: 'center',
    gap: designTokens.spacing.lg,
  },

  emptyTitle: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.bold as any,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
  },

  drawCardButton: {
    backgroundColor: designTokens.colors.accent.primary,
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.xl,
  },

  drawCardButtonText: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.medium as any,
    color: designTokens.colors.text.primary,
  },
});