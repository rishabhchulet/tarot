import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratingPlacements } from '@/components/GeneratingPlacements';
import { ProfileHeader } from '@/components/ProfileHeader';
import { DailyReflectionCard } from '@/components/DailyReflectionCard';
import { NavCard } from '@/components/NavCard';
import { BookOpen, Users, Star } from 'lucide-react-native';
import { FreeReadingCard } from '@/components/FreeReadingCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CelestialInfo } from '@/components/CelestialInfo';

export default function HomeScreen() {
  const { user, placements } = useAuth();
  const insets = useSafeAreaInsets();

  if (!placements || !user) {
    return <GeneratingPlacements />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <LinearGradient
        colors={['#0a0a0a', '#171717', '#0a0a0a']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader />

        {/* Your Reading Section */}
        <View style={styles.section}>
           <Text style={styles.sectionTitle}>Your Reading</Text>
           <DailyReflectionCard />
        </View>

        {/* Navigation Grid */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <NavCard 
              title="My Chart"
              subtitle="Explore your astrology"
              href="/astrology-chart"
              icon={<Star size={24} color="#fde047" />}
            />
          </View>
          <View style={styles.gridItem}>
            <NavCard 
              title="Compatibility"
              subtitle="See your connections"
              href="/compatibility"
              icon={<Users size={24} color="#6366f1" />}
            />
          </View>
        </View>

        {/* Freeform Reading */}
        <View style={styles.section}>
           <Text style={styles.sectionTitle}>Freeform Reading</Text>
           <FreeReadingCard />
        </View>

        {/* Today's Moon */}
        <View style={styles.section}>
          <CelestialInfo />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#a1a1aa',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4, // Counteract item padding
    marginBottom: 8, // Adjust as needed
  },
  gridItem: {
    flex: 1,
    paddingHorizontal: 4, // Gutter between cards
  },
});