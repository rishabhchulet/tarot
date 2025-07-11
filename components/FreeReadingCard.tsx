import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Layers3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function FreeReadingCard() {
  const handlePress = () => {
    // This can be updated later to go to a specific freeform reading screen
    router.push('/draw');
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.gradientBorder}
      >
        <View style={styles.innerContainer}>
          <Layers3 size={24} color="#60A5FA" />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Free Form Reading</Text>
            <Text style={styles.subtitle}>Ask a question and pull cards for insight.</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
  },
  gradientBorder: {
    borderRadius: 20,
    padding: 1,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 23, 23, 0.8)',
    borderRadius: 19,
    padding: 20,
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#f9fafb',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 2,
  },
}); 