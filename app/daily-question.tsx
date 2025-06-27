import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, BookOpen, Heart, Calendar } from 'lucide-react-native';
import { getTodaysEntry } from '@/utils/database';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export default function DailyQuestionScreen() {
  const [todaysEntry, setTodaysEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const heartPulse = useSharedValue(1);
  const shimmer = useSharedValue(0);

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
    // Heart pulse animation
    heartPulse.value = withRepeat(
      withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Shimmer effect
    shimmer.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  };

  const heartPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartPulse.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + (shimmer.value * 0.4),
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
        colors={['#1F2937', '#374151', '#6B46C1']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <BookOpen size={40} color="#F59E0B" />
          <Text style={styles.loadingText}>Loading your daily question...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!todaysEntry) {
    return (
      <LinearGradient
        colors={['#1F2937', '#374151', '#6B46C1']}
        style={styles.container}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#F3F4F6" />
          </Pressable>
          <Text style={styles.headerTitle}>Daily Question</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <Calendar size={64} color="#6B7280" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No Card Drawn Today</Text>
          <Text style={styles.emptyDescription}>
            Draw your daily card first to receive your personal question for reflection.
          </Text>
          
          <Pressable style={styles.drawCardButton} onPress={() => router.replace('/(tabs)')}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.drawCardButtonGradient}
            >
              <Text style={styles.drawCardButtonText}>Draw Today's Card</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  const dailyQuestion = getDailyQuestion();

  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      {/* Animated background effects */}
      <Animated.View style={[styles.backgroundShimmer, shimmerStyle]} />
      
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#F3F4F6" />
        </Pressable>
        <Text style={styles.headerTitle}>Daily Question</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Date and Card Info */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate()}</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardLabel}>Your Card Today</Text>
            <Text style={styles.cardName}>{todaysEntry.card_name}</Text>
          </View>
        </View>

        {/* Main Question Container */}
        <View style={styles.questionContainer}>
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.1)', 'rgba(139, 92, 246, 0.1)', 'rgba(59, 130, 246, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.questionBorder}
          >
            <View style={styles.questionContent}>
              {/* Animated heart icon */}
              <Animated.View style={[styles.heartContainer, heartPulseStyle]}>
                <Heart size={32} color="#F59E0B" fill="#F59E0B" />
              </Animated.View>

              <Text style={styles.questionTitle}>
                Return to this question throughout the day:
              </Text>

              <Text style={styles.questionText}>
                "{dailyQuestion}"
              </Text>

              {/* Decorative elements */}
              <View style={styles.decorativeElements}>
                <Text style={styles.decorativeSymbol}>✦</Text>
                <Text style={styles.decorativeSymbol}>◊</Text>
                <Text style={styles.decorativeSymbol}>✦</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Guidance Text */}
        <View style={styles.guidanceContainer}>
          <Text style={styles.guidanceTitle}>How to Use This Question</Text>
          <Text style={styles.guidanceText}>
            Let this question gently guide your awareness throughout the day. Notice what arises when you pause and reflect on it during quiet moments.
          </Text>
          <Text style={styles.guidanceText}>
            There's no need to force an answer—simply hold the question with curiosity and openness.
          </Text>
        </View>

        {/* Keywords Reminder */}
        {todaysEntry.card_keywords && (
          <View style={styles.keywordsContainer}>
            <Text style={styles.keywordsTitle}>Today's Energies</Text>
            <View style={styles.keywords}>
              {todaysEntry.card_keywords.slice(0, 4).map((keyword: string, index: number) => (
                <View key={index} style={styles.keyword}>
                  <Text style={styles.keywordText}>{keyword}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.actionButton} onPress={() => router.push('/(tabs)/journal')}>
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              style={styles.actionButtonGradient}
            >
              <BookOpen size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>View Journal</Text>
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={() => router.replace('/(tabs)')}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.actionButtonGradient}
            >
              <Calendar size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Back to Today</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  
  // Background effects
  backgroundShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
  },
  placeholder: {
    width: 40,
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F3F4F6',
    textAlign: 'center',
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  drawCardButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
  },
  drawCardButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  drawCardButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  
  // Main content
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  
  // Date and card info
  dateContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 16,
  },
  cardInfo: {
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F59E0B',
    textAlign: 'center',
  },
  
  // Question container
  questionContainer: {
    marginBottom: 32,
  },
  questionBorder: {
    borderRadius: 24,
    padding: 3,
  },
  questionContent: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderRadius: 21,
    padding: 32,
    alignItems: 'center',
  },
  heartContainer: {
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 20,
  },
  questionText: {
    fontSize: 22,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F59E0B',
    textAlign: 'center',
    lineHeight: 32,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  decorativeElements: {
    flexDirection: 'row',
    gap: 20,
  },
  decorativeSymbol: {
    fontSize: 18,
    color: '#8B5CF6',
    fontFamily: 'CormorantGaramond-Bold',
  },
  
  // Guidance section
  guidanceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  guidanceTitle: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F3F4F6',
    marginBottom: 16,
    textAlign: 'center',
  },
  guidanceText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  
  // Keywords section
  keywordsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  keywordsTitle: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F3F4F6',
    marginBottom: 16,
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  keyword: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  keywordText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
  },
  
  // Action buttons
  actionButtons: {
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});