import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { FlaskConical, Eye, PenTool, User, Sparkles, Shuffle } from 'lucide-react-native';
import { updateUserProfile } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { StarfieldBackground } from '@/components/StarfieldBackground';

const ARCHETYPES = [
  { id: 'alchemist', name: 'The Alchemist', icon: FlaskConical, colors: ['#3b82f6', '#2563eb'], description: 'You walk the path of transformation and depth. Turning challenges into your power.' },
  { id: 'seer', name: 'The Seer', icon: Eye, colors: ['#3B82F6', '#1E3A8A'], description: 'You navigate with intuition, relying on inner knowing to guide your decisions.' },
  { id: 'creator', name: 'The Creator', icon: PenTool, colors: ['#10b981', '#059669'], description: 'You are dedicated to creating something enduring, whether a home, a business, or art.' },
  { id: 'mirror', name: 'The Mirror', icon: User, colors: ['#ef4444', '#dc2626'], description: 'You have a gift for sensing the emotions and energies of those around you.' },
  { id: 'trickster', name: 'The Trickster', icon: Sparkles, colors: ['#f59e0b', '#d97706'], description: 'You challenge norms with humor and adaptability, pushing others to grow.' },
  { id: 'shapeshifter', name: 'The Shapeshifter', icon: Shuffle, colors: ['#3B82F6', '#60A5FA'], description: 'You move between roles, but may wonder: "Which form is truly me?"' },
];

export default function QuizScreen() {
  const { user, refreshUserData } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    if (selected) {
      buttonOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
    }
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
      transform: [{ translateY: (1 - buttonOpacity.value) * 20 }],
    };
  });

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await updateUserProfile({ archetype: selected });
      await refreshUserData(); // Refresh user data to get the new archetype
      router.replace('/onboarding/confirmation');
    } catch (error) {
      Alert.alert('Error', 'Could not save your choice. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StarfieldBackground />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Choose Your Archetype</Text>
        <Text style={styles.subtitle}>Your choice shapes your journey's focus.</Text>

        <View style={styles.cardGrid}>
          {ARCHETYPES.map(item => (
            <Pressable key={item.id} onPress={() => setSelected(item.id)}>
              <LinearGradient
                colors={selected === item.id ? item.colors : ['#1f2937', '#374151']}
                start={{ x: 0, y: 0.1 }} end={{ x: 1, y: 0.9 }}
                style={[styles.card, selected === item.id && styles.selectedCard]}
              >
                <View style={styles.cardContent}>
                  <item.icon size={24} color="#ffffff" />
                  <Text style={styles.cardTitle}>{item.name}</Text>
                </View>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Animated.View style={[styles.buttonContainer, animatedStyle]}>
        <Pressable onPress={handleContinue} disabled={!selected || loading}>
          <LinearGradient
            style={styles.continueButton}
            colors={!selected || loading ? ['#2D2D2F', '#4A4A4A'] : ['#3B82F6', '#60A5FA']}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.buttonText, (!selected || loading) && styles.buttonTextDisabled]}>
                Continue
              </Text>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
  },
  cardGrid: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedCard: {
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#d1d5db',
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 24,
    backgroundColor: 'rgba(3, 7, 18, 0.8)',
    borderTopWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  continueButton: {
    width: '100%',
    padding: 16,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  buttonTextDisabled: {
    color: '#9ca3af',
  },
});