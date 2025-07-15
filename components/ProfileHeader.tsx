import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { getArchetypeInfo } from '@/data/archetypes';

export function ProfileHeader() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const archetypeInfo = getArchetypeInfo(user?.archetype);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
          style={styles.cardGradient}
        >
          <View style={styles.content}>
            <View style={styles.textContainer}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              
              {/* Enhanced name display with archetype icon */}
              <View style={styles.nameContainer}>
                {archetypeInfo && (
                  <Text style={[styles.archetypeIcon, { color: archetypeInfo.color }]}>
                    {archetypeInfo.icon}
                  </Text>
                )}
                <Text style={styles.userName}>{user?.name || 'Explorer'}</Text>
              </View>
              
              {user?.archetype && archetypeInfo && (
                <View style={[styles.archetypeContainer, { borderColor: `${archetypeInfo.color}40` }]}>
                  <View style={[styles.archetypeIconSmall, { backgroundColor: `${archetypeInfo.color}20` }]}>
                    <Text style={[styles.archetypeIconText, { color: archetypeInfo.color }]}>
                      {archetypeInfo.icon}
                    </Text>
                  </View>
                  <Text style={[styles.archetypeText, { color: archetypeInfo.color }]}>
                    {user.archetype}
                  </Text>
                  <Text style={styles.archetypeElement}>
                    {archetypeInfo.element}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  cardGradient: {
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  greeting: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  archetypeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#f8fafc',
    textAlign: 'center',
    lineHeight: 34,
  },
  archetypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 8,
  },
  archetypeIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archetypeIconText: {
    fontSize: 12,
  },
  archetypeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  archetypeElement: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
}); 