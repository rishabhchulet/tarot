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
                numberOfLines={2}
                adjustsFontSizeToFit={false}
              >
                {title}
              </Text>
              <Text 
                style={styles.subtitle}
                numberOfLines={2}
                adjustsFontSizeToFit={false}
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
    minWidth: 150, // Increased minimum width for better text display
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    minHeight: 90, // Increased height to accommodate better text
  },
  cardGradient: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    marginRight: 10,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16, // Increased from 15px for better readability
    color: '#f8fafc',
    marginBottom: 4,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14, // Increased from 12px for better readability
    color: '#94a3b8', // Improved color contrast from #64748b
    lineHeight: 18,
  },
  arrowContainer: {
    flexShrink: 0,
  },
}); 