import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Layers } from 'lucide-react-native';

export function FreeReadingCard() {
  const handlePress = () => {
    // This will eventually navigate to a different card drawing flow
    // For now, it can point to the same one
    router.push('/draw-prompt');
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View style={styles.iconContainer}>
        <Layers size={24} color="#A78BFA" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Free Form Reading</Text>
        <Text style={styles.subtitle}>Ask a question and pull cards for insight.</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#E4E4E7',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginTop: 2,
  },
}); 