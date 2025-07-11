import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function AstrologyCharts() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>
        Detailed charts and insights are coming soon.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  placeholderText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});