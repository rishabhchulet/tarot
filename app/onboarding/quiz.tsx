import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableOpacity, Dimensions, ScrollView, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Info, FlaskConical, Eye, PenTool, Sparkles, Shuffle, User, Check } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { updateUserProfile } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

const ARCHETYPES = [
  {
    id: 'alchemist',
    name: 'The Alchemist',
    icon: FlaskConical,
    color: '#3b82f6',
    description: 'You walk the path of transformation and depth. Turning challenges into your power.'
  },
  {
    id: 'seer',
    name: 'The Seer',
    icon: Eye,
    color: '#8b5cf6',
    description: 'You navigate with intuition, relying on inner knowing to guide your decisions.'
  },
  {
    id: 'creator',
    name: 'The Creator',
    icon: PenTool,
    color: '#10b981',
    description: 'You are dedicated to creating something enduring, whether a home, a business, or art.'
  },
  {
    id: 'mirror',
    name: 'The Mirror',
    icon: User,
    color: '#ef4444',
    description: 'You have a gift for sensing the emotions and energies of those around you.'
  },
  {
    id: 'trickster',
    name: 'The Trickster',
    icon: Sparkles,
    color: '#f59e0b',
    description: 'You challenge norms with humor and adaptability, pushing others to grow.'
  },
  {
    id: 'shapeshifter',
    name: 'The Shapeshifter',
    icon: Shuffle,
    color: '#6366f1',
    description: 'You move between roles, but may wonder: "Which form is truly me?"'
  },
];

const ARCHETYPE_EXPLANATION =
  'An archetype is a universal personality pattern showing how people tend to think, feel, or act.';

export default function ArchetypeQuiz() {
  const { refreshUser } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1, true
    );
  }, []);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const { error } = await updateUserProfile({ archetype: selected });
      if (error) {
        Alert.alert('Update Failed', "Couldn't save your choice, but you can change it later.",
          [{ text: 'Continue', onPress: () => router.push('/onboarding/about') }]
        );
      } else {
        await refreshUser();
        router.push('/onboarding/about');
      }
    } catch (error) {
      router.push('/onboarding/about');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#0f0f0f', '#1a1a1a']}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.glow, animatedGlowStyle]} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>This app is your mirror.</Text>
          <Text style={styles.subtitle}>
            In your journey, an archetype has arrived to be your guide. Choose the one you feel most drawn to now.
          </Text>
        </View>

        <View style={styles.cardsSection}>
          {ARCHETYPES.map((archetype) => {
            const IconComponent = archetype.icon;
            const isSelected = selected === archetype.id;
            return (
              <Pressable key={archetype.id} onPress={() => setSelected(archetype.id)}>
                <Animated.View style={[styles.archetypeCard, isSelected && styles.selectedCard]}>
                  {isSelected && <View style={[styles.selectedGlow, { backgroundColor: archetype.color }]} />}
                  <View style={styles.cardContent}>
                    <View style={[styles.iconContainer, { backgroundColor: isSelected ? archetype.color : 'rgba(255,255,255,0.05)'}]}>
                      <IconComponent size={32} color={isSelected ? '#FFFFFF' : archetype.color} strokeWidth={2} />
                    </View>
                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>{archetype.name}</Text>
                      <Text style={styles.cardDescription}>{archetype.description}</Text>
                    </View>
                    {isSelected && <View style={styles.checkmark}><Check size={16} color="#FFFFFF" strokeWidth={3} /></View>}
                  </View>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Pressable onPress={handleContinue} disabled={!selected || loading}>
          <LinearGradient
            colors={!selected || loading ? ['#374151', '#4b5563'] : ['#3b82f6', '#8b5cf6']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.continueButton}
          >
            <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Continue'}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  glow: {
    position: 'absolute', top: '5%', left: '50%', width: 400, height: 400,
    backgroundColor: 'rgba(59, 130, 246, 0.15)', borderRadius: 200,
    transform: [{ translateX: -200 }], filter: 'blur(80px)',
  },
  headerSection: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32, alignItems: 'center' },
  mainTitle: { fontSize: 32, fontFamily: 'Inter-Bold', color: '#F9FAFB', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 18, fontFamily: 'Inter-Regular', color: '#D1D5DB', textAlign: 'center', lineHeight: 26, maxWidth: 320 },
  cardsSection: { paddingHorizontal: 20, gap: 16, paddingBottom: 120 },
  archetypeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden',
  },
  selectedCard: { borderColor: 'rgba(255, 255, 255, 0.4)' },
  selectedGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.2, filter: 'blur(40px)',
  },
  cardContent: { flexDirection: 'row', padding: 20, alignItems: 'center' },
  iconContainer: {
    width: 60, height: 60, borderRadius: 15, alignItems: 'center',
    justifyContent: 'center', marginRight: 16, borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  checkmark: {
    position: 'absolute', top: 12, right: 12, width: 24, height: 24,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 20, fontFamily: 'Inter-SemiBold', color: '#FFFFFF', marginBottom: 4 },
  cardDescription: { fontSize: 15, fontFamily: 'Inter-Regular', color: '#9CA3AF', lineHeight: 22 },
  buttonContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueButton: {
    borderRadius: 12, paddingVertical: 18, alignItems: 'center',
    shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  buttonText: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#F9FAFB' },
});