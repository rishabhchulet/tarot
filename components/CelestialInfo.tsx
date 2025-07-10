import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Waves } from 'lucide-react-native';

export function CelestialInfo() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Today's Moon</Text>
      <Text style={styles.value}>Waning Gibbous</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#F9FAFB',
  },
}); 