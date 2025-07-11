import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

export function AstrologyDashboard() {
  return (
    <View style={styles.container}>
      <View style={styles.loadingContainer}>
        <TrendingUp size={24} color="#9CA3AF" />
        <Text style={styles.loadingText}>Astrology data is now in your chart.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#9CA3AF',
  },
}); 