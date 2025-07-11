import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratingPlacements } from '@/components/GeneratingPlacements';
import { ProfileHeader } from '@/components/ProfileHeader';
import { DailyReflectionCard } from '@/components/DailyReflectionCard';
import { NavCard } from '@/components/NavCard';
import { Users, Star } from 'lucide-react-native';
import { FreeReadingCard } from '@/components/FreeReadingCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CelestialInfo } from '@/components/CelestialInfo';
import { StarfieldBackground } from '@/components/StarfieldBackground';

export default function HomeScreen() {
  const { user, placements } = useAuth();
  const insets = useSafeAreaInsets();

  if (!placements || !user) {
    return <GeneratingPlacements />;
  }

  return (
    <View style={styles.container}>
      <StarfieldBackground />
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader />

        <View style={styles.section}>
           <Text style={styles.sectionTitle}>YOUR DAILY READING</Text>
           <DailyReflectionCard />
        </View>

        <View style={styles.grid}>
          <NavCard 
            title="My Chart"
            subtitle="Explore your astrology"
            href="/astrology-chart"
            icon={<Star size={24} color="#fde047" />}
          />
          <NavCard 
            title="Compatibility"
            subtitle="See your connections"
            href="/compatibility"
            icon={<Users size={24} color="#60A5FA" />}
          />
        </View>

        <View style={styles.section}>
           <Text style={styles.sectionTitle}>FREEFORM READING</Text>
           <FreeReadingCard />
        </View>

        <View style={styles.section}>
           <CelestialInfo />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#9ca3af',
    letterSpacing: 1.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
});