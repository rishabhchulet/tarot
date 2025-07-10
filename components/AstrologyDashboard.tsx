import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sun, Moon, Sunrise, TrendingUp } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getSignEmoji } from '@/utils/astrology';

const AstrologyItem = ({ icon, label, sign, emoji }) => (
  <View style={styles.itemContainer}>
    <View style={styles.iconContainer}>
      {icon}
      <Text style={styles.signEmoji}>{emoji}</Text>
    </View>
    <View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sign}>{sign || '...'}</Text>
    </View>
  </View>
);

export function AstrologyDashboard() {
  const { placements } = useAuth();

  if (!placements) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <TrendingUp size={24} color="#9CA3AF" />
          <Text style={styles.loadingText}>Calculating your cosmic blueprint...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AstrologyItem
        icon={<Sun size={28} color="#FBBF24" />}
        label="Sun"
        sign={placements?.sun?.sign}
        emoji={getSignEmoji(placements?.sun?.sign || '')}
      />
      <AstrologyItem
        icon={<Moon size={28} color="#A78BFA" />}
        label="Moon"
        sign={placements?.moon?.sign}
        emoji={getSignEmoji(placements?.moon?.sign || '')}
      />
      <AstrologyItem
        icon={<Sunrise size={28} color="#F87171" />}
        label="Rising"
        sign={placements?.rising?.sign}
        emoji={getSignEmoji(placements?.rising?.sign || '')}
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
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    position: 'relative',
  },
  signEmoji: {
    fontSize: 12,
    position: 'absolute',
    bottom: -8,
    right: -4,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
}); 