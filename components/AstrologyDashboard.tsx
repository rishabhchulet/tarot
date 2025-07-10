import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sun, Moon, Sunrise } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

const AstrologyItem = ({ icon, label, sign }) => (
  <View style={styles.itemContainer}>
    <View style={styles.iconContainer}>{icon}</View>
    <View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sign}>{sign || '...'}</Text>
    </View>
  </View>
);

export function AstrologyDashboard() {
  const { placements } = useAuth();

  return (
    <View style={styles.container}>
      <AstrologyItem
        icon={<Sun size={28} color="#FBBF24" />}
        label="Sun"
        sign={placements?.sun?.sign}
      />
      <AstrologyItem
        icon={<Moon size={28} color="#A78BFA" />}
        label="Moon"
        sign={placements?.moon?.sign}
      />
      <AstrologyItem
        icon={<Sunrise size={28} color="#F87171" />}
        label="Rising"
        sign={placements?.rising?.sign}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    marginHorizontal: 24,
    marginTop: 24,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#A1A1AA',
  },
  sign: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
  },
}); 