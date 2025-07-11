import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';

export function NorthNodeInsight() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={22} color="#A78BFA" />
        <Text style={styles.title}>Your Soul's Purpose</Text>
      </View>
      <Text style={styles.infoText}>
        Your North Node represents the karmic path your soul is on in this lifetime. 
        Explore your chart to understand this core aspect of your cosmic blueprint.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    marginLeft: 8,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#E5E7EB',
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 22,
  },
}); 