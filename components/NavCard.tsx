import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface NavCardProps {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
}

export function NavCard({ title, subtitle, href, icon }: NavCardProps) {
  return (
    <Pressable style={styles.container} onPress={() => router.push(href)}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.gradientBorder}
      >
        <View style={styles.innerContainer}>
          <View style={styles.iconContainer}>{icon}</View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
  },
  gradientBorder: {
    flex: 1,
    borderRadius: 20,
    padding: 1,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: 'rgba(23, 23, 23, 0.8)', // Semi-transparent background
    borderRadius: 19,
    padding: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#f9fafb',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 2,
  },
}); 