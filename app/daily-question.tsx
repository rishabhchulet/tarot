import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { ArrowLeft, BookOpen, Repeat, Home } from 'lucide-react-native';
import { getTodaysEntry } from '@/utils/database';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence, interpolate, Extrapolate } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { PlanetaryLoadingAnimation } from '@/components/PlanetaryLoadingAnimation';

export default function DailyQuestionScreen() {
  const [todaysEntry, setTodaysEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  
  const glow = useSharedValue(0);
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);

  const loadTodaysEntry = useCallback(async () => {
    setLoading(true);
    try {
      const entry = await getTodaysEntry();
      setTodaysEntry(entry);
    } catch (error) {
      console.error('❌ Error loading today\'s entry:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTodaysEntry();
    }, [loadTodaysEntry])
  );

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );
    if (!loading && todaysEntry) {
        cardScale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.exp) });
        cardOpacity.value = withTiming(1, { duration: 600 });
    }
  }, [loading, todaysEntry]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: glow.value }]
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }]
  }));

  if (loading) {
    return (
      <PlanetaryLoadingAnimation 
        message="Loading your daily insight..."
        submessage="Retrieving your cosmic guidance for today"
        showFloatingStars={true}
      />
    );
  }

  if (!todaysEntry) {
    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0C1427', '#1A2A4D', '#0C1427']} style={StyleSheet.absoluteFill} />
            <View style={[styles.header, { paddingTop: insets.top }]}>
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color="#E0F2FE" />
              </Pressable>
            </View>
            <View style={styles.emptyContainer}>
                <Repeat size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Reading Found</Text>
                <Text style={styles.emptyDescription}>
                    It looks like you haven't done a reading for today.
                </Text>
                <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)')}>
                    <Text style={styles.primaryButtonText}>Draw Today's Card</Text>
                </Pressable>
            </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020817', '#07244A', '#0B1120']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.glow, animatedGlowStyle]} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#E0F2FE" />
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.dateText}>{new Date(todaysEntry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
          <Text style={styles.cardName}>{todaysEntry.card_name}</Text>
          
          <Animated.View style={animatedCardStyle}>
            <BlurView intensity={25} tint="dark" style={styles.questionContainer}>
              <View style={styles.questionInnerContainer}>
                <Text style={styles.questionLabel}>Your question for today</Text>
                <Text style={styles.questionText}>"{todaysEntry.daily_question}"</Text>
              </View>
            </BlurView>
          </Animated.View>

          <View style={styles.guidanceContainer}>
            <Text style={styles.guidanceText}>
              Let this question gently guide your awareness. Notice what arises when you pause and reflect on it during quiet moments.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/(tabs)')}>
          <Home size={20} color="#94A3B8" />
          <Text style={styles.secondaryButtonText}>Home</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/draw')}>
          <BookOpen size={20} color="#F0F9FF" />
          <Text style={styles.primaryButtonText}>New Reading</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020817',
    },
    glow: {
        position: 'absolute',
        width: 800,
        height: 800,
        borderRadius: 400,
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        top: '5%',
        left: '50%',
        transform: [{ translateX: -400 }],
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    loadingText: {
        fontFamily: 'Inter-Medium',
        color: '#94A3B8',
        fontSize: 16,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    backButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 16,
    },
    emptyTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 24,
        color: '#F0F9FF',
    },
    emptyDescription: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#CBD5E1',
        textAlign: 'center',
        maxWidth: 280,
    },
    scrollView: {
        flex: 1,
        paddingTop: 100, // Add top padding to account for header
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 120, // Increased bottom padding to prevent cutoff by bottom actions
        minHeight: '100%',
    },
    contentContainer: {
        justifyContent: 'center',
        paddingVertical: 40,
        minHeight: '80%', // Ensure minimum height but allow expansion
    },
    dateText: {
        fontFamily: 'Inter-Regular',
        color: '#94A3B8',
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 8,
    },
    cardName: {
        fontFamily: 'Inter-Black',
        color: '#F0F9FF',
        textAlign: 'center',
        fontSize: 48,
        letterSpacing: -1,
        marginBottom: 32,
        textShadowColor: 'rgba(56, 189, 248, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    questionContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.2)',
        backgroundColor: 'rgba(14, 27, 56, 0.5)',
        ...Platform.select({
            android: {
                backgroundColor: 'rgba(14, 27, 56, 0.85)',
            }
        })
    },
    questionInnerContainer: {
        padding: 28,
        alignItems: 'center',
    },
    questionLabel: {
        fontFamily: 'Inter-Medium',
        color: '#7DD3FC',
        fontSize: 14,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    questionText: {
        fontSize: 22,
        fontFamily: 'Inter-Bold',
        color: '#E0F2FE',
        textAlign: 'center',
        lineHeight: 30,
        textShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)',
        marginBottom: 8,
        paddingHorizontal: 8,
    },
    guidanceContainer: {
        padding: 24,
        marginTop: 16,
    },
    guidanceText: {
        fontFamily: 'Inter-Regular',
        color: '#CBD5E1',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 24,
        paddingBottom: 48,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
    },
    actionButtonText: {
        fontFamily: 'Inter-SemiBold',
        color: '#E0F2FE',
        fontSize: 16,
        marginLeft: 8,
    },
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: 'rgba(14, 27, 56, 0.9)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(56, 189, 248, 0.2)',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        minWidth: 120,
    },
    secondaryButtonText: {
        fontFamily: 'Inter-SemiBold',
        color: '#94A3B8',
        fontSize: 16,
        marginLeft: 8,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 25,
        borderWidth: 1,
        backgroundColor: '#0EA5E9',
        borderColor: '#38BDF8',
        minWidth: 120,
    },
    primaryButtonText: {
        fontFamily: 'Inter-SemiBold',
        color: '#F0F9FF',
        fontSize: 16,
        marginLeft: 8,
    },
});