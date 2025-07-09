import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { getTodaysEntry } from '@/utils/database';
import { Sparkles } from 'lucide-react-native';

export default function HomeScreen() {
  const { user, session } = useAuth();

  const [checkingEntry, setCheckingEntry] = React.useState(true);
  const [hasEntry, setHasEntry] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      if (!session || !user) {
        // Not authenticated – send to auth
        router.replace('/auth');
        return;
      }

      const todayEntry = await getTodaysEntry();
      setHasEntry(!!todayEntry);
      setCheckingEntry(false);

      if (todayEntry) {
        // Already drew card – go to daily question
        router.replace('/daily-question');
      }
    };

    init();
  }, [user, session]);

  if (checkingEntry) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
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
        <Sparkles size={80} color="#1e3a8a" strokeWidth={1.5} />
        <Text style={styles.homeTitle}>Ready for Today's Reflection?</Text>
        <Text style={styles.homeSubtitle}>
          Start with a centering breath, then draw your daily card.
        </Text>

        <Pressable style={styles.primaryButton} onPress={() => router.replace('/breathing')}>
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
  contentCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
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
  
  // Animated icon section - very subtle dark blue
  iconSection: {
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
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
  
  // Clean title
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  
  // Simple subtitle
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  
  // Single shade dark button section
  buttonSection: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButtonSolid: {
    backgroundColor: '#374151', // Single dark shade
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
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  linkHighlight: {
    color: '#1e3a8a', // Subtle dark blue accent
    fontFamily: 'Inter-Medium',
  },
  
  // Sign out verification styles
  signOutSuccess: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 8,
    zIndex: 10,
  },
  signOutSuccessText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
  signOutError: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    zIndex: 10,
  },
  signOutErrorText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginBottom: 4,
  },
});