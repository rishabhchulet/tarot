import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { getTodaysEntry } from '@/utils/database';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Calendar } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

export default function HomeScreen() {
  const { user, session } = useAuth();
  const [checkingEntry, setCheckingEntry] = React.useState(true);
  const [hasEntry, setHasEntry] = React.useState(false);
  
  // Animation values
  const sparkleRotation = useSharedValue(0);
  const cardPulse = useSharedValue(1);

  React.useEffect(() => {
    // Start animations
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
    
    cardPulse.value = withRepeat(
      withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  React.useEffect(() => {
    const init = async () => {
      console.log('🏠 Home screen init - checking auth and entry status');
      
      if (!session || !user) {
        console.log('❌ No session/user - redirecting to auth');
        router.replace('/auth');
        return;
      }

      // Check if user has completed onboarding
      if (!user.focusArea) {
        console.log('📚 User needs onboarding - redirecting to quiz');
        router.replace('/onboarding/quiz');
        return;
      }

      try {
        const todayEntry = await getTodaysEntry();
        setHasEntry(!!todayEntry);
        setCheckingEntry(false);

        if (todayEntry) {
          console.log('📖 Today\'s entry exists - user has completed today\'s practice');
          // Don't auto-navigate - let them see they've completed today's practice
        } else {
          console.log('✨ No entry today - ready for daily practice');
        }
      } catch (error) {
        console.error('❌ Error checking today\'s entry:', error);
        setCheckingEntry(false);
      }
    };

    init();
  }, [user, session]);

  const animatedSparkleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${sparkleRotation.value}deg` }],
    };
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardPulse.value }],
    };
  });

  if (checkingEntry) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Checking today's practice...</Text>
        </View>
      </View>
    );
  }

  if (hasEntry) {
    // User has already completed today's practice
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.contentCenter}>
          <View style={styles.completedIconContainer}>
            <Calendar size={60} color="#10B981" strokeWidth={1.5} />
          </View>
          <Text style={styles.completedTitle}>Today's Practice Complete</Text>
          <Text style={styles.completedSubtitle}>
            You've already drawn your card and completed your reflection for today. 
            Return tomorrow for your next inner message.
          </Text>

          <Pressable 
            style={styles.secondaryButton} 
            onPress={() => {
              console.log('📖 Viewing daily question');
              router.push('/daily-question');
            }}
          >
            <View style={styles.secondaryButtonSolid}>
              <Text style={styles.secondaryButtonText}>View Today's Question</Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  // No entry yet – show the card and prompt to begin daily practice
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.contentCenter}>
        {/* Animated card back */}
        <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
          <LinearGradient
            colors={['#F59E0B', '#8B5CF6', '#3B82F6', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBorder}
          >
            <View style={styles.cardInner}>
              <Animated.View style={animatedSparkleStyle}>
                <Sparkles size={40} color="#1e3a8a" strokeWidth={1.5} />
              </Animated.View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.homeTitle}>Your Daily Card Awaits</Text>
        <Text style={styles.homeSubtitle}>
          Take a moment to center yourself, then draw your card to receive today's inner message.
        </Text>

        <Pressable 
          style={styles.primaryButton} 
          onPress={() => {
            console.log('🎴 Starting card draw - going to draw screen');
            router.push('/draw');
          }}
        >
          <View style={styles.primaryButtonSolid}>
            <Text style={styles.primaryButtonText}>Draw Your Card</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  contentCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  
  // Card container styles
  cardContainer: {
    width: 160,
    height: 240,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  cardBorder: {
    flex: 1,
    borderRadius: 16,
    padding: 3,
  },
  cardInner: {
    flex: 1,
    borderRadius: 13,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Completed state styles
  completedIconContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  completedTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
    textAlign: 'center',
  },
  completedSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
  },
  
  // Text styles
  homeTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    textAlign: 'center',
  },
  homeSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  
  // Button styles
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonSolid: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
  },
  
  secondaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  secondaryButtonSolid: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
});