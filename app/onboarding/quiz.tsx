import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { FlaskConical, Eye, PenTool, User, Sparkles, Shuffle } from 'lucide-react-native';
import { updateUserProfile } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';

const ARCHETYPES = [
  { id: 'alchemist', name: 'The Alchemist', icon: FlaskConical, colors: ['#3b82f6', '#2563eb'], description: 'You walk the path of transformation and depth. Turning challenges into your power.' },
  { id: 'seer', name: 'The Seer', icon: Eye, colors: ['#8b5cf6', '#7c3aed'], description: 'You navigate with intuition, relying on inner knowing to guide your decisions.' },
  { id: 'creator', name: 'The Creator', icon: PenTool, colors: ['#10b981', '#059669'], description: 'You are dedicated to creating something enduring, whether a home, a business, or art.' },
  { id: 'mirror', name: 'The Mirror', icon: User, colors: ['#ef4444', '#dc2626'], description: 'You have a gift for sensing the emotions and energies of those around you.' },
  { id: 'trickster', name: 'The Trickster', icon: Sparkles, colors: ['#f59e0b', '#d97706'], description: 'You challenge norms with humor and adaptability, pushing others to grow.' },
  { id: 'shapeshifter', name: 'The Shapeshifter', icon: Shuffle, colors: ['#6366f1', '#4f46e5'], description: 'You move between roles, but may wonder: "Which form is truly me?"' },
];

export default function ArchetypeQuiz() {
  const { refreshUser } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const { error } = await updateUserProfile({ archetype: selected });
      if (error) {
        Alert.alert('Update Failed', "Couldn't save your choice, but you can change it later.",
          [{ text: 'OK', onPress: () => router.push('/onboarding/about') }]
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
      <LinearGradient colors={['#111111', '#0a0a0a']} style={StyleSheet.absoluteFill} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
              <Pressable key={archetype.id} onPress={() => setSelected(archetype.id)} style={[styles.archetypeCard, isSelected && styles.selectedCard]}>
                <View style={styles.cardContent}>
                  <LinearGradient colors={archetype.colors} style={styles.iconContainer}>
                    <IconComponent size={28} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{archetype.name}</Text>
                    <Text style={styles.cardDescription}>{archetype.description}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Pressable onPress={handleContinue} disabled={!selected || loading}>
          <LinearGradient
            colors={!selected || loading ? ['#2D2D2F', '#4A4A4A'] : ['#3b82f6', '#8b5cf6']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.continueButton}
          >
            <Text style={[styles.buttonText, (!selected || loading) && styles.buttonTextDisabled]}>
              {loading ? 'Saving...' : 'Continue'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollContent: { paddingBottom: 140 },
  headerSection: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32, alignItems: 'center' },
  mainTitle: { fontSize: 28, fontFamily: 'Inter-Bold', color: '#F9FAFB', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 16, fontFamily: 'Inter-Regular', color: '#A1A1AA', textAlign: 'center', lineHeight: 24, maxWidth: 340 },
  cardsSection: { paddingHorizontal: 16, gap: 12 },
  archetypeCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedCard: {
    borderColor: '#8b5cf6',
    backgroundColor: '#110F18',
  },
  cardContent: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontFamily: 'Inter-SemiBold', color: '#FFFFFF', marginBottom: 4 },
  cardDescription: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#A1A1AA', lineHeight: 20 },
  buttonContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20,
    backgroundColor: 'transparent',
  },
  continueButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { fontSize: 17, fontFamily: 'Inter-Bold', color: '#FFFFFF' },
  buttonTextDisabled: { color: '#666' },
});