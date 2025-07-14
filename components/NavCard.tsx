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
                adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
              >
                {title}
              </Text>
              <Text 
                style={styles.subtitle}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.7}
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
    minWidth: 140, // Ensure minimum width for text
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    height: 80, // Fixed height to prevent variable sizing
  },
  cardGradient: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14, // Slightly reduced padding
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36, // Slightly smaller icon container
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10, // Reduced margin
    flexShrink: 0, // Prevent shrinking
  },
  textContainer: {
    flex: 1,
    minWidth: 0, // Allow text to shrink properly
    marginRight: 8, // Add margin before arrow
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15, // Slightly smaller font
    color: '#f8fafc',
    marginBottom: 2,
    lineHeight: 18,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 12, // Slightly smaller font
    color: '#64748b',
    lineHeight: 14,
  },
  arrowContainer: {
    flexShrink: 0, // Prevent shrinking
  },
}); 