import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratingPlacements } from '@/components/GeneratingPlacements';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PLANET_ORDER = [
  'Sun', 'Moon', 'Rising', 'North Node', 'Mercury', 'Venus', 'Mars', 
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 
  'Midheaven', 'Chiron', 'Lilith'
];

// Map API keys to display names and symbols
const PLACEMENT_CONFIG: { [key: string]: { name: string; symbol: string } } = {
  sun: { name: 'Sun', symbol: '☉' },
  moon: { name: 'Moon', symbol: '☽' },
  rising: { name: 'Rising', symbol: '↗' },
  northNode: { name: 'North Node', symbol: '☊' },
  mercury: { name: 'Mercury', symbol: '☿' },
  venus: { name: 'Venus', symbol: '♀' },
  mars: { name: 'Mars', symbol: '♂' },
  jupiter: { name: 'Jupiter', symbol: '♃' },
  saturn: { name: 'Saturn', symbol: '♄' },
  uranus: { name: 'Uranus', symbol: '♅' },
  neptune: { name: 'Neptune', symbol: '♆' },
  pluto: { name: 'Pluto', symbol: '♇' },
  midheaven: { name: 'Midheaven', symbol: 'MC' },
  chiron: { name: 'Chiron', symbol: '⚷' },
  lilith: { name: 'Lilith', symbol: '⚸' },
};


export default function AstrologyChartScreen() {
  const { placements } = useAuth();
  const insets = useSafeAreaInsets();

  if (!placements) {
    return <GeneratingPlacements message="Reading your cosmic blueprint..." />;
  }
  
  const renderPlacement = (key: string) => {
    const config = PLACEMENT_CONFIG[key];
    // @ts-ignore
    const data = placements[key] || (placements.planets && placements.planets[key]);
    
    if (!config || !data) return null;

    return (
      <View key={key} style={styles.itemContainer}>
        <Text style={styles.planet}>{config.symbol} {config.name}</Text>
        <Text style={styles.details}>{data.sign} • {data.house} House • {data.degree.toFixed(0)}°</Text>
      </View>
    );
  };
  
  const orderedKeys = PLANET_ORDER.map(name => 
    Object.keys(PLACEMENT_CONFIG).find(key => PLACEMENT_CONFIG[key].name === name)
  ).filter(Boolean) as string[];

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
        <View style={styles.listContainer}>
          {orderedKeys.map(key => renderPlacement(key))}
        </View>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>About Your North Node</Text>
          <Text style={styles.infoText}>
            Your North Node placement reveals your soul's purpose and the life lessons you are here to learn. It's the path of growth and fulfillment.
          </Text>
        </View>
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
  listContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  planet: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#e2e8f0',
  },
  details: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#94a3b8',
  },
  infoBox: {
    marginTop: 24,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  infoTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#facc15',
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#fefce8',
    lineHeight: 22,
  }
}); 