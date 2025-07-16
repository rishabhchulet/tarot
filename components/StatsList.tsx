import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface Stat {
  label: string;
  score: number; // 0-100
  description: string;
}

interface StatsListProps {
  stats: Stat[];
}

export function StatsList({ stats }: StatsListProps) {
  const getBarColor = (score: number) => {
    if (score < 40) return '#ef4444'; // red
    if (score < 70) return '#f59e0b'; // amber
    return '#22c55e'; // green
  };

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.statItem}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>{stat.label}</Text>
            <Text style={styles.score}>{stat.score}</Text>
          </View>
          <View style={styles.barContainer}>
            <View style={[styles.bar, { width: `${stat.score}%`, backgroundColor: getBarColor(stat.score) }]} />
          </View>
          <Text style={styles.description}>{stat.description}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  statItem: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: '#e0e7ff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  score: {
    color: '#f8fafc',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  barContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
  description: {
    color: '#94a3b8',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
}); 