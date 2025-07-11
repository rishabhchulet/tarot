import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat, withSequence } from 'react-native-reanimated';
import { Sparkles, ArrowRight, MessageCircle, BookOpen } from 'lucide-react-native';
import { getTodaysEntry } from '@/utils/database';

export function DailyReflectionCard() {
  const [todaysEntry, setTodaysEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasDrawnToday, setHasDrawnToday] = useState(false);
  
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const loadTodaysEntry = useCallback(async () => {
    setLoading(true);
    try {
      const entry = await getTodaysEntry();
      setTodaysEntry(entry);
      setHasDrawnToday(!!entry);
    } catch (error) {
      console.error('❌ Error loading today\'s entry:', error);
      setHasDrawnToday(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTodaysEntry();
    }, [loadTodaysEntry])
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    if (hasDrawnToday) {
      // User has drawn today, go to their daily question
      router.push('/daily-question');
    } else {
      // User hasn't drawn today, start the draw flow
      router.push('/draw-prompt');
    }
  };

  if (loading) {
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#FFFFFF" size="small" />
          <Text style={styles.loadingText}>Checking your reading...</Text>
        </View>
      </Animated.View>
    );
  }

  if (hasDrawnToday && todaysEntry?.daily_question) {
    // Show the daily question for returning users
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <Pressable onPress={handlePress}>
          <LinearGradient
            colors={['#16a34a', '#15803d']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.iconContainer}>
              <MessageCircle size={28} color="#FFFFFF" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Your Reflection for Today</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                "{todaysEntry.daily_question}"
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <ArrowRight size={24} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  if (hasDrawnToday && !todaysEntry?.daily_question) {
    // User has drawn today but no daily question saved yet
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <Pressable onPress={handlePress}>
          <LinearGradient
            colors={['#f59e0b', '#d97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.iconContainer}>
              <BookOpen size={28} color="#FFFFFF" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Reading Complete</Text>
              <Text style={styles.subtitle}>View your reflection for today</Text>
            </View>
            <View style={styles.arrowContainer}>
              <ArrowRight size={24} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  // Default: User hasn't drawn today, show the draw prompt
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable onPress={handlePress}>
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.iconContainer}>
            <Sparkles size={28} color="#FFFFFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Your Daily Reading is Ready</Text>
            <Text style={styles.subtitle}>Tap here to draw your card.</Text>
          </View>
          <View style={styles.arrowContainer}>
            <ArrowRight size={24} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(123, 121, 136, 0.3)',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  iconContainer: {
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 999,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  arrowContainer: {
    marginLeft: 16,
  },
}); 