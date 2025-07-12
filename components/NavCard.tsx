import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';

interface NavCardProps {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
}

export function NavCard({ title, subtitle, href, icon }: NavCardProps) {
  return (
    <Pressable style={styles.container} onPress={() => router.push(href)}>
      <View style={styles.card}>
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
          style={styles.cardGradient}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              {icon}
            </View>
            <View style={styles.textContainer}>
              <Text 
                style={styles.title} 
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title}
              </Text>
              <Text 
                style={styles.subtitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {subtitle}
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <ChevronRight size={16} color="#64748b" />
            </View>
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  cardGradient: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#f8fafc',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#64748b',
  },
  arrowContainer: {
    marginLeft: 8,
    flexShrink: 0,
  },
}); 