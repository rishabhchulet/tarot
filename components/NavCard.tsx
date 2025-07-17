import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';

interface NavCardProps {
  title: string;
  subtitle: string;
  href: string;
  icon?: React.ReactNode; // Make icon optional
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
            {icon && (
              <View style={styles.iconContainer}>
                {icon}
              </View>
            )}
            <View style={[styles.textContainer, !icon && styles.textContainerFullWidth]}>
              <Text 
                style={styles.title}
                numberOfLines={1}
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
    minWidth: 160, // Reduced from 180 to allow better spacing
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    minHeight: 85, // Slightly reduced height
  },
  cardGradient: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  textContainerFullWidth: {
    marginRight: 12, // More space when no icon
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16, // Slightly larger since we have more space
    color: '#f8fafc',
    marginBottom: 4,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 18,
  },
  arrowContainer: {
    flexShrink: 0,
  },
}); 