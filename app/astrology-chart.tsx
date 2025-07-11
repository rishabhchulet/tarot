import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratingPlacements } from '@/components/GeneratingPlacements';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AstrologyChart from '@/components/AstrologyChart'; // Default import
import { NorthNodeInsight } from '@/components/NorthNodeInsight';
import { getPlanetaryPositionsNew, PlanetPosition } from '@/utils/astrology';

export default function AstrologyChartScreen() {
  const { user } = useAuth(); // Changed from placements to user
  const insets = useSafeAreaInsets();
  const [positions, setPositions] = useState<PlanetPosition[] | null>(null);

  useEffect(() => {
    if (user && user.birthDate && user.birthTime) {
      const fetchPositions = async () => {
        try {
          const [year, month, day] = user.birthDate.split('-').map(Number);
          const [hour, minute, second] = user.birthTime.split(':').map(Number);
          
          const calculatedPositions = await getPlanetaryPositionsNew(
            year,
            month,
            day,
            hour,
            minute,
            second || 0
          );
          setPositions(calculatedPositions);
        } catch (error) {
          console.error("Failed to calculate planetary positions:", error);
          // Handle error appropriately
        }
      };

      fetchPositions();
    }
  }, [user]);

  if (!positions) {
    return <GeneratingPlacements message="Reading your cosmic blueprint..." />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="#f8fafc" />
        </Pressable>
        <Text style={styles.title}>Your Cosmic Blueprint</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AstrologyChart positions={positions} />
        <NorthNodeInsight />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
  },
}); 