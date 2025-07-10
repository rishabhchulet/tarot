import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { ArrowLeft, BookOpen, Repeat, Chrome as Home } from 'lucide-react-native';
import { getTodaysEntry } from '@/utils/database';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';

export default function DailyQuestionScreen() {
  const [todaysEntry, setTodaysEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const glow = useSharedValue(0);

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
            withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.5, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ), -1, true
    )
  }, []);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0a0a0a', '#171717', '#0a0a0a']} style={StyleSheet.absoluteFill} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#A78BFA" size="large" />
          <Text style={styles.loadingText}>Loading your daily insight...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!todaysEntry) {
    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#0a0a0a', '#171717', '#0a0a0a']} style={StyleSheet.absoluteFill} />
            <View style={styles.header}>
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color="#F3F4F6" />
              </Pressable>
            </View>
            <View style={styles.emptyContainer}>
                <Repeat size={48} color="#6B7280" />
                <Text style={styles.emptyTitle}>No Reading Found</Text>
                <Text style={styles.emptyDescription}>
                    It looks like you haven't done a reading today.
                </Text>
                <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)')}>
                    <Text style={styles.primaryButtonText}>Draw Today's Card</Text>
                </Pressable>
            </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#171717', '#0a0a0a']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.glow, animatedGlowStyle]} />
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#F3F4F6" />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.dateText}>{new Date(todaysEntry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
        <Text style={styles.cardName}>{todaysEntry.card_name}</Text>
        
        <View style={styles.questionContainer}>
            <Text style={styles.questionLabel}>Your question for today</Text>
            <Text style={styles.questionText}>"{todaysEntry.daily_question}"</Text>
        </View>

        <View style={styles.guidanceContainer}>
          <Text style={styles.guidanceText}>
            Let this question gently guide your awareness. Notice what arises when you pause and reflect on it during quiet moments.
          </Text>
        </View>

        <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={() => router.push('/(tabs)/journal')}>
                <BookOpen size={20} color="#F9FAFB" />
                <Text style={styles.actionButtonText}>Go to Journal</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.homeButton]} onPress={() => router.replace('/(tabs)')}>
                <Home size={20} color="#F9FAFB" />
                <Text style={styles.actionButtonText}>Done for Today</Text>
            </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    glow: {
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: 300,
        backgroundColor: 'rgba(167, 139, 250, 0.15)',
        top: '10%',
        left: '50%',
        transform: [{ translateX: -300 }],
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    loadingText: {
        fontFamily: 'Inter-Medium',
        color: '#A1A1AA',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
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
        color: '#E4E4E7',
    },
    emptyDescription: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#A1A1AA',
        textAlign: 'center',
        maxWidth: 280,
    },
    primaryButton: {
        marginTop: 24,
        backgroundColor: '#8B5CF6',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 99,
    },
    primaryButtonText: {
        fontFamily: 'Inter-SemiBold',
        color: '#F9FAFB',
        fontSize: 16,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
    },
    dateText: {
        fontFamily: 'Inter-Regular',
        color: '#A1A1AA',
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 8,
    },
    cardName: {
        fontFamily: 'Inter-Bold',
        color: '#F9FAFB',
        textAlign: 'center',
        fontSize: 32,
        marginBottom: 32,
    },
    questionContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    questionLabel: {
        fontFamily: 'Inter-Medium',
        color: '#A1A1AA',
        fontSize: 14,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    questionText: {
        fontFamily: 'Inter-Bold',
        color: '#F9FAFB',
        fontSize: 22,
        lineHeight: 32,
        textAlign: 'center',
    },
    guidanceContainer: {
        padding: 24,
        marginTop: 16,
    },
    guidanceText: {
        fontFamily: 'Inter-Regular',
        color: '#A1A1AA',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 24,
        paddingBottom: 40,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 99,
        gap: 8,
    },
    homeButton: {
        backgroundColor: '#8B5CF6',
    },
    actionButtonText: {
        fontFamily: 'Inter-SemiBold',
        color: '#F9FAFB',
        fontSize: 14,
    },
});