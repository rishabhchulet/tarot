import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

const DetailItem = ({ planet, sign, house }) => (
  <View style={styles.itemContainer}>
    <Text style={styles.planet}>{planet}</Text>
    <Text style={styles.details}>{`${sign} in House ${house}`}</Text>
  </View>
);

export function AstrologyDeepDive() {
  const { placements } = useAuth();

  if (!placements) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Cosmic Blueprint</Text>
        <Text style={styles.loadingText}>Calculating placements...</Text>
      </View>
    );
  }

  const planetOrder = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cosmic Blueprint</Text>
      <View style={styles.listContainer}>
        <DetailItem planet="Sun" sign={placements.sun.sign} house={placements.sun.house} />
        <DetailItem planet="Moon" sign={placements.moon.sign} house={placements.moon.house} />
        <DetailItem planet="Rising" sign={placements.rising.sign} house={placements.rising.house} />
        <DetailItem planet="North Node" sign={placements.northNode.sign} house={placements.northNode.house} />
        {planetOrder.map((p) => (
          <DetailItem
            key={p}
            planet={p}
            sign={placements.planets[p]?.sign}
            house={placements.planets[p]?.house}
          />
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
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#F9FAFB',
    marginBottom: 16,
    textAlign: 'center',
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
  },
  details: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#A1A1AA',
  },
}); 