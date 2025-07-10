import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BarChart3, PieChart } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { AstrologyCharts } from './AstrologyCharts';

export function AstrologyDeepDive() {
  const { placements } = useAuth();
  const [showCharts, setShowCharts] = React.useState(false);

  if (!placements) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Cosmic Blueprint</Text>
        <Text style={styles.loadingText}>Calculating placements...</Text>
      </View>
    );
  }

  if (showCharts) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Astrological Charts</Text>
          <Pressable 
            style={styles.toggleButton} 
            onPress={() => setShowCharts(false)}
          >
            <Text style={styles.toggleButtonText}>Show List View</Text>
          </Pressable>
        </View>
        <AstrologyCharts placements={placements} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Cosmic Blueprint</Text>
        <Pressable 
          style={styles.toggleButton} 
          onPress={() => setShowCharts(true)}
        >
          <BarChart3 size={16} color="#F9FAFB" />
          <Text style={styles.toggleButtonText}>View Charts</Text>
        </Pressable>
      </View>
      <View style={styles.listContainer}>
        <View style={styles.itemContainer}>
          <Text style={styles.planet}>☉ Sun</Text>
          <Text style={styles.details}>{placements.sun.sign} • {placements.sun.house} House • {placements.sun.degree.toFixed(0)}°</Text>
        </View>
        <View style={styles.itemContainer}>
          <Text style={styles.planet}>☽ Moon</Text>
          <Text style={styles.details}>{placements.moon.sign} • {placements.moon.house} House • {placements.moon.degree.toFixed(0)}°</Text>
        </View>
        <View style={styles.itemContainer}>
          <Text style={styles.planet}>↗ Rising</Text>
          <Text style={styles.details}>{placements.rising.sign} • {placements.rising.house} House • {placements.rising.degree.toFixed(0)}°</Text>
        </View>
        <View style={styles.itemContainer}>
          <Text style={styles.planet}>☊ North Node</Text>
          <Text style={styles.details}>{placements.northNode.sign} • {placements.northNode.house} House • {placements.northNode.degree.toFixed(0)}°</Text>
        </View>
        {Object.entries(placements.planets).map(([planet, placement]) => (
          <View key={planet} style={styles.itemContainer}>
            <Text style={styles.planet}>⚹ {planet}</Text>
            <Text style={styles.details}>{placement.sign} • {placement.house} House • {placement.degree.toFixed(0)}°</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#F9FAFB',
    flex: 1,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  toggleButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#F9FAFB',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    paddingVertical: 40,
  },
  listContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  planet: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#E4E4E7',
    minWidth: 120,
  },
  details: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#A1A1AA',
    flex: 1,
    textAlign: 'right',
  },
}); 