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
    minWidth: 150, // Optimized for better spacing
    marginHorizontal: 4, // Add slight margin for separation
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)', // Slightly more visible border
    backgroundColor: 'rgba(255,255,255,0.05)', // Slightly more visible background
    minHeight: 90, // Increased for better touch target and content fit
    shadowColor: 'rgba(255,255,255,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardGradient: {
    flex: 1,
    paddingVertical: 18, // Increased padding for better spacing
    paddingHorizontal: 18, // Increased padding for better spacing
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between', // Better distribution of content
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
    marginRight: 12, // Consistent spacing
    justifyContent: 'center', // Center text vertically
  },
  textContainerFullWidth: {
    marginRight: 16, // More space when no icon
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15, // Optimized for mobile readability
    color: '#f8fafc',
    marginBottom: 6, // Increased spacing between title and subtitle
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