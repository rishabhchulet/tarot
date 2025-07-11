import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export function ProfileHeader() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{getGreeting()},</Text>
      <Text style={styles.userName}>{user?.name || 'Explorer'}</Text>
      {user?.archetype && (
        <View style={styles.archetypeBadge}>
          <LinearGradient
            colors={['rgba(167, 139, 250, 0.2)', 'rgba(129, 140, 248, 0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.badgeGradient}
          >
            <Text style={styles.archetypeText}>{user.archetype}</Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    alignItems: 'center',
  },
  greeting: {
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    color: '#d1d5db',
  },
  userName: {
    fontFamily: 'CormorantGaramond-Bold',
    fontSize: 48,
    color: '#f9fafb',
    lineHeight: 56,
  },
  archetypeBadge: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  badgeGradient: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  archetypeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#ede9fe',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
}); 