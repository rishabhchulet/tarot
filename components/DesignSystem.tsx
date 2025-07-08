import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate
} from 'react-native-reanimated';

// PROPER DARK DESIGN TOKENS - Inspired by modern apps like the references
export const designTokens = {
  colors: {
    // Dark background system - much cleaner
    background: {
      primary: '#0A0A0B',        // Deep black base
      secondary: '#151518',      // Slightly lighter panels
      tertiary: '#1C1C20',       // Card backgrounds
      elevated: '#242428',       // Elevated elements
    },
    
    // High contrast text for excellent readability
    text: {
      primary: '#FFFFFF',        // Pure white for headings
      secondary: '#E5E5E7',      // High contrast for body text
      muted: '#8E8E93',          // Subtle for secondary info
      disabled: '#636366',       // Disabled states
    },
    
    // Refined accent colors - more sophisticated
    accent: {
      primary: '#007AFF',        // iOS blue - trustworthy
      purple: '#5856D6',         // Refined purple
      gold: '#FFD60A',           // Warmer gold
      rose: '#FF3B30',           // Clean red
      mint: '#00C896',           // Success green
      orange: '#FF9500',         // Warning orange
    },
    
    // Subtle glassmorphism - much more tasteful
    glass: {
      background: 'rgba(255, 255, 255, 0.03)',  // Very subtle
      border: 'rgba(255, 255, 255, 0.08)',      // Minimal border
      elevated: 'rgba(255, 255, 255, 0.06)',    // Slightly more for elevation
      active: 'rgba(255, 255, 255, 0.1)',       // Active states
    },
    
    // Clean gradients - no more busy backgrounds
    gradients: {
      main: ['#0A0A0B', '#151518'],              // Subtle dark gradient
      card: ['#1C1C20', '#242428'],              // Card gradients
      primary: ['#007AFF', '#5856D6'],           // Primary action
      accent: ['#5856D6', '#007AFF'],            // Accent elements
    },
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
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
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
    sm: 6,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  
  shadows: {
    // Subtle shadows for depth without distraction
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    },
  },
  
  animations: {
    spring: {
      gentle: { damping: 20, stiffness: 300 },
      bouncy: { damping: 15, stiffness: 400 },
    },
    timing: {
      fast: { duration: 200 },
      normal: { duration: 300 },
      slow: { duration: 500 },
    },
  },
};

// Animation helpers
export const animationHelpers = {
  fadeIn: (value: Animated.SharedValue<number>, duration = 300) => {
    value.value = withTiming(1, { duration });
  },
  
  fadeOut: (value: Animated.SharedValue<number>, duration = 300) => {
    value.value = withTiming(0, { duration });
  },
  
  scale: (value: Animated.SharedValue<number>, scale = 1.05, duration = 200) => {
    value.value = withSequence(
      withTiming(scale, { duration }),
      withTiming(1, { duration })
    );
  },
};

// CLEAN GLASS CARD - Much more subtle and readable
interface GlassCardProps {
  children: React.ReactNode;
  style?: any;
  intensity?: 'light' | 'medium' | 'strong';
}

export function GlassCard({ children, style, intensity = 'medium' }: GlassCardProps) {
  const backgroundOpacity = {
    light: designTokens.colors.glass.background,
    medium: designTokens.colors.glass.elevated,
    strong: designTokens.colors.glass.active,
  };

  return (
    <View style={[
      styles.glassCard,
      { backgroundColor: backgroundOpacity[intensity] },
      style
    ]}>
      {children}
    </View>
  );
}

// SUBTLE FLOATING ACTION - No more overwhelming effects
interface FloatingActionProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
}

export function FloatingAction({ children, onPress, style, disabled }: FloatingActionProps) {
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: opacityValue.value,
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scaleValue.value = withTiming(0.95, designTokens.animations.timing.fast);
      opacityValue.value = withTiming(0.8, designTokens.animations.timing.fast);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scaleValue.value = withTiming(1, designTokens.animations.timing.fast);
      opacityValue.value = withTiming(1, designTokens.animations.timing.fast);
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[styles.floatingAction, animatedStyle, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// MODERN BUTTON COMPONENT
interface ModernButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: any;
}

export function ModernButton({ 
  children, 
  onPress, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  style 
}: ModernButtonProps) {
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: opacityValue.value,
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scaleValue.value = withTiming(0.96, designTokens.animations.timing.fast);
      opacityValue.value = withTiming(0.8, designTokens.animations.timing.fast);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scaleValue.value = withTiming(1, designTokens.animations.timing.fast);
      opacityValue.value = withTiming(1, designTokens.animations.timing.fast);
    }
  };

  const buttonStyle = [
    styles.modernButton,
    styles[`modernButton${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`modernButton${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    disabled && styles.modernButtonDisabled,
    style
  ];

  const textStyle = [
    styles.modernButtonText,
    styles[`modernButtonText${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    disabled && styles.modernButtonTextDisabled
  ];

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View style={animatedStyle}>
          <LinearGradient
            colors={designTokens.colors.gradients.primary}
            style={buttonStyle}
          >
            <Text style={textStyle}>{children}</Text>
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
    >
      <Animated.View style={[buttonStyle, animatedStyle]}>
        <Text style={textStyle}>{children}</Text>
      </Animated.View>
    </Pressable>
  );
}

// MINIMAL PARTICLE SYSTEM - Much more subtle
interface ParticleSystemProps {
  count?: number;
  animate?: boolean;
}

export function ParticleSystem({ count = 6, animate = true }: ParticleSystemProps) {
  if (!animate) return null;

  return (
    <View style={styles.particleContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <ParticleElement key={index} index={index} />
      ))}
    </View>
  );
}

function ParticleElement({ index }: { index: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.5);

  React.useEffect(() => {
    const delay = index * 200;
    
    setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.1, { duration: 2000 }),
          withTiming(0, { duration: 2000 })
        ),
        -1,
        false
      );
      
      translateY.value = withRepeat(
        withTiming(-20, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      
      scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0.5, { duration: 2000 })
        ),
        -1,
        false
      );
    }, delay);
  }, [index]);

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
        animatedStyle,
        {
          left: Math.random() * 300 + 50,
          top: Math.random() * 600 + 100,
        }
      ]}
    >
      <View style={styles.particleDot} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
    overflow: 'hidden',
    ...designTokens.shadows.sm,
  },
  
  floatingAction: {
    // Minimal styling - let the content define the appearance
  },
  
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
  },
  
  particleDot: {
    width: 4,
    height: 4,
    backgroundColor: designTokens.colors.accent.primary,
    borderRadius: 2,
    opacity: 0.3,
  },
  
  // Modern Button Styles
  modernButton: {
    borderRadius: designTokens.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  modernButtonSm: {
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    minHeight: 36,
  },
  
  modernButtonMd: {
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
    minHeight: 44,
  },
  
  modernButtonLg: {
    paddingHorizontal: designTokens.spacing.xl,
    paddingVertical: designTokens.spacing.lg,
    minHeight: 52,
  },
  
  modernButtonPrimary: {
    // Gradient applied via LinearGradient component
  },
  
  modernButtonSecondary: {
    backgroundColor: designTokens.colors.background.tertiary,
    borderWidth: 1,
    borderColor: designTokens.colors.glass.border,
  },
  
  modernButtonGhost: {
    backgroundColor: 'transparent',
  },
  
  modernButtonDisabled: {
    opacity: 0.5,
  },
  
  modernButtonText: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  
  modernButtonTextPrimary: {
    color: designTokens.colors.text.primary,
  },
  
  modernButtonTextSecondary: {
    color: designTokens.colors.text.secondary,
  },
  
  modernButtonTextGhost: {
    color: designTokens.colors.accent.primary,
  },
  
  modernButtonTextDisabled: {
    opacity: 0.6,
  },
}); 