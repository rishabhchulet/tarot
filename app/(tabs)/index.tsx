import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { getTodaysEntry } from '@/utils/database';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles } from 'lucide-react-native';

export default function HomeScreen() {
  const { user, session } = useAuth();
  const [checkingEntry, setCheckingEntry] = React.useState(true);
  const [hasEntry, setHasEntry] = React.useState(false);

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
          console.log('📖 Today\'s entry exists - going to daily question');
          router.replace('/daily-question');
        } else {
          console.log('✨ No entry today - showing home screen to start daily practice');
        }
      } catch (error) {
        console.error('❌ Error checking today\'s entry:', error);
        setCheckingEntry(false);
      }
    };

    init();
  }, [user, session]);

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

  // No entry yet – prompt user to begin daily ritual (breathing → draw)
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a', '#0f1419']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.contentCenter}>
        <View style={styles.iconContainer}>
          <Sparkles size={80} color="#1e3a8a" strokeWidth={1.5} />
        </View>
        <Text style={styles.homeTitle}>Ready for Today's Reflection?</Text>
        <Text style={styles.homeSubtitle}>
          Start with a centering breath, then draw your daily card.
        </Text>

        <Pressable 
          style={styles.primaryButton} 
          onPress={() => {
            console.log('🫁 Starting daily ritual - going to breathing');
            router.push('/breathing');
          }}
        >
          <View style={styles.primaryButtonSolid}>
            <Text style={styles.primaryButtonText}>Begin</Text>
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
  iconContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.15)',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
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
    maxWidth: 260,
    lineHeight: 24,
  },
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
});