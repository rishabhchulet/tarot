import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, interpolate } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Enhanced Design Tokens
export const designTokens = {
  colors: {
    // Midnight Mysticism Palette
    background: {
      primary: '#0F172A',
      secondary: '#1E293B',
      tertiary: '#312E81',
      quaternary: '#1F2937',
    },
    accent: {
      blue: '#3B82F6',
      brightBlue: '#60A5FA',
      purple: '#8B5CF6',
      lavender: '#A78BFA',
      gold: '#F59E0B',
      emerald: '#10B981',
      rose: '#F43F5E',
      amber: '#F59E0B',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#F1F5F9',
      muted: '#CBD5E1',
      accent: '#60A5FA',
      disabled: '#64748B',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      backgroundStrong: 'rgba(255, 255, 255, 0.15)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.3)',
      overlay: 'rgba(0, 0, 0, 0.4)',
    },
    gradients: {
      mystical: ['#0F172A', '#1E293B', '#312E81'],
      cosmic: ['#1E293B', '#312E81', '#6B46C1'],
      aurora: ['#8B5CF6', '#A78BFA', '#60A5FA'],
      sunset: ['#F59E0B', '#F97316', '#EF4444'],
      ocean: ['#0EA5E9', '#3B82F6', '#6366F1'],
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    full: 9999,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: 1.2,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    }
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    medium: {
      shadowColor: '#3B82F6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    strong: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 12,
    },
    glow: {
      shadowColor: '#60A5FA',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 15,
    }
  },
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
      slower: 800,
      slowest: 1200,
    },
    spring: {
      gentle: { damping: 20, stiffness: 150 },
      bouncy: { damping: 15, stiffness: 200 },
      snappy: { damping: 25, stiffness: 300 },
    }
  }
};

// Glassmorphism Card Component
interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
  onPress?: () => void;
  haptic?: boolean;
}

export function GlassCard({ children, style, intensity = 'medium', onPress, haptic = true }: GlassCardProps) {
  const scale = useSharedValue(1);
  
  const intensityMap = {
    light: designTokens.colors.glass.background,
    medium: designTokens.colors.glass.backgroundStrong,
    strong: 'rgba(255, 255, 255, 0.2)',
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, designTokens.animations.spring.snappy);
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, designTokens.animations.spring.bouncy);
  };

  const cardContent = (
    <Animated.View style={[styles.glassCard, { backgroundColor: intensityMap[intensity] }, style, animatedStyle]}>
      <BlurView intensity={20} style={StyleSheet.absoluteFill} />
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
}

// Modern Button Component
interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: React.ComponentType<any>;
  style?: ViewStyle;
}

export function ModernButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  icon: Icon,
  style 
}: ModernButtonProps) {
  const scale = useSharedValue(1);
  
  const sizeMap = {
    sm: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 14 },
    md: { paddingHorizontal: 24, paddingVertical: 12, fontSize: 16 },
    lg: { paddingHorizontal: 32, paddingVertical: 16, fontSize: 18 },
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, designTokens.animations.spring.snappy);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, designTokens.animations.spring.bouncy);
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.modernButton, sizeMap[size], style];
    
    switch (variant) {
      case 'primary':
        return [...baseStyle, styles.primaryButton];
      case 'secondary':
        return [...baseStyle, styles.secondaryButton];
      case 'ghost':
        return [...baseStyle, styles.ghostButton];
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText, { fontSize: sizeMap[size].fontSize }];
    
    switch (variant) {
      case 'ghost':
        return [...baseStyle, { color: designTokens.colors.text.accent }];
      default:
        return [...baseStyle, { color: designTokens.colors.text.primary }];
    }
  };

  if (variant === 'gradient') {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[disabled && styles.disabled]}
      >
        <Animated.View style={animatedStyle}>
          <LinearGradient
            colors={designTokens.colors.gradients.aurora}
            style={[styles.modernButton, sizeMap[size], style]}
          >
            <View style={styles.buttonContent}>
              {Icon && <Icon size={20} color={designTokens.colors.text.primary} />}
              <Text style={getTextStyle()}>{title}</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[disabled && styles.disabled]}
    >
      <Animated.View style={[getButtonStyle(), animatedStyle]}>
        <View style={styles.buttonContent}>
          {Icon && <Icon size={20} color={designTokens.colors.text.primary} />}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// Floating Action Element
interface FloatingActionProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function FloatingAction({ children, onPress, style }: FloatingActionProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, designTokens.animations.spring.snappy);
    translateY.value = withSpring(2, designTokens.animations.spring.snappy);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, designTokens.animations.spring.bouncy);
    translateY.value = withSpring(0, designTokens.animations.spring.bouncy);
  };

  const content = (
    <Animated.View style={[styles.floatingAction, style, animatedStyle]}>
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

// Particle System Component
interface ParticleSystemProps {
  count?: number;
  color?: string;
  size?: number;
  animate?: boolean;
}

export function ParticleSystem({ count = 12, color = '#60A5FA', size = 2, animate = true }: ParticleSystemProps) {
  const particles = Array.from({ length: count }, (_, i) => i);

  return (
    <View style={styles.particleContainer}>
      {particles.map((_, index) => (
        <ParticleElement key={index} color={color} size={size} animate={animate} delay={index * 100} />
      ))}
    </View>
  );
}

function ParticleElement({ color, size, animate, delay }: { color: string; size: number; animate: boolean; delay: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);

  React.useEffect(() => {
    if (animate) {
      opacity.value = withTiming(Math.random() * 0.8 + 0.2, { duration: 1000 });
      translateY.value = withTiming(Math.random() * -50 - 20, { duration: 2000 + delay });
      scale.value = withTiming(Math.random() * 0.5 + 0.5, { duration: 1500 });
    }
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          width: size,
          height: size,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  glassCard: {
    borderRadius: designTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
    padding: designTokens.spacing.md,
    ...designTokens.shadows.medium,
    overflow: 'hidden',
  },
  
  modernButton: {
    borderRadius: designTokens.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...designTokens.shadows.soft,
  },

  primaryButton: {
    backgroundColor: designTokens.colors.accent.blue,
  },

  secondaryButton: {
    backgroundColor: designTokens.colors.glass.backgroundStrong,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
  },

  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: designTokens.colors.text.accent,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },

  buttonText: {
    fontWeight: designTokens.typography.fontWeight.semibold as any,
    color: designTokens.colors.text.primary,
  },

  disabled: {
    opacity: 0.5,
  },

  floatingAction: {
    borderRadius: designTokens.borderRadius.full,
    padding: designTokens.spacing.md,
    backgroundColor: designTokens.colors.glass.backgroundStrong,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
    ...designTokens.shadows.glow,
  },

  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },

  particle: {
    position: 'absolute',
    borderRadius: designTokens.borderRadius.full,
    opacity: 0,
  },
});

// Animation Helpers
export const animationHelpers = {
  fadeIn: (value: Animated.SharedValue<number>, duration = 300) => {
    value.value = withTiming(1, { duration });
  },
  
  fadeOut: (value: Animated.SharedValue<number>, duration = 300) => {
    value.value = withTiming(0, { duration });
  },
  
  scaleIn: (value: Animated.SharedValue<number>, duration = 300) => {
    value.value = withSpring(1, designTokens.animations.spring.bouncy);
  },
  
  scaleOut: (value: Animated.SharedValue<number>, duration = 300) => {
    value.value = withSpring(0, designTokens.animations.spring.snappy);
  },
  
  slideUp: (value: Animated.SharedValue<number>, distance = 50, duration = 400) => {
    value.value = withTiming(-distance, { duration });
  },
  
  slideDown: (value: Animated.SharedValue<number>, distance = 50, duration = 400) => {
    value.value = withTiming(distance, { duration });
  },
};

// Export default design tokens for easy access
export default designTokens; 