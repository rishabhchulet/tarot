import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratingPlacements } from '@/components/GeneratingPlacements';
import { ProfileHeader } from '@/components/ProfileHeader';
import { DailyReflectionCard } from '@/components/DailyReflectionCard';
import { NavCard } from '@/components/NavCard';
import { Users, Star, BookOpen, Sparkles } from 'lucide-react-native';
import { FreeReadingCard } from '@/components/FreeReadingCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CelestialInfo } from '@/components/CelestialInfo';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  if (!user) {
    return <GeneratingPlacements />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingTop: insets.top + 24, 
            paddingBottom: insets.bottom + 32 
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <ProfileHeader />
        </View>

        {/* Daily Reading Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Daily Reading</Text>
            <Text style={styles.sectionSubtitle}>Connect with your inner wisdom</Text>
          </View>
          <DailyReflectionCard />
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore</Text>
            <Text style={styles.sectionSubtitle}>Discover your cosmic blueprint</Text>
          </View>
          <View style={styles.grid}>
            <NavCard 
              title="My Chart"
              subtitle="Your astrology"
              href="/astrology-chart"
              icon={<Star size={24} color="#fbbf24" />}
            />
            <NavCard 
              title="Compatibility"
              subtitle="Cosmic connections"
              href="/compatibility"
              icon={<Users size={24} color="#8b5cf6" />}
            />
          </View>
        </View>

        {/* Freeform Reading Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ask the Universe</Text>
            <Text style={styles.sectionSubtitle}>Get guidance on any question</Text>
          </View>
          <FreeReadingCard />
        </View>

        {/* Celestial Info Section */}
        <View style={styles.lastSection}>
          <CelestialInfo />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerSection: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#f8fafc',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
});