import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronRight, Sparkles } from 'lucide-react-native';

interface NavCardProps {
  title: string;
  subtitle: string;
  href: string;
  icon?: React.ReactNode;
}

export function NavCard({ title, subtitle, href, icon }: NavCardProps) {
  return (
    <Pressable onPress={() => router.push(href)} style={styles.pressable}>
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {icon || <Sparkles size={24} color="#facc15" />}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <ChevronRight size={24} color="#94a3b8" />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  gradient: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 999,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
}); 