import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfileHeader } from '@/components/ProfileHeader';
import { DailyReflectionCard } from '@/components/DailyReflectionCard';
import { AstrologyDashboard } from '@/components/AstrologyDashboard';
import { NorthNodeInsight } from '@/components/NorthNodeInsight';
import { CelestialInfo } from '@/components/CelestialInfo';
import { FreeReadingCard } from '@/components/FreeReadingCard';
import { AstrologyDeepDive } from '@/components/AstrologyDeepDive';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratingPlacements } from '@/components/GeneratingPlacements';

export default function HomeScreen() {
  const { placements } = useAuth();

  if (!placements) {
    return <GeneratingPlacements />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#0a0a0a', '#171717', '#0a0a0a']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProfileHeader />
        <DailyReflectionCard />
        <AstrologyDashboard />
        <NorthNodeInsight />
        <CelestialInfo />
        <FreeReadingCard />
        <AstrologyDeepDive />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    paddingBottom: 40,
  },
});