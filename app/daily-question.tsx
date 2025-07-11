import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ArrowLeft, BookOpen, CheckCircle } from 'lucide-react-native';
import { getTodaysEntry } from '@/utils/database';
import { getCardByName } from '@/data/tarotCards';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withSequence, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StarfieldBackground } from '@/components/StarfieldBackground';

export default function DailyQuestionScreen() {
  const [todaysEntry, setTodaysEntry] = useState<any>(null);
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const loadTodaysEntry = useCallback(async () => {
    setLoading(true);
    try {
      const entry = await getTodaysEntry();
      setTodaysEntry(entry);
      if (entry && entry.card_name) {
        const card = getCardByName(entry.card_name);
        setCardImage(card?.imageUrl || null);
      }
    } catch (error) {
      console.error("❌ Error loading today's entry:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTodaysEntry();
    }, [loadTodaysEntry])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StarfieldBackground />
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#60A5FA" size="large" />
          <Text style={styles.loadingText}>Summoning your daily insight...</Text>
        </View>
      </View>
    );
  }

  if (!todaysEntry) {
    // This part of the UI can be improved later if needed
    return (
        <View style={styles.container}>
            <StarfieldBackground />
            <View style={[styles.header, { paddingTop: insets.top }]}>
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color="#E5E7EB" />
              </Pressable>
            </View>
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Reading Found</Text>
                <Text style={styles.emptyDescription}>
                    You haven't drawn a card today.
                </Text>
                <Pressable style={styles.primaryButton} onPress={() => router.replace('/draw')}>
                    <Text style={styles.primaryButtonText}>Draw Today's Card</Text>
                </Pressable>
            </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StarfieldBackground />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#E5E7EB" />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.dateText}>{new Date(todaysEntry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
        
        {cardImage && (
            <Animated.View entering={FadeIn.duration(1500)}>
                <Image source={{ uri: cardImage }} style={styles.cardImage} resizeMode="contain" />
            </Animated.View>
        )}

        <Text style={styles.cardName}>{todaysEntry.card_name}</Text>
        
        <View style={styles.questionContainer}>
            <Text style={styles.questionLabel}>Your Question for Today</Text>
            <Text style={styles.questionText}>"{todaysEntry.daily_question}"</Text>
        </View>

        <Text style={styles.guidanceText}>
          Let this question gently guide your awareness. Notice what arises when you pause and reflect on it during quiet moments.
        </Text>

        <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={() => router.push('/(tabs)/journal')}>
                <BookOpen size={18} color="#D1D5DB" />
                <Text style={styles.secondaryButtonText}>Go to Journal</Text>
            </Pressable>
            <Pressable style={styles.mainActionButton} onPress={() => router.replace('/(tabs)')}>
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.mainActionButtonText}>Done for Today</Text>
            </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#030712', // Dark blue-gray
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    loadingText: {
        fontFamily: 'Inter-Medium',
        color: '#9CA3AF',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 8,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
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
        color: '#F9FAFB',
    },
    emptyDescription: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#D1D5DB',
        textAlign: 'center',
        maxWidth: 280,
    },
    primaryButton: {
        marginTop: 24,
        backgroundColor: '#3B82F6',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 99,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    primaryButtonText: {
        fontFamily: 'Inter-SemiBold',
        color: '#FFFFFF',
        fontSize: 16,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
      paddingTop: 80, // Space for header
      paddingHorizontal: 24,
      paddingBottom: 40,
      alignItems: 'center',
    },
    dateText: {
        fontFamily: 'Inter-Regular',
        color: '#9CA3AF',
        fontSize: 16,
        marginBottom: 16,
    },
    cardImage: {
      width: 200,
      height: 340,
      borderRadius: 12,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cardName: {
        fontFamily: 'Inter-Bold',
        color: '#F9FAFB',
        fontSize: 32,
        marginBottom: 32,
    },
    questionContainer: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)', // Semi-transparent dark blue
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        marginBottom: 32,
        width: '100%',
    },
    questionLabel: {
        fontFamily: 'Inter-Medium',
        color: '#9CA3AF',
        fontSize: 12,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    questionText: {
        fontFamily: 'Inter-Bold',
        color: '#F9FAFB',
        fontSize: 22,
        lineHeight: 32,
        textAlign: 'center',
    },
    guidanceText: {
        fontFamily: 'Inter-Regular',
        color: '#D1D5DB',
        fontSize: 15,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 40,
        maxWidth: 320,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        width: '100%',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: '#374151',
        gap: 8,
        flex: 1,
    },
    secondaryButtonText: {
        fontFamily: 'Inter-SemiBold',
        color: '#D1D5DB',
        fontSize: 14,
    },
    mainActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 99,
        gap: 10,
        flex: 1,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 5,
    },
    mainActionButtonText: {
        fontFamily: 'Inter-Bold',
        color: '#FFFFFF',
        fontSize: 16,
    },
});